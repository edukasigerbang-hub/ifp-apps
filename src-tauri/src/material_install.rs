use crate::db::DbState;
use crate::error::AppError;
use crate::license::canonical_value;
use crate::material::{self, MaterialState, MaterialView};
use crate::material_manifest::{
    self, is_material_id, MaterialManifest, MAX_BUNDLE_BYTES,
};
use base64::{
    engine::general_purpose::{URL_SAFE, URL_SAFE_NO_PAD},
    Engine as _,
};
use ed25519_dalek::{Signature, VerifyingKey};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{Cursor, Read};
use std::path::Path;
use tauri::State;
use zip::ZipArchive;

const MAX_ENTRIES: usize = 5000;
const MANIFEST_NAME: &str = "material.json";

#[derive(Clone)]
pub struct MaterialKey {
    pub key_id: String,
    pub public_key: VerifyingKey,
}

/// Kunci publik penandatangan materi — terpisah dari kunci lisensi (kontrak §2).
pub struct MaterialKeyring {
    pub keys: Vec<MaterialKey>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct KeyEntry {
    key_id: String,
    public_key: String,
}

impl MaterialKeyring {
    pub fn from_env() -> Self {
        let keys = std::env::var("IFP_CONTENT_KEYS")
            .ok()
            .or_else(|| option_env!("IFP_CONTENT_KEYS").map(str::to_string))
            .and_then(|raw| serde_json::from_str::<Vec<KeyEntry>>(&raw).ok())
            .map(|entries| {
                entries
                    .into_iter()
                    .filter_map(|entry| {
                        let bytes = URL_SAFE_NO_PAD
                            .decode(&entry.public_key)
                            .or_else(|_| URL_SAFE.decode(&entry.public_key))
                            .or_else(|_| {
                                base64::engine::general_purpose::STANDARD.decode(&entry.public_key)
                            })
                            .ok()?;
                        let array: [u8; 32] = bytes.try_into().ok()?;
                        let public_key = VerifyingKey::from_bytes(&array).ok()?;
                        Some(MaterialKey {
                            key_id: entry.key_id,
                            public_key,
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();

        Self { keys }
    }
}

/// Tanda tangan bundel (kontrak §5): dari sidecar `.sig` atau dari item katalog.
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BundleSignature {
    pub key_id: String,
    pub algorithm: String,
    pub value: String,
}

/// Harapan dari katalog: bundel yang diunduh harus berisi materi dan digest ZIP ini.
pub struct ExpectedBundle<'a> {
    pub material_id: &'a str,
    pub version: &'a str,
    pub bundle_sha256: &'a str,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallInput {
    pub bundle_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallResult {
    pub material_id: String,
    pub version: String,
    pub previous_version: Option<String>,
    pub title: String,
    pub files: usize,
    pub bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledMaterial {
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub summary: String,
    pub grade_levels: Vec<u32>,
    pub subjects: Vec<String>,
    pub estimated_minutes: u32,
    pub review_status: String,
    pub size_bytes: u64,
    pub installed_at: String,
}

fn hex_digest(data: &[u8]) -> String {
    Sha256::digest(data)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn read_signature_file(path: &Path) -> Result<BundleSignature, AppError> {
    let raw = fs::read(path).map_err(|_| {
        AppError::material_signature_invalid(
            "Berkas tanda tangan (.sig) tidak ditemukan di samping bundel.",
        )
    })?;
    serde_json::from_slice(&raw)
        .map_err(|_| AppError::material_signature_invalid("Berkas tanda tangan tidak valid."))
}

fn read_archive(bytes: &[u8]) -> Result<HashMap<String, Vec<u8>>, AppError> {
    let mut archive = ZipArchive::new(Cursor::new(bytes))
        .map_err(|_| AppError::material_invalid("Bundel ZIP tidak valid."))?;
    if archive.len() > MAX_ENTRIES {
        return Err(AppError::material_invalid("Bundel memuat terlalu banyak entri."));
    }

    let mut entries = HashMap::new();
    let mut seen: HashSet<String> = HashSet::new();
    let mut total: u64 = 0;

    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .map_err(|_| AppError::material_invalid("Entri ZIP tidak dapat dibaca."))?;
        let name = entry
            .name()
            .map_err(|_| AppError::material_invalid("Nama entri ZIP tidak valid."))?
            .to_string();

        if entry.is_dir() {
            continue;
        }
        if entry
            .unix_mode()
            .is_some_and(|mode| mode & 0o170000 == 0o120000)
        {
            return Err(AppError::material_invalid("Bundel memuat symlink."));
        }
        material_manifest::validate_relative_path(&name)?;
        if material_manifest::bare_media_type(&name).is_none() {
            return Err(AppError::material_invalid(&format!(
                "Tipe berkas tidak diizinkan di bundel: {name}"
            )));
        }
        if !seen.insert(name.to_ascii_lowercase()) {
            return Err(AppError::material_invalid(&format!(
                "Path duplikat tanpa peduli huruf besar/kecil: {name}"
            )));
        }

        let declared = entry.size();
        total = total.saturating_add(declared);
        if total > MAX_BUNDLE_BYTES {
            return Err(AppError::material_too_large());
        }

        let mut bytes = Vec::with_capacity(declared.min(MAX_BUNDLE_BYTES) as usize);
        entry
            .read_to_end(&mut bytes)
            .map_err(|_| AppError::material_invalid("Entri ZIP tidak dapat dibaca."))?;
        if bytes.len() as u64 != declared {
            return Err(AppError::material_invalid("Ukuran entri ZIP tidak konsisten."));
        }
        entries.insert(name, bytes);
    }

    Ok(entries)
}

struct LoadedSignature {
    key: MaterialKey,
    signature: Signature,
}

fn load_signature(
    signature: &BundleSignature,
    keyring: &MaterialKeyring,
) -> Result<LoadedSignature, AppError> {
    if keyring.keys.is_empty() {
        return Err(AppError::material_signature_invalid(
            "Kunci publik materi belum dikonfigurasi.",
        ));
    }

    if signature.algorithm != "ed25519" {
        return Err(AppError::material_signature_invalid(
            "Algoritma tanda tangan tidak didukung.",
        ));
    }
    let key = keyring
        .keys
        .iter()
        .find(|key| key.key_id == signature.key_id)
        .cloned()
        .ok_or_else(|| AppError::material_signature_invalid("keyId materi tidak dikenal."))?;

    let bytes = URL_SAFE_NO_PAD
        .decode(&signature.value)
        .or_else(|_| URL_SAFE.decode(&signature.value))
        .map_err(|_| AppError::material_signature_invalid("Nilai tanda tangan tidak dapat dibaca."))?;
    let signature = Signature::from_slice(&bytes)
        .map_err(|_| AppError::material_signature_invalid("Panjang tanda tangan tidak valid."))?;

    Ok(LoadedSignature { key, signature })
}

fn verify_manifest(
    loaded: &LoadedSignature,
    manifest_bytes: &[u8],
) -> Result<MaterialManifest, AppError> {
    let value: serde_json::Value = serde_json::from_slice(manifest_bytes)
        .map_err(|_| AppError::material_invalid("material.json tidak valid."))?;
    let canonical = canonical_value(&value);
    loaded
        .key
        .public_key
        .verify_strict(canonical.as_bytes(), &loaded.signature)
        .map_err(|_| {
            AppError::material_signature_invalid("Tanda tangan manifest materi tidak valid.")
        })?;

    serde_json::from_slice(manifest_bytes)
        .map_err(|_| AppError::material_schema_unsupported("material.json tidak sesuai skema v1."))
}

/// Verifikasi tanda tangan atas byte manifest kanonik dengan `keyId` persis.
/// Dipakai jalur katalog untuk menolak item sebelum bundel diunduh.
pub fn verify_signed_manifest(
    signature: &BundleSignature,
    keyring: &MaterialKeyring,
    canonical_manifest: &[u8],
) -> Result<MaterialManifest, AppError> {
    let loaded = load_signature(signature, keyring)?;
    verify_manifest(&loaded, canonical_manifest)
}

fn activate(
    connection: &mut Connection,
    material_id: &str,
    version: &str,
    sha256: &str,
    size_bytes: u64,
) -> Result<Option<String>, AppError> {
    let transaction = connection.transaction().map_err(AppError::write)?;

    let previous: Option<String> = transaction
        .query_row(
            "SELECT version FROM material_install WHERE material_id = ?1 AND state = 'active'",
            [material_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;

    transaction
        .execute(
            "UPDATE material_install SET state = 'superseded'
             WHERE material_id = ?1 AND state = 'active'",
            [material_id],
        )
        .map_err(AppError::write)?;

    transaction
        .execute(
            "INSERT INTO material_install
               (material_id, version, sha256, size_bytes, state, installed_at)
             VALUES (?1, ?2, ?3, ?4, 'active',
                     strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(material_id, version) DO UPDATE SET
               state = 'active',
               sha256 = excluded.sha256,
               size_bytes = excluded.size_bytes,
               installed_at = excluded.installed_at",
            params![material_id, version, sha256, size_bytes as i64],
        )
        .map_err(AppError::write)?;

    transaction.commit().map_err(AppError::write)?;
    Ok(previous)
}

pub fn install_bundle(
    connection: &mut Connection,
    root: &Path,
    keyring: &MaterialKeyring,
    bundle_path: &Path,
    app_version: &str,
) -> Result<InstallResult, AppError> {
    let metadata = fs::metadata(bundle_path)
        .map_err(|_| AppError::material_not_found("Bundel materi tidak ditemukan."))?;
    if !metadata.is_file() {
        return Err(AppError::material_not_found("Bundel materi bukan berkas."));
    }
    if metadata.len() > MAX_BUNDLE_BYTES {
        return Err(AppError::material_too_large());
    }

    let signature = read_signature_file(&bundle_path.with_extension("sig"))?;
    let bytes = fs::read(bundle_path)
        .map_err(|_| AppError::material_invalid("Bundel tidak dapat dibaca."))?;
    install_from_bytes(connection, root, keyring, &bytes, &signature, app_version, None)
}

/// Pemasangan dari byte ZIP (jalur lokal maupun unduhan katalog). `expected`
/// memaksa isi bundel sama dengan item katalog yang diminta (kontrak §7).
pub fn install_from_bytes(
    connection: &mut Connection,
    root: &Path,
    keyring: &MaterialKeyring,
    zip_bytes: &[u8],
    signature: &BundleSignature,
    app_version: &str,
    expected: Option<ExpectedBundle<'_>>,
) -> Result<InstallResult, AppError> {
    if zip_bytes.len() as u64 > MAX_BUNDLE_BYTES {
        return Err(AppError::material_too_large());
    }
    if let Some(expected) = &expected {
        if !is_material_id(expected.material_id)
            || !material_manifest::is_semver(expected.version)
            || expected.bundle_sha256.len() != 64
        {
            return Err(AppError::material_invalid("Item katalog tidak valid."));
        }
        if hex_digest(zip_bytes) != expected.bundle_sha256.to_ascii_lowercase() {
            return Err(AppError::material_hash_mismatch(
                "SHA-256 bundel unduhan tidak cocok dengan katalog.",
            ));
        }
    }

    let signature = load_signature(signature, keyring)?;
    let entries = read_archive(zip_bytes)?;
    let manifest_bytes = entries
        .get(MANIFEST_NAME)
        .ok_or_else(|| AppError::material_invalid("Bundel tidak memuat material.json."))?
        .clone();
    let manifest = verify_manifest(&signature, &manifest_bytes)?;
    material_manifest::validate(&manifest, app_version)?;
    if let Some(expected) = &expected {
        if manifest.material_id != expected.material_id || manifest.version != expected.version {
            return Err(AppError::material_invalid("Isi bundel tidak sama dengan item katalog."));
        }
    }

    let mut listed: HashSet<&str> = HashSet::new();
    let mut total_bytes: u64 = 0;

    // Draft Studio menempati folder yang sama dengan bundel terpasang
    // (materials/<id>/<version>/), jadi instalasi tidak boleh menimbunnya.
    let draft_exists: Option<i64> = connection
        .query_row(
            "SELECT 1 FROM material_draft WHERE material_id = ?1 AND version = ?2",
            params![manifest.material_id, manifest.version],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if draft_exists.is_some() {
        return Err(AppError::material_invalid(
            "Versi ini sedang dipakai draft di Studio Materi. Hapus draft lebih dulu atau terbitkan versi lain.",
        ));
    }

    for file in &manifest.files {
        if !listed.insert(file.path.as_str()) {
            return Err(AppError::material_invalid("Manifest memuat path berkas duplikat."));
        }
        let bytes = entries.get(&file.path).ok_or_else(|| {
            AppError::material_invalid(&format!("Berkas manifest tidak ada di bundel: {}", file.path))
        })?;
        if bytes.len() as u64 != file.bytes || hex_digest(bytes) != file.sha256.to_ascii_lowercase()
        {
            return Err(AppError::material_hash_mismatch(&format!(
                "SHA-256 atau ukuran tidak cocok: {}",
                file.path
            )));
        }
        if material_manifest::is_text_source(&file.path) {
            material_manifest::ensure_self_contained(&file.path, bytes)?;
        }
        total_bytes = total_bytes.saturating_add(file.bytes);
    }
    for name in entries.keys() {
        if name == MANIFEST_NAME {
            continue;
        }
        if !listed.contains(name.as_str()) {
            return Err(AppError::material_invalid(&format!(
                "Berkas tidak terdaftar di manifest: {name}"
            )));
        }
    }

    let destination = root.join(&manifest.material_id).join(&manifest.version);
    if destination.exists() {
        return Err(AppError::material_invalid("Versi materi sudah terpasang di perangkat."));
    }
    let installed: Option<i64> = connection
        .query_row(
            "SELECT 1 FROM material_install WHERE material_id = ?1 AND version = ?2",
            params![manifest.material_id, manifest.version],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if installed.is_some() {
        return Err(AppError::material_invalid("Versi materi sudah terpasang di perangkat."));
    }

    let staging = root.join(".staging").join(uuid::Uuid::new_v4().to_string());
    fs::create_dir_all(&staging)
        .map_err(|_| AppError::material_invalid("Staging materi tidak dapat dibuat."))?;

    let staged = (|| -> Result<(), AppError> {
        for file in &manifest.files {
            let target = staging.join(&file.path);
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent)
                    .map_err(|_| AppError::material_invalid("Staging materi tidak dapat disiapkan."))?;
            }
            fs::write(&target, &entries[&file.path])
                .map_err(|_| AppError::material_invalid("Berkas materi gagal ditulis ke staging."))?;
        }
        fs::write(staging.join(MANIFEST_NAME), &manifest_bytes)
            .map_err(|_| AppError::material_invalid("Manifest materi gagal ditulis ke staging."))?;
        Ok(())
    })();
    if let Err(error) = staged {
        let _ = fs::remove_dir_all(&staging);
        return Err(error);
    }

    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent)
            .map_err(|_| AppError::material_invalid("Folder materi tidak dapat dibuat."))?;
    }
    if let Err(error) = fs::rename(&staging, &destination) {
        let _ = fs::remove_dir_all(&staging);
        return Err(AppError::material_invalid(&format!(
            "Aktivasi materi gagal: {error}"
        )));
    }
    let _ = fs::remove_dir(root.join(".staging"));

    let sha256 = hex_digest(&manifest_bytes);
    let previous = match activate(
        connection,
        &manifest.material_id,
        &manifest.version,
        &sha256,
        total_bytes,
    ) {
        Ok(previous) => previous,
        Err(error) => {
            let _ = fs::remove_dir_all(&destination);
            return Err(error);
        }
    };

    Ok(InstallResult {
        material_id: manifest.material_id,
        version: manifest.version,
        previous_version: previous,
        title: manifest.title,
        files: manifest.files.len(),
        bytes: total_bytes,
    })
}

fn read_installed_manifest(
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<MaterialManifest, AppError> {
    let path = root.join(material_id).join(version).join(MANIFEST_NAME);
    let bytes =
        fs::read(&path).map_err(|_| AppError::material_not_found("Manifest materi terpasang tidak ditemukan."))?;
    serde_json::from_slice(&bytes)
        .map_err(|_| AppError::material_invalid("Manifest materi terpasang tidak valid."))
}

pub fn list_installed(
    connection: &Connection,
    root: &Path,
) -> Result<Vec<InstalledMaterial>, AppError> {
    let mut statement = connection
        .prepare(
            "SELECT material_id, version, size_bytes, installed_at FROM material_install
             WHERE state = 'active'
             ORDER BY installed_at DESC, material_id ASC",
        )
        .map_err(AppError::read)?;

    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i64>(2)?,
                row.get::<_, String>(3)?,
            ))
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    let mut installed = Vec::new();
    for (material_id, version, size_bytes, installed_at) in rows {
        let manifest = read_installed_manifest(root, &material_id, &version)?;
        installed.push(InstalledMaterial {
            material_id,
            version,
            title: manifest.title,
            summary: manifest.summary,
            grade_levels: manifest.grade_levels,
            subjects: manifest.subjects,
            estimated_minutes: manifest.estimated_minutes,
            review_status: manifest.review_status,
            size_bytes: size_bytes.max(0) as u64,
            installed_at,
        });
    }

    Ok(installed)
}

pub fn open_installed(
    connection: &Connection,
    root: &Path,
    material_id: &str,
) -> Result<MaterialView, AppError> {
    if !is_material_id(material_id) {
        return Err(AppError::material_not_found("Materi tidak ditemukan."));
    }
    let version: Option<String> = connection
        .query_row(
            "SELECT version FROM material_install WHERE material_id = ?1 AND state = 'active'",
            [material_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    let version = version.ok_or_else(|| AppError::material_not_found("Materi belum terpasang."))?;

    let directory = root.join(material_id).join(&version);
    let view = material::open_material(root, &directory, material_id, &version)?;

    connection
        .execute(
            "UPDATE material_install
             SET last_opened_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
             WHERE material_id = ?1 AND version = ?2",
            params![material_id, version],
        )
        .map_err(AppError::write)?;

    Ok(view)
}

#[tauri::command]
pub fn material_install_bundle(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    keys: State<'_, MaterialKeyring>,
    input: InstallInput,
) -> Result<InstallResult, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    install_bundle(
        &mut connection,
        &material.root,
        &keys,
        Path::new(&input.bundle_path),
        env!("CARGO_PKG_VERSION"),
    )
}

#[tauri::command]
pub fn material_list_installed(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
) -> Result<Vec<InstalledMaterial>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_installed(&connection, &material.root)
}

#[tauri::command]
pub fn material_open_installed(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    material_id: String,
) -> Result<MaterialView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    open_installed(&connection, &material.root, &material_id)
}

/// Cover bundel terpasang sebagai data URL; `None` bila materi tidak terpasang,
/// cover tidak ada, atau berkasnya bukan gambar yang didukung.
#[tauri::command]
pub fn material_installed_cover(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    material_id: String,
) -> Result<Option<String>, AppError> {
    if !is_material_id(&material_id) {
        return Ok(None);
    }
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    let version: Option<String> = connection
        .query_row(
            "SELECT version FROM material_install WHERE material_id = ?1 AND state = 'active'",
            [&material_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    let Some(version) = version else {
        return Ok(None);
    };
    let directory = material.root.join(&material_id).join(version);
    Ok(material::cover_data_url(&material.root, &directory))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use ed25519_dalek::{Signer, SigningKey};
    use std::fs::File;
    use std::io::Write;
    use std::path::PathBuf;

    fn signing_key() -> SigningKey {
        SigningKey::from_bytes(&[9u8; 32])
    }

    fn keyring() -> MaterialKeyring {
        MaterialKeyring {
            keys: vec![MaterialKey {
                key_id: "content-dev-1".to_string(),
                public_key: signing_key().verifying_key(),
            }],
        }
    }

    fn temp_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("ifp-material-{name}-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp root");
        path
    }

    fn files() -> Vec<(&'static str, Vec<u8>)> {
        vec![
            (
                "index.html",
                b"<!doctype html><html><body><p>Siklus air.</p></body></html>".to_vec(),
            ),
            ("assets/cover.png", b"\x89PNG\r\n\x1a\ncontoh".to_vec()),
            ("transcript.txt", b"Transkrip contoh siklus air.\n".to_vec()),
        ]
    }

    fn manifest_of(version: &str, files: &[(&'static str, Vec<u8>)]) -> serde_json::Value {
        let entries: Vec<serde_json::Value> = files
            .iter()
            .map(|(path, bytes)| {
                serde_json::json!({
                    "path": path,
                    "mediaType": material_manifest::bare_media_type(path),
                    "bytes": bytes.len(),
                    "sha256": hex_digest(bytes),
                })
            })
            .collect();

        serde_json::json!({
            "schemaVersion": "1.0.0",
            "materialId": "materi-uji-1",
            "version": version,
            "title": "Materi Uji",
            "summary": "Bundel uji untuk penginstal materi.",
            "locale": "id-ID",
            "gradeLevels": [3],
            "subjects": ["ipas"],
            "topics": ["Siklus air"],
            "estimatedMinutes": 5,
            "entry": "index.html",
            "cover": "assets/cover.png",
            "transcriptPath": "transcript.txt",
            "accessibility": {
                "hasAudio": false,
                "keyboardNavigable": true,
                "supportsReducedMotion": true,
                "contrastChecked": true,
            },
            "completion": { "mode": "signal", "minDwellSeconds": 0 },
            "minAppVersion": "0.1.0",
            "publisher": { "name": "Gerbang Edukasi" },
            "reviewStatus": "reviewed",
            "files": entries,
        })
    }

    fn write_zip(path: &Path, manifest_bytes: &[u8], files: &[(&'static str, Vec<u8>)]) {
        let file = File::create(path).expect("create zip");
        let mut writer = zip::ZipWriter::new(file);
        let options = zip::write::SimpleFileOptions::default();
        writer.start_file("material.json", options).expect("start manifest");
        writer.write_all(manifest_bytes).expect("write manifest");
        for (name, bytes) in files {
            writer.start_file(*name, options).expect("start file");
            writer.write_all(bytes).expect("write file");
        }
        writer.finish().expect("finish zip");
    }

    fn write_signature(bundle: &Path, signed: &serde_json::Value) {
        let signature = signing_key().sign(canonical_value(signed).as_bytes());
        let sidecar = serde_json::json!({
            "keyId": "content-dev-1",
            "algorithm": "ed25519",
            "value": URL_SAFE_NO_PAD.encode(signature.to_bytes()),
        });
        fs::write(bundle.with_extension("sig"), serde_json::to_vec(&sidecar).expect("signature"))
            .expect("write signature");
    }

    fn compose(
        root: &Path,
        name: &str,
        manifest: &serde_json::Value,
        files: &[(&'static str, Vec<u8>)],
    ) -> PathBuf {
        let bundle = root.join(format!("{name}.zip"));
        write_zip(&bundle, canonical_value(manifest).as_bytes(), files);
        write_signature(&bundle, manifest);
        bundle
    }

    fn signed_bundle(root: &Path, name: &str, version: &str) -> PathBuf {
        let files = files();
        let manifest = manifest_of(version, &files);
        compose(root, name, &manifest, &files)
    }

    fn install(root: &Path, bundle: &Path) -> Result<InstallResult, AppError> {
        let mut connection = test_connection();
        install_bundle(&mut connection, root, &keyring(), bundle, "0.1.0")
    }

    #[test]
    fn installs_signed_bundle_and_opens_it() {
        let root = temp_root("install");
        let bundle = signed_bundle(&root, "materi", "1.0.0");

        let mut connection = test_connection();
        let result = install_bundle(&mut connection, &root, &keyring(), &bundle, "0.1.0")
            .expect("install");

        assert_eq!(result.material_id, "materi-uji-1");
        assert_eq!(result.version, "1.0.0");
        assert_eq!(result.previous_version, None);
        assert_eq!(result.files, 3);
        assert!(root.join("materi-uji-1/1.0.0/index.html").is_file());
        let staging = root.join(".staging");
        assert!(!staging.exists() || fs::read_dir(&staging).unwrap().count() == 0);

        let listed = list_installed(&connection, &root).expect("list");
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].title, "Materi Uji");
        assert_eq!(listed[0].grade_levels, vec![3]);

        let view = open_installed(&connection, &root, "materi-uji-1").expect("open");
        assert_eq!(view.entry_path, "materi-uji-1/1.0.0/index.html");
        assert!(view.transcript.contains("Transkrip contoh"));

        let opened: Option<String> = connection
            .query_row(
                "SELECT last_opened_at FROM material_install WHERE material_id = 'materi-uji-1'",
                [],
                |row| row.get(0),
            )
            .expect("last opened");
        assert!(opened.is_some());

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_tampered_manifest() {
        let root = temp_root("tamper");
        let files = files();
        let signed = manifest_of("1.0.0", &files);
        let mut written = signed.clone();
        written["title"] = serde_json::json!("Judul Palsu");
        let bundle = root.join("materi.zip");
        write_zip(&bundle, canonical_value(&written).as_bytes(), &files);
        write_signature(&bundle, &signed);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_SIGNATURE_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_file_hash_mismatch() {
        let root = temp_root("hash");
        let files = files();
        let manifest = manifest_of("1.0.0", &files);
        let mut tampered = files.clone();
        tampered[0].1.extend_from_slice(b"<!-- x -->");
        let bundle = compose(&root, "materi", &manifest, &tampered);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_HASH_MISMATCH");
        assert!(!root.join("materi-uji-1").exists());

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_extra_file() {
        let root = temp_root("extra");
        let mut files = files();
        files.push(("assets/evil.js", b"alert(1)".to_vec()));
        let manifest = manifest_of("1.0.0", &files[..3]);
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_path_traversal_entry() {
        let root = temp_root("traversal");
        let mut files = files();
        files.push(("../escape.txt", b"x".to_vec()));
        let manifest = manifest_of("1.0.0", &files[..3]);
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_case_insensitive_duplicate() {
        let root = temp_root("duplicate");
        let mut files = files();
        files.push(("Index.html", b"duplikat".to_vec()));
        let manifest = manifest_of("1.0.0", &files[..3]);
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_unknown_key_id() {
        let root = temp_root("key");
        let files = files();
        let manifest = manifest_of("1.0.0", &files);
        let bundle = compose(&root, "materi", &manifest, &files);
        let sidecar = serde_json::json!({
            "keyId": "content-lain",
            "algorithm": "ed25519",
            "value": URL_SAFE_NO_PAD.encode([0u8; 64]),
        });
        fs::write(bundle.with_extension("sig"), serde_json::to_vec(&sidecar).expect("sidecar"))
            .expect("write signature");

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_SIGNATURE_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_missing_signature() {
        let root = temp_root("nosig");
        let files = files();
        let manifest = manifest_of("1.0.0", &files);
        let bundle = root.join("materi.zip");
        write_zip(&bundle, canonical_value(&manifest).as_bytes(), &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_SIGNATURE_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_external_reference() {
        let root = temp_root("external");
        let mut files = files();
        files[0].1 =
            b"<!doctype html><html><body><script src=\"https://cdn.example/x.js\"></script></body></html>"
                .to_vec();
        let manifest = manifest_of("1.0.0", &files);
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_NOT_SELF_CONTAINED");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_incompatible_app_version() {
        let root = temp_root("appversion");
        let files = files();
        let mut manifest = manifest_of("1.0.0", &files);
        manifest["minAppVersion"] = serde_json::json!("9.9.9");
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_INCOMPATIBLE_APP");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_unsupported_schema_version() {
        let root = temp_root("schema");
        let files = files();
        let mut manifest = manifest_of("1.0.0", &files);
        manifest["schemaVersion"] = serde_json::json!("2.0.0");
        let bundle = compose(&root, "materi", &manifest, &files);

        let error = install(&root, &bundle).expect_err("must reject");
        assert_eq!(error.code, "MATERIAL_SCHEMA_UNSUPPORTED");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn supersedes_previous_version() {
        let root = temp_root("supersede");
        let v1 = signed_bundle(&root, "materi-v1", "1.0.0");
        let v2 = signed_bundle(&root, "materi-v2", "1.1.0");

        let mut connection = test_connection();
        install_bundle(&mut connection, &root, &keyring(), &v1, "0.1.0").expect("v1");
        let second = install_bundle(&mut connection, &root, &keyring(), &v2, "0.1.0").expect("v2");

        assert_eq!(second.previous_version.as_deref(), Some("1.0.0"));
        let states: Vec<(String, String)> = {
            let mut statement = connection
                .prepare("SELECT version, state FROM material_install ORDER BY version")
                .expect("prepare");
            statement
                .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
                .expect("query")
                .collect::<Result<Vec<_>, _>>()
                .expect("rows")
        };
        assert_eq!(
            states,
            vec![
                ("1.0.0".to_string(), "superseded".to_string()),
                ("1.1.0".to_string(), "active".to_string()),
            ]
        );

        let duplicate = install_bundle(&mut connection, &root, &keyring(), &v2, "0.1.0")
            .expect_err("duplicate");
        assert_eq!(duplicate.code, "MATERIAL_INVALID");

        let _ = fs::remove_dir_all(&root);
    }
}

/// Fixture bundel bertanda tangan untuk modul lain (katalog) tanpa memakai
/// berkas di disk. Hanya tersedia saat test.
#[cfg(test)]
pub(crate) mod test_factory {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    pub(crate) const MATERIAL_ID: &str = "materi-uji-1";

    pub(crate) fn keyring() -> MaterialKeyring {
        MaterialKeyring {
            keys: vec![MaterialKey {
                key_id: "content-dev-1".to_string(),
                public_key: SigningKey::from_bytes(&[9u8; 32]).verifying_key(),
            }],
        }
    }

    pub(crate) fn files() -> Vec<(&'static str, Vec<u8>)> {
        vec![
            (
                "index.html",
                b"<!doctype html><html><body><p>Siklus air.</p></body></html>".to_vec(),
            ),
            ("assets/cover.png", b"\x89PNG\r\n\x1a\ncontoh".to_vec()),
            ("transcript.txt", b"Transkrip contoh siklus air.\n".to_vec()),
        ]
    }

    pub(crate) fn manifest(version: &str, files: &[(&'static str, Vec<u8>)]) -> serde_json::Value {
        let entries: Vec<serde_json::Value> = files
            .iter()
            .map(|(path, bytes)| {
                serde_json::json!({
                    "path": path,
                    "mediaType": material_manifest::bare_media_type(path),
                    "bytes": bytes.len(),
                    "sha256": hex_digest(bytes),
                })
            })
            .collect();

        serde_json::json!({
            "schemaVersion": "1.0.0",
            "materialId": MATERIAL_ID,
            "version": version,
            "title": "Materi Uji",
            "summary": "Bundel uji untuk penginstal materi.",
            "locale": "id-ID",
            "gradeLevels": [3],
            "subjects": ["ipas"],
            "topics": ["Siklus air"],
            "estimatedMinutes": 5,
            "entry": "index.html",
            "cover": "assets/cover.png",
            "transcriptPath": "transcript.txt",
            "accessibility": {
                "hasAudio": false,
                "keyboardNavigable": true,
                "supportsReducedMotion": true,
                "contrastChecked": true,
            },
            "completion": { "mode": "signal", "minDwellSeconds": 0 },
            "minAppVersion": "0.1.0",
            "publisher": { "name": "Gerbang Edukasi" },
            "reviewStatus": "reviewed",
            "files": entries,
        })
    }

    pub(crate) fn zip_bytes(
        manifest: &serde_json::Value,
        files: &[(&'static str, Vec<u8>)],
    ) -> Vec<u8> {
        use std::io::Write;

        let mut buffer = Cursor::new(Vec::new());
        {
            let mut writer = zip::ZipWriter::new(&mut buffer);
            let options = zip::write::SimpleFileOptions::default();
            writer
                .start_file("material.json", options)
                .expect("start manifest");
            writer
                .write_all(canonical_value(manifest).as_bytes())
                .expect("write manifest");
            for (name, bytes) in files {
                writer.start_file(*name, options).expect("start file");
                writer.write_all(bytes).expect("write file");
            }
            writer.finish().expect("finish zip");
        }
        buffer.into_inner()
    }

    pub(crate) fn signature_of(manifest: &serde_json::Value) -> BundleSignature {
        let key = SigningKey::from_bytes(&[9u8; 32]);
        let signature = key.sign(canonical_value(manifest).as_bytes());
        BundleSignature {
            key_id: "content-dev-1".to_string(),
            algorithm: "ed25519".to_string(),
            value: URL_SAFE_NO_PAD.encode(signature.to_bytes()),
        }
    }

    pub(crate) fn hex(bytes: &[u8]) -> String {
        hex_digest(bytes)
    }
}
