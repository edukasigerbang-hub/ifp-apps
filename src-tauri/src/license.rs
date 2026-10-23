use crate::db::DbState;
use crate::error::AppError;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use chrono::{DateTime, Duration, Utc};
use ed25519_dalek::{Signature, VerifyingKey};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::Path;
use tauri::State;

const SUPPORTED_SCHEMA_VERSION: &str = "1.0.0";
const MAX_LICENSE_BYTES: u64 = 524_288;

#[derive(Clone)]
pub struct LicenseKey {
    pub key_id: String,
    pub public_key: VerifyingKey,
}

pub struct LicenseState {
    pub keys: Vec<LicenseKey>,
    pub product_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LicensePayload {
    pub schema_version: String,
    pub license_id: String,
    pub product_id: String,
    pub license_type: String,
    pub machine_id: String,
    #[serde(default)]
    pub device_key_thumbprint: Option<String>,
    pub issued_at: String,
    pub not_before: String,
    pub expires_at: Option<String>,
    #[serde(default)]
    pub offline_grace_days: i64,
    #[serde(default)]
    pub entitlements: Vec<String>,
    pub key_id: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LicenseFile {
    pub payload: LicensePayload,
    pub signature: String,
}

#[derive(Debug)]
pub struct VerifiedLicense {
    pub payload: LicensePayload,
    pub in_grace: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LicenseStatusView {
    pub configured: bool,
    pub valid: bool,
    pub license_id: Option<String>,
    pub license_type: Option<String>,
    pub product_id: Option<String>,
    pub expires_at: Option<String>,
    pub entitlements: Vec<String>,
    pub machine_id: String,
    pub in_grace: bool,
    pub code: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivationRequestView {
    pub schema_version: String,
    pub product_id: String,
    pub machine_id: String,
    pub request_id: String,
    pub nonce: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportLicenseInput {
    pub path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportLicenseJsonInput {
    pub json: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct KeyEntry {
    key_id: String,
    public_key: String,
}

impl LicenseState {
    pub fn from_env() -> Self {
        let keys = std::env::var("IFP_LICENSE_KEYS")
            .ok()
            .and_then(|raw| serde_json::from_str::<Vec<KeyEntry>>(&raw).ok())
            .map(|entries| {
                entries
                    .into_iter()
                    .filter_map(|entry| {
                        let bytes = STANDARD.decode(entry.public_key).ok()?;
                        let array: [u8; 32] = bytes.try_into().ok()?;
                        let public_key = VerifyingKey::from_bytes(&array).ok()?;
                        Some(LicenseKey {
                            key_id: entry.key_id,
                            public_key,
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();

        let product_id = std::env::var("IFP_LICENSE_PRODUCT_ID")
            .unwrap_or_else(|_| "ifp-learning".to_string());

        Self { keys, product_id }
    }
}

fn canonical_value(value: &Value) -> String {
    match value {
        Value::Object(map) => {
            let mut keys: Vec<&String> = map.keys().collect();
            keys.sort();
            let body = keys
                .iter()
                .map(|key| {
                    format!(
                        "{}:{}",
                        serde_json::to_string(key).unwrap_or_default(),
                        canonical_value(&map[*key])
                    )
                })
                .collect::<Vec<_>>()
                .join(",");
            format!("{{{body}}}")
        }
        Value::Array(items) => {
            let body = items.iter().map(canonical_value).collect::<Vec<_>>().join(",");
            format!("[{body}]")
        }
        Value::String(text) => serde_json::to_string(text).unwrap_or_default(),
        Value::Number(number) => number.to_string(),
        Value::Bool(boolean) => boolean.to_string(),
        Value::Null => "null".to_string(),
    }
}

fn canonical_payload(payload: &LicensePayload) -> Result<String, AppError> {
    let value = serde_json::to_value(payload)
        .map_err(|_| AppError::license_invalid("Payload lisensi tidak dapat diserialisasi."))?;
    Ok(canonical_value(&value))
}

fn parse_time(value: &str) -> Result<DateTime<Utc>, AppError> {
    DateTime::parse_from_rfc3339(value)
        .map(|parsed| parsed.with_timezone(&Utc))
        .map_err(|_| AppError::license_invalid("Waktu lisensi tidak valid."))
}

pub fn verify_license(
    file: &LicenseFile,
    keys: &[LicenseKey],
    product_id: &str,
    machine_id: &str,
    now: DateTime<Utc>,
) -> Result<VerifiedLicense, AppError> {
    let payload = &file.payload;

    if payload.schema_version != SUPPORTED_SCHEMA_VERSION {
        return Err(AppError::license_invalid("schemaVersion lisensi tidak didukung."));
    }
    if payload.product_id != product_id {
        return Err(AppError::license_wrong_product());
    }
    if payload.machine_id != machine_id {
        return Err(AppError::license_device_mismatch());
    }
    if payload.license_type != "perpetual" && payload.license_type != "subscription" {
        return Err(AppError::license_invalid("licenseType tidak dikenal."));
    }
    if payload.license_type == "perpetual" && payload.expires_at.is_some() {
        return Err(AppError::license_invalid("Lisensi perpetual tidak boleh memiliki expiresAt."));
    }

    let not_before = parse_time(&payload.not_before)?;
    if now < not_before {
        return Err(AppError::license_not_yet_valid());
    }

    let mut in_grace = false;
    if let Some(expires_at) = &payload.expires_at {
        let expires = parse_time(expires_at)?;
        let grace = Duration::days(payload.offline_grace_days.max(0));
        if now > expires + grace {
            return Err(AppError::license_expired());
        }
        in_grace = now > expires;
    }

    let key = keys
        .iter()
        .find(|candidate| candidate.key_id == payload.key_id)
        .ok_or_else(|| AppError::license_invalid("keyId lisensi tidak dikenal."))?;

    let signature_bytes = STANDARD
        .decode(&file.signature)
        .map_err(|_| AppError::license_signature())?;
    let signature = Signature::from_slice(&signature_bytes).map_err(|_| AppError::license_signature())?;
    let canonical = canonical_payload(payload)?;

    key.public_key
        .verify_strict(canonical.as_bytes(), &signature)
        .map_err(|_| AppError::license_signature())?;

    Ok(VerifiedLicense {
        payload: payload.clone(),
        in_grace,
    })
}

fn store_license(
    connection: &Connection,
    raw: &str,
    verified: &VerifiedLicense,
    now: &str,
) -> Result<(), AppError> {
    let payload = &verified.payload;
    connection
        .execute(
            "INSERT INTO license_state
               (id, license_json, license_id, license_type, product_id, machine_id, key_id,
                expires_at, imported_at, last_verified_at)
             VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?8)
             ON CONFLICT(id) DO UPDATE SET
               license_json = excluded.license_json,
               license_id = excluded.license_id,
               license_type = excluded.license_type,
               product_id = excluded.product_id,
               machine_id = excluded.machine_id,
               key_id = excluded.key_id,
               expires_at = excluded.expires_at,
               imported_at = excluded.imported_at,
               last_verified_at = excluded.last_verified_at",
            params![
                raw,
                payload.license_id,
                payload.license_type,
                payload.product_id,
                payload.machine_id,
                payload.key_id,
                payload.expires_at,
                now
            ],
        )
        .map_err(AppError::write)?;
    Ok(())
}

fn load_stored_license(connection: &Connection) -> Result<Option<(String, LicenseFile)>, AppError> {
    let raw: Option<String> = connection
        .query_row("SELECT license_json FROM license_state WHERE id = 1", [], |row| {
            row.get(0)
        })
        .optional()
        .map_err(AppError::read)?;

    match raw {
        None => Ok(None),
        Some(raw) => {
            let file: LicenseFile = serde_json::from_str(&raw)
                .map_err(|_| AppError::license_invalid("Lisensi tersimpan rusak."))?;
            Ok(Some((raw, file)))
        }
    }
}

pub fn get_status(
    connection: &Connection,
    state: &LicenseState,
    now: DateTime<Utc>,
) -> Result<LicenseStatusView, AppError> {
    let machine_id = crate::sync::get_device_id(connection)?;
    let configured = !state.keys.is_empty();

    let mut view = LicenseStatusView {
        configured,
        valid: false,
        license_id: None,
        license_type: None,
        product_id: None,
        expires_at: None,
        entitlements: Vec::new(),
        machine_id,
        in_grace: false,
        code: None,
        message: None,
    };

    if !configured {
        view.code = Some("LICENSE_NOT_CONFIGURED".to_string());
        view.message = Some("Kunci publik lisensi belum dikonfigurasi.".to_string());
        return Ok(view);
    }

    let stored = load_stored_license(connection)?;
    let Some((_raw, file)) = stored else {
        view.code = Some("LICENSE_MISSING".to_string());
        view.message = Some("Belum ada lisensi terpasang.".to_string());
        return Ok(view);
    };

    view.license_id = Some(file.payload.license_id.clone());
    view.license_type = Some(file.payload.license_type.clone());
    view.product_id = Some(file.payload.product_id.clone());
    view.expires_at = file.payload.expires_at.clone();
    view.entitlements = file.payload.entitlements.clone();

    match verify_license(&file, &state.keys, &state.product_id, &view.machine_id, now) {
        Ok(verified) => {
            view.valid = true;
            view.in_grace = verified.in_grace;
            connection
                .execute(
                    "UPDATE license_state SET last_verified_at = ?1 WHERE id = 1",
                    [now.to_rfc3339()],
                )
                .map_err(AppError::write)?;
        }
        Err(error) => {
            view.code = Some(error.code.clone());
            view.message = Some(error.message.clone());
        }
    }

    Ok(view)
}

pub fn import_license_json(
    connection: &Connection,
    state: &LicenseState,
    raw: &str,
    now: DateTime<Utc>,
) -> Result<LicenseStatusView, AppError> {
    if state.keys.is_empty() {
        return Err(AppError::license_not_configured());
    }
    if raw.len() as u64 > MAX_LICENSE_BYTES {
        return Err(AppError::license_invalid("File lisensi terlalu besar."));
    }

    let file: LicenseFile =
        serde_json::from_str(raw).map_err(|_| AppError::license_invalid("Format lisensi tidak valid."))?;

    let machine_id = crate::sync::get_device_id(connection)?;
    let verified = verify_license(&file, &state.keys, &state.product_id, &machine_id, now)?;
    store_license(connection, raw, &verified, &now.to_rfc3339())?;

    get_status(connection, state, now)
}

pub fn import_license_file(
    connection: &Connection,
    state: &LicenseState,
    path: &Path,
    now: DateTime<Utc>,
) -> Result<LicenseStatusView, AppError> {
    if state.keys.is_empty() {
        return Err(AppError::license_not_configured());
    }

    let metadata = fs::metadata(path).map_err(|_| AppError::license_invalid("File lisensi tidak ditemukan."))?;
    if !metadata.is_file() || metadata.len() > MAX_LICENSE_BYTES {
        return Err(AppError::license_invalid("File lisensi tidak valid atau terlalu besar."));
    }

    let raw = fs::read_to_string(path).map_err(|_| AppError::license_invalid("File lisensi tidak dapat dibaca."))?;
    import_license_json(connection, state, &raw, now)
}

pub fn get_entitlements(
    connection: &Connection,
    state: &LicenseState,
    now: DateTime<Utc>,
) -> Result<Vec<String>, AppError> {
    let status = get_status(connection, state, now)?;
    Ok(if status.valid { status.entitlements } else { Vec::new() })
}

pub fn export_request(
    connection: &Connection,
    state: &LicenseState,
    now: DateTime<Utc>,
) -> Result<ActivationRequestView, AppError> {
    let machine_id = crate::sync::get_device_id(connection)?;
    Ok(ActivationRequestView {
        schema_version: SUPPORTED_SCHEMA_VERSION.to_string(),
        product_id: state.product_id.clone(),
        machine_id,
        request_id: uuid::Uuid::new_v4().to_string(),
        nonce: uuid::Uuid::new_v4().to_string(),
        created_at: now.to_rfc3339(),
    })
}

#[tauri::command]
pub fn license_get_machine_id(db: State<'_, DbState>) -> Result<String, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    crate::sync::get_device_id(&connection)
}

#[tauri::command]
pub fn license_get_status(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
) -> Result<LicenseStatusView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_status(&connection, &license, Utc::now())
}

#[tauri::command]
pub fn license_import_file(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
    input: ImportLicenseInput,
) -> Result<LicenseStatusView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    import_license_file(&connection, &license, Path::new(&input.path), Utc::now())
}

#[tauri::command]
pub fn license_import_json(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
    input: ImportLicenseJsonInput,
) -> Result<LicenseStatusView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    import_license_json(&connection, &license, &input.json, Utc::now())
}

#[tauri::command]
pub fn license_get_entitlements(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
) -> Result<Vec<String>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_entitlements(&connection, &license, Utc::now())
}

#[tauri::command]
pub fn license_export_request(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
) -> Result<ActivationRequestView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    export_request(&connection, &license, Utc::now())
}

#[tauri::command]
pub fn license_refresh(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
) -> Result<LicenseStatusView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_status(&connection, &license, Utc::now())
}

#[tauri::command]
pub fn license_activate_online() -> Result<LicenseStatusView, AppError> {
    Err(AppError::license_server_unavailable())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use ed25519_dalek::{Signer, SigningKey};

    fn signing_key() -> SigningKey {
        SigningKey::from_bytes(&[7u8; 32])
    }

    fn state() -> LicenseState {
        LicenseState {
            keys: vec![LicenseKey {
                key_id: "dev-1".to_string(),
                public_key: signing_key().verifying_key(),
            }],
            product_id: "ifp-learning".to_string(),
        }
    }

    fn now() -> DateTime<Utc> {
        DateTime::parse_from_rfc3339("2026-10-23T12:00:00Z")
            .expect("time")
            .with_timezone(&Utc)
    }

    fn payload(machine_id: &str) -> LicensePayload {
        LicensePayload {
            schema_version: "1.0.0".to_string(),
            license_id: "lic-1".to_string(),
            product_id: "ifp-learning".to_string(),
            license_type: "subscription".to_string(),
            machine_id: machine_id.to_string(),
            device_key_thumbprint: None,
            issued_at: "2026-10-01T00:00:00Z".to_string(),
            not_before: "2026-10-01T00:00:00Z".to_string(),
            expires_at: Some("2026-12-31T23:59:59Z".to_string()),
            offline_grace_days: 7,
            entitlements: vec!["core".to_string()],
            key_id: "dev-1".to_string(),
        }
    }

    fn sign(payload: &LicensePayload) -> LicenseFile {
        let canonical = canonical_payload(payload).expect("canonical");
        let signature = signing_key().sign(canonical.as_bytes());
        LicenseFile {
            payload: payload.clone(),
            signature: STANDARD.encode(signature.to_bytes()),
        }
    }

    fn verify(file: &LicenseFile, machine_id: &str, at: DateTime<Utc>) -> Result<VerifiedLicense, AppError> {
        verify_license(file, &state().keys, "ifp-learning", machine_id, at)
    }

    #[test]
    fn accepts_valid_subscription() {
        let file = sign(&payload("machine-1"));
        let verified = verify(&file, "machine-1", now()).expect("valid");
        assert!(!verified.in_grace);
        assert_eq!(verified.payload.entitlements, vec!["core"]);
    }

    #[test]
    fn accepts_grace_period() {
        let file = sign(&payload("machine-1"));
        let in_grace = DateTime::parse_from_rfc3339("2027-01-03T00:00:00Z")
            .expect("time")
            .with_timezone(&Utc);
        let verified = verify(&file, "machine-1", in_grace).expect("grace");
        assert!(verified.in_grace);
    }

    #[test]
    fn rejects_after_grace() {
        let file = sign(&payload("machine-1"));
        let expired = DateTime::parse_from_rfc3339("2027-01-08T00:00:00Z")
            .expect("time")
            .with_timezone(&Utc);
        let error = verify(&file, "machine-1", expired).expect_err("expired");
        assert_eq!(error.code, "LICENSE_EXPIRED");
    }

    #[test]
    fn rejects_not_yet_valid() {
        let file = sign(&payload("machine-1"));
        let early = DateTime::parse_from_rfc3339("2026-09-01T00:00:00Z")
            .expect("time")
            .with_timezone(&Utc);
        let error = verify(&file, "machine-1", early).expect_err("early");
        assert_eq!(error.code, "LICENSE_NOT_YET_VALID");
    }

    #[test]
    fn rejects_wrong_machine() {
        let file = sign(&payload("machine-1"));
        let error = verify(&file, "machine-2", now()).expect_err("machine");
        assert_eq!(error.code, "LICENSE_DEVICE_MISMATCH");
    }

    #[test]
    fn rejects_wrong_product() {
        let mut payload = payload("machine-1");
        payload.product_id = "other-product".to_string();
        let file = sign(&payload);
        let error = verify(&file, "machine-1", now()).expect_err("product");
        assert_eq!(error.code, "LICENSE_WRONG_PRODUCT");
    }

    #[test]
    fn rejects_tampered_payload() {
        let mut file = sign(&payload("machine-1"));
        file.payload.entitlements = vec!["premium".to_string()];
        let error = verify(&file, "machine-1", now()).expect_err("tampered");
        assert_eq!(error.code, "LICENSE_SIGNATURE_INVALID");
    }

    #[test]
    fn rejects_unknown_key_id() {
        let mut payload = payload("machine-1");
        payload.key_id = "unknown".to_string();
        let file = sign(&payload);
        let error = verify(&file, "machine-1", now()).expect_err("key");
        assert_eq!(error.code, "LICENSE_INVALID");
    }

    #[test]
    fn accepts_perpetual_license() {
        let mut payload = payload("machine-1");
        payload.license_type = "perpetual".to_string();
        payload.expires_at = None;
        let file = sign(&payload);
        let verified = verify(&file, "machine-1", now()).expect("perpetual");
        assert!(!verified.in_grace);
    }

    #[test]
    fn imports_and_reports_status_from_database() {
        let connection = test_connection();
        let machine_id = crate::sync::get_device_id(&connection).expect("machine id");
        let file = sign(&payload(&machine_id));
        let raw = serde_json::to_string(&file).expect("serialize");

        let path = std::env::temp_dir().join(format!("ifp-license-{}.json", uuid::Uuid::new_v4()));
        fs::write(&path, raw).expect("write license");

        let state = state();
        let status = import_license_file(&connection, &state, &path, now()).expect("import");
        assert!(status.valid);
        assert_eq!(status.entitlements, vec!["core"]);

        let entitlements = get_entitlements(&connection, &state, now()).expect("entitlements");
        assert_eq!(entitlements, vec!["core"]);

        let expired = DateTime::parse_from_rfc3339("2027-02-01T00:00:00Z")
            .expect("time")
            .with_timezone(&Utc);
        let status = get_status(&connection, &state, expired).expect("status");
        assert!(!status.valid);
        assert_eq!(status.code.as_deref(), Some("LICENSE_EXPIRED"));

        let _ = fs::remove_file(&path);
    }

    #[test]
    fn status_without_configuration_is_not_valid() {
        let connection = test_connection();
        let machine_id = crate::sync::get_device_id(&connection).expect("machine id");
        let empty = LicenseState {
            keys: Vec::new(),
            product_id: "ifp-learning".to_string(),
        };
        let status = get_status(&connection, &empty, now()).expect("status");
        assert!(!status.configured);
        assert!(!status.valid);
        assert_eq!(status.code.as_deref(), Some("LICENSE_NOT_CONFIGURED"));
        assert_eq!(status.machine_id, machine_id);
    }
}
