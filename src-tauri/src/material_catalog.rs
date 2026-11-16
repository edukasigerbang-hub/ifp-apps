//! Katalog materi daring (ADR-0035 tahap 3b).
//!
//! Alur: `GET /v1/materials` (JSON, ETag, cache SQLite) → pengguna memilih item →
//! unduh URL pre-signed → verifikasi ukuran + `bundleSha256` → pemasang yang sama
//! dengan jalur ZIP lokal (`material_install::install_from_bytes`).
//!
//! URL pre-signed dari Worker berumur 10 menit sehingga **tidak pernah** dipakai
//! ulang: setiap pemasangan mengambil halaman katalog baru.

use crate::app_meta;
use crate::db::DbState;
use crate::error::AppError;
use crate::license::canonical_value;
use crate::material::{image_data_url, MaterialState};
use crate::material_install::{
    self, BundleSignature, ExpectedBundle, InstallResult, MaterialKeyring,
};
use crate::material_manifest::{self, is_material_id, MaterialManifest, MAX_BUNDLE_BYTES};
use chrono::{SecondsFormat, Utc};
use reqwest::blocking::{Client, Response};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::io::Read;
use std::time::Duration;
use tauri::State;

const BASE_URL_KEY: &str = "material_catalog_base_url";
const CACHE_KEY_PREFIX: &str = "catalog:";
const MAX_CATALOG_BYTES: usize = 2 * 1024 * 1024;
const MAX_COVER_BYTES: usize = 2 * 1024 * 1024;
const DEFAULT_LIMIT: u8 = 50;
const MAX_LIMIT: u8 = 100;
const MAX_CURSOR_LENGTH: usize = 256;
const MAX_SUBJECT_LENGTH: usize = 40;
const CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
const REQUEST_TIMEOUT: Duration = Duration::from_secs(60);

fn client() -> Result<&'static Client, AppError> {
    static CLIENT: std::sync::OnceLock<Option<Client>> = std::sync::OnceLock::new();
    CLIENT
        .get_or_init(|| {
            Client::builder()
                .connect_timeout(CONNECT_TIMEOUT)
                .timeout(REQUEST_TIMEOUT)
                .redirect(reqwest::redirect::Policy::limited(5))
                .user_agent(concat!("ifp-apps/", env!("CARGO_PKG_VERSION")))
                .build()
                .ok()
        })
        .as_ref()
        .ok_or_else(|| AppError::material_fetch_failed("Klien katalog tidak dapat disiapkan."))
}

fn now_iso() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true)
}

fn is_loopback(host: Option<&str>) -> bool {
    matches!(host, Some("localhost") | Some("127.0.0.1") | Some("[::1]") | Some("::1"))
}

fn is_subject_slug(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= MAX_SUBJECT_LENGTH
        && value
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
}

/// Hanya https, atau http ke loopback untuk server referensi/E2E.
fn parse_http_url(raw: &str, field: &str) -> Result<reqwest::Url, AppError> {
    let url = reqwest::Url::parse(raw.trim())
        .map_err(|_| AppError::material_invalid(&format!("{field} bukan URL yang valid.")))?;
    match url.scheme() {
        "https" => {}
        "http" if is_loopback(url.host_str()) => {}
        _ => {
            return Err(AppError::material_invalid(&format!(
                "{field} harus https (http hanya untuk localhost)."
            )));
        }
    }
    Ok(url)
}

fn validate_http_url(raw: &str, field: &str) -> Result<String, AppError> {
    let url = parse_http_url(raw, field)?;
    if url.query().is_some() || url.fragment().is_some() {
        return Err(AppError::material_invalid(&format!(
            "{field} tidak boleh memuat query atau fragmen."
        )));
    }
    Ok(raw.trim().trim_end_matches('/').to_string())
}

/// URL unduhan pre-signed (kontrak §6) memang membawa token di query; fragmen tetap ditolak.
fn validate_download_url(raw: &str) -> Result<String, AppError> {
    let url = parse_http_url(raw, "URL unduhan")?;
    if url.fragment().is_some() {
        return Err(AppError::material_invalid(
            "URL unduhan tidak boleh memuat fragmen.",
        ));
    }
    Ok(raw.trim().to_string())
}

#[derive(Debug, Default, Clone, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct CatalogQuery {
    pub grade: Option<u8>,
    pub subject: Option<String>,
    pub cursor: Option<String>,
    pub limit: Option<u8>,
}

impl CatalogQuery {
    fn limit(&self) -> u8 {
        self.limit.unwrap_or(DEFAULT_LIMIT).clamp(1, MAX_LIMIT)
    }

    fn validate(&self) -> Result<(), AppError> {
        if let Some(grade) = self.grade {
            if !(1..=6).contains(&grade) {
                return Err(AppError::validation("Kelas katalog harus 1–6."));
            }
        }
        if let Some(subject) = &self.subject {
            if !is_subject_slug(subject) {
                return Err(AppError::validation("Mapel katalog tidak valid."));
            }
        }
        if let Some(cursor) = &self.cursor {
            if cursor.is_empty()
                || cursor.len() > MAX_CURSOR_LENGTH
                || !cursor
                    .chars()
                    .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
            {
                return Err(AppError::validation("Cursor katalog tidak valid."));
            }
        }
        Ok(())
    }

    fn cache_key(&self) -> String {
        format!(
            "{CACHE_KEY_PREFIX}grade={}&subject={}&cursor={}&limit={}",
            self.grade.map(|value| value.to_string()).unwrap_or_default(),
            self.subject.as_deref().unwrap_or_default(),
            self.cursor.as_deref().unwrap_or_default(),
            self.limit()
        )
    }

    fn request_url(&self, base: &str) -> String {
        let mut url = format!("{base}/v1/materials?limit={}", self.limit());
        if let Some(grade) = self.grade {
            url.push_str(&format!("&grade={grade}"));
        }
        if let Some(subject) = &self.subject {
            url.push_str(&format!("&subject={subject}"));
        }
        if let Some(cursor) = &self.cursor {
            url.push_str(&format!("&cursor={cursor}"));
        }
        url
    }
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RawItem {
    material_id: String,
    version: String,
    published_at: String,
    updated_at: String,
    size_bytes: u64,
    bundle_sha256: String,
    download_url: String,
    /// URL pre-signed cover (opsional, §6 kontrak v1). Katalog lama tanpa field ini
    /// tetap sah; UI lalu memakai placeholder.
    #[serde(default)]
    cover_url: Option<String>,
    signature: BundleSignature,
    material: Value,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct RawPage {
    schema_version: String,
    generated_at: String,
    items: Vec<RawItem>,
    next_cursor: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogItemView {
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub summary: String,
    pub grade_levels: Vec<u32>,
    pub subjects: Vec<String>,
    pub topics: Vec<String>,
    pub estimated_minutes: u32,
    pub review_status: String,
    pub size_bytes: u64,
    pub published_at: String,
    pub updated_at: String,
    pub installed_version: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogPageView {
    pub schema_version: String,
    pub generated_at: String,
    pub items: Vec<CatalogItemView>,
    pub next_cursor: Option<String>,
    pub stale: bool,
    pub cached_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogConfig {
    pub base_url: Option<String>,
    pub source: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogConfigInput {
    #[serde(default)]
    pub base_url: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogInstallInput {
    pub material_id: String,
    pub version: String,
    #[serde(default)]
    pub query: CatalogQuery,
}

struct CachedPage {
    etag: Option<String>,
    body: String,
    fetched_at: String,
}

enum FetchOutcome {
    Page(RawPage, Option<String>),
    NotModified,
}

fn read_cache(connection: &Connection, key: &str) -> Result<Option<CachedPage>, AppError> {
    connection
        .query_row(
            "SELECT etag, body, fetched_at FROM material_catalog_cache WHERE cache_key = ?1",
            [key],
            |row| {
                Ok(CachedPage {
                    etag: row.get(0)?,
                    body: row.get(1)?,
                    fetched_at: row.get(2)?,
                })
            },
        )
        .optional()
        .map_err(AppError::read)
}

fn write_cache(
    connection: &Connection,
    key: &str,
    etag: Option<&str>,
    page: &RawPage,
) -> Result<(), AppError> {
    let body = serde_json::to_string(&page_without_download_url(page))
        .map_err(|_| AppError::material_fetch_failed("Katalog tidak dapat disimpan."))?;
    connection
        .execute(
            "INSERT INTO material_catalog_cache (cache_key, etag, body, fetched_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(cache_key) DO UPDATE SET
               etag = excluded.etag,
               body = excluded.body,
               fetched_at = excluded.fetched_at",
            params![key, etag, body, now_iso()],
        )
        .map_err(AppError::write)?;
    Ok(())
}

/// `downloadUrl` dan `coverUrl` adalah URL pre-signed berumur pendek dan tidak
/// boleh disimpan (OD-12).
fn page_without_download_url(page: &RawPage) -> Value {
    let mut value = serde_json::to_value(page).unwrap_or(Value::Null);
    if let Some(items) = value.get_mut("items").and_then(Value::as_array_mut) {
        for item in items {
            if let Some(object) = item.as_object_mut() {
                object.insert("downloadUrl".to_string(), Value::String(String::new()));
                object.insert("coverUrl".to_string(), Value::Null);
            }
        }
    }
    value
}

fn read_capped(reader: impl Read, limit: usize, too_large: AppError) -> Result<Vec<u8>, AppError> {
    let mut buffer = Vec::new();
    let mut chunk = [0u8; 16384];
    let mut reader = reader;
    loop {
        let read = reader
            .read(&mut chunk)
            .map_err(|_| AppError::material_fetch_failed("Respons terputus di tengah unduhan."))?;
        if read == 0 {
            return Ok(buffer);
        }
        buffer.extend_from_slice(&chunk[..read]);
        if buffer.len() > limit {
            return Err(too_large);
        }
    }
}

fn error_message(raw: &[u8]) -> String {
    serde_json::from_slice::<Value>(raw)
        .ok()
        .and_then(|value| {
            value
                .get("error")
                .and_then(|error| error.get("message"))
                .and_then(Value::as_str)
                .map(str::to_string)
        })
        .unwrap_or_else(|| "tanpa pesan".to_string())
}

fn fetch_page(
    base: &str,
    query: &CatalogQuery,
    etag: Option<&str>,
) -> Result<FetchOutcome, AppError> {
    let mut request = client()?.get(query.request_url(base)).header("accept", "application/json");
    if let Some(etag) = etag {
        request = request.header("if-none-match", etag);
    }
    let response: Response = request
        .send()
        .map_err(|_| AppError::material_fetch_failed("Katalog tidak dapat dihubungi."))?;

    if response.status().as_u16() == 304 {
        return Ok(FetchOutcome::NotModified);
    }
    if response.status().as_u16() != 200 {
        let status = response.status().as_u16();
        let raw = read_capped(response, 64 * 1024, AppError::material_fetch_failed("Respons katalog terlalu besar."))
            .unwrap_or_default();
        return Err(AppError::material_fetch_failed(&format!(
            "Katalog menolak permintaan ({status}): {}",
            error_message(&raw)
        )));
    }

    let next_etag = response
        .headers()
        .get("etag")
        .and_then(|value| value.to_str().ok())
        .map(str::to_string);
    let raw = read_capped(
        response,
        MAX_CATALOG_BYTES,
        AppError::material_fetch_failed("Respons katalog terlalu besar."),
    )?;
    let page: RawPage = serde_json::from_slice(&raw)
        .map_err(|_| AppError::material_fetch_failed("Respons katalog tidak sesuai skema v1."))?;
    if !page.schema_version.starts_with("1.") {
        return Err(AppError::material_fetch_failed(
            "Versi skema katalog tidak didukung aplikasi ini.",
        ));
    }
    if page.items.len() > MAX_LIMIT as usize {
        return Err(AppError::material_fetch_failed("Katalog mengembalikan terlalu banyak item."));
    }
    Ok(FetchOutcome::Page(page, next_etag))
}

fn download_bundle(url: &str, size_bytes: u64) -> Result<Vec<u8>, AppError> {
    if size_bytes > MAX_BUNDLE_BYTES {
        return Err(AppError::material_too_large());
    }
    let validated = validate_download_url(url)?;
    let response = client()?
        .get(&validated)
        .send()
        .map_err(|_| AppError::material_fetch_failed("Bundel materi gagal diunduh."))?;
    if response.status().as_u16() != 200 {
        return Err(AppError::material_fetch_failed(&format!(
            "Unduhan bundel ditolak server ({}).",
            response.status().as_u16()
        )));
    }
    if let Some(length) = response.content_length() {
        if length != size_bytes {
            return Err(AppError::material_fetch_failed(
                "Ukuran bundel dari server tidak cocok dengan katalog.",
            ));
        }
    }
    let bytes = read_capped(
        response,
        MAX_BUNDLE_BYTES as usize,
        AppError::material_too_large(),
    )?;
    if bytes.len() as u64 != size_bytes {
        return Err(AppError::material_fetch_failed(
            "Ukuran bundel dari server tidak cocok dengan katalog.",
        ));
    }
    Ok(bytes)
}

fn installed_versions(connection: &Connection) -> Result<HashMap<String, String>, AppError> {
    let mut statement = connection
        .prepare("SELECT material_id, version FROM material_install WHERE state = 'active'")
        .map_err(AppError::read)?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;
    Ok(rows.into_iter().collect())
}

fn item_view(item: &RawItem, installed: &HashMap<String, String>) -> CatalogItemView {
    let manifest: Option<MaterialManifest> = serde_json::from_value(item.material.clone()).ok();
    let installed_version = installed.get(&item.material_id).cloned();
    CatalogItemView {
        material_id: item.material_id.clone(),
        version: item.version.clone(),
        title: manifest
            .as_ref()
            .map(|value| value.title.clone())
            .unwrap_or_default(),
        summary: manifest
            .as_ref()
            .map(|value| value.summary.clone())
            .unwrap_or_default(),
        grade_levels: manifest
            .as_ref()
            .map(|value| value.grade_levels.clone())
            .unwrap_or_default(),
        subjects: manifest
            .as_ref()
            .map(|value| value.subjects.clone())
            .unwrap_or_default(),
        topics: manifest
            .as_ref()
            .map(|value| value.topics.clone())
            .unwrap_or_default(),
        estimated_minutes: manifest
            .as_ref()
            .map(|value| value.estimated_minutes)
            .unwrap_or(0),
        review_status: manifest
            .as_ref()
            .map(|value| value.review_status.clone())
            .unwrap_or_default(),
        size_bytes: item.size_bytes,
        published_at: item.published_at.clone(),
        updated_at: item.updated_at.clone(),
        installed_version,
    }
}

fn page_view(
    page: &RawPage,
    installed: &HashMap<String, String>,
    stale: bool,
    cached_at: Option<String>,
) -> CatalogPageView {
    CatalogPageView {
        schema_version: page.schema_version.clone(),
        generated_at: page.generated_at.clone(),
        items: page
            .items
            .iter()
            .map(|item| item_view(item, installed))
            .collect(),
        next_cursor: page.next_cursor.clone(),
        stale,
        cached_at,
    }
}

fn resolve_base_url(connection: &Connection) -> Result<(Option<String>, String), AppError> {
    if let Some(stored) = app_meta::get(connection, BASE_URL_KEY)? {
        let trimmed = stored.trim();
        if !trimmed.is_empty() {
            return Ok((Some(trimmed.to_string()), "setting".to_string()));
        }
    }
    if let Some(from_env) = std::env::var("IFP_CATALOG_URL").ok() {
        let trimmed = from_env.trim();
        if !trimmed.is_empty() {
            return Ok((Some(trimmed.to_string()), "env".to_string()));
        }
    }
    Ok((None, "none".to_string()))
}

fn configured_base(connection: &Connection) -> Result<String, AppError> {
    let (base, _) = resolve_base_url(connection)?;
    let base = base.ok_or_else(|| {
        AppError::material_invalid(
            "Alamat katalog daring belum diatur. Isi kolom alamat katalog lebih dulu.",
        )
    })?;
    validate_http_url(&base, "Alamat katalog")
}

pub fn list_catalog(
    connection: &Connection,
    query: &CatalogQuery,
) -> Result<CatalogPageView, AppError> {
    query.validate()?;
    let base = configured_base(connection)?;
    let key = query.cache_key();
    let cached = read_cache(connection, &key)?;

    match fetch_page(&base, query, cached.as_ref().and_then(|row| row.etag.as_deref())) {
        Ok(FetchOutcome::Page(page, etag)) => {
            write_cache(connection, &key, etag.as_deref(), &page)?;
            let installed = installed_versions(connection)?;
            Ok(page_view(&page, &installed, false, None))
        }
        Ok(FetchOutcome::NotModified) => {
            let cached = cached.ok_or_else(|| {
                AppError::material_fetch_failed("Katalog menjawab 304 tanpa cache lokal.")
            })?;
            let page: RawPage = serde_json::from_str(&cached.body).map_err(|_| {
                AppError::material_fetch_failed("Cache katalog rusak dan perlu dimuat ulang.")
            })?;
            let installed = installed_versions(connection)?;
            Ok(page_view(&page, &installed, false, Some(cached.fetched_at)))
        }
        Err(error) => match cached {
            Some(cached) => {
                let page: RawPage = serde_json::from_str(&cached.body).map_err(|_| error)?;
                let installed = installed_versions(connection)?;
                Ok(page_view(&page, &installed, true, Some(cached.fetched_at)))
            }
            None => Err(error),
        },
    }
}

pub fn install_from_catalog(
    connection: &mut Connection,
    root: &std::path::Path,
    keyring: &MaterialKeyring,
    input: &CatalogInstallInput,
    app_version: &str,
) -> Result<InstallResult, AppError> {
    input.query.validate()?;
    if !is_material_id(&input.material_id) || !material_manifest::is_semver(&input.version) {
        return Err(AppError::material_invalid("Materi katalog tidak valid."));
    }
    let base = configured_base(connection)?;

    let page = match fetch_page(&base, &input.query, None)? {
        FetchOutcome::Page(page, _) => page,
        FetchOutcome::NotModified => {
            return Err(AppError::material_fetch_failed(
                "Katalog menjawab 304 saat memasang materi.",
            ));
        }
    };
    let item = page
        .items
        .into_iter()
        .find(|item| item.material_id == input.material_id && item.version == input.version)
        .ok_or_else(|| AppError::material_not_found("Materi tidak ada di halaman katalog ini."))?;

    // Tanda tangan diperiksa SEBELUM mengunduh supaya katalog palsu tidak
    // menghabiskan kuota perangkat.
    let canonical = canonical_value(&item.material);
    let manifest = material_install::verify_signed_manifest(
        &item.signature,
        keyring,
        canonical.as_bytes(),
    )?;
    material_manifest::validate(&manifest, app_version)?;
    if manifest.material_id != input.material_id || manifest.version != input.version {
        return Err(AppError::material_invalid("Item katalog tidak konsisten dengan manifestnya."));
    }

    let bytes = download_bundle(&item.download_url, item.size_bytes)?;
    material_install::install_from_bytes(
        connection,
        root,
        keyring,
        &bytes,
        &item.signature,
        app_version,
        Some(ExpectedBundle {
            material_id: &input.material_id,
            version: &input.version,
            bundle_sha256: &item.bundle_sha256,
        }),
    )
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogCoverInput {
    pub material_id: String,
    pub version: String,
    #[serde(default)]
    pub query: CatalogQuery,
}

/// Cover item katalog sebagai data URL. Cover bersifat kosmetik: katalog tanpa
/// `coverUrl`, HTTP gagal, byte bukan gambar, atau ukuran melebihi batas
/// menghasilkan `None` supaya daftar tetap tampil.
pub fn cover_from_catalog(
    connection: &Connection,
    input: &CatalogCoverInput,
) -> Result<Option<String>, AppError> {
    if !is_material_id(&input.material_id) || !material_manifest::is_semver(&input.version) {
        return Ok(None);
    }
    let base = configured_base(connection)?;
    let page = match fetch_page(&base, &input.query, None) {
        Ok(FetchOutcome::Page(page, _)) => page,
        Ok(FetchOutcome::NotModified) => return Ok(None),
        Err(_) => return Ok(None),
    };
    let item = page
        .items
        .into_iter()
        .find(|item| item.material_id == input.material_id && item.version == input.version);
    let Some(item) = item else {
        return Ok(None);
    };
    let Some(url) = item.cover_url else {
        return Ok(None);
    };
    Ok(download_cover(&url))
}

fn download_cover(url: &str) -> Option<String> {
    let validated = validate_download_url(url).ok()?;
    let response = client().ok()?.get(&validated).send().ok()?;
    if response.status().as_u16() != 200 {
        return None;
    }
    let bytes = read_capped(
        response,
        MAX_COVER_BYTES,
        AppError::material_fetch_failed("Cover materi terlalu besar."),
    )
    .ok()?;
    image_data_url(&bytes)
}

#[tauri::command]
pub fn material_catalog_cover(
    db: State<'_, DbState>,
    input: CatalogCoverInput,
) -> Result<Option<String>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    cover_from_catalog(&connection, &input)
}

#[tauri::command]
pub fn material_catalog_config_get(db: State<'_, DbState>) -> Result<CatalogConfig, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    let (base_url, source) = resolve_base_url(&connection)?;
    Ok(CatalogConfig { base_url, source })
}

#[tauri::command]
pub fn material_catalog_config_set(
    db: State<'_, DbState>,
    input: CatalogConfigInput,
) -> Result<CatalogConfig, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    let trimmed = input.base_url.trim();
    if trimmed.is_empty() {
        app_meta::set(&connection, BASE_URL_KEY, "")?;
    } else {
        let validated = validate_http_url(trimmed, "Alamat katalog")?;
        app_meta::set(&connection, BASE_URL_KEY, &validated)?;
    }
    let (base_url, source) = resolve_base_url(&connection)?;
    Ok(CatalogConfig { base_url, source })
}

#[tauri::command]
pub fn material_catalog_list(
    db: State<'_, DbState>,
    input: CatalogQuery,
) -> Result<CatalogPageView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_catalog(&connection, &input)
}

#[tauri::command]
pub fn material_catalog_install(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    keys: State<'_, MaterialKeyring>,
    input: CatalogInstallInput,
) -> Result<InstallResult, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    install_from_catalog(
        &mut connection,
        &material.root,
        &keys,
        &input,
        env!("CARGO_PKG_VERSION"),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use crate::material_install::test_factory::{self, MATERIAL_ID};
    use serde_json::json;
    use std::io::Write as _;
    use std::net::TcpListener;
    use std::path::PathBuf;

    struct TestServer {
        port: u16,
    }

    /// Server HTTP minimal: cukup untuk menguji alur katalog tanpa menambah dependensi.
    /// `build` menerima port yang sudah terikat supaya fixture bisa memuat URL unduhan
    /// yang menunjuk server itu sendiri.
    fn serve_with<F>(build: F) -> TestServer
    where
        F: FnOnce(u16) -> Vec<(String, u16, Vec<u8>)>,
    {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind");
        let port = listener.local_addr().expect("addr").port();
        let routes = std::sync::Arc::new(build(port));
        std::thread::spawn(move || {
            for stream in listener.incoming() {
                let Ok(mut stream) = stream else { continue };
                let routes = routes.clone();
                std::thread::spawn(move || {
                    let mut request = Vec::new();
                    let mut chunk = [0u8; 1024];
                    loop {
                        match stream.read(&mut chunk) {
                            Ok(0) => return,
                            Ok(read) => {
                                request.extend_from_slice(&chunk[..read]);
                                if request.windows(4).any(|window| window == b"\r\n\r\n") {
                                    break;
                                }
                                if request.len() > 65536 {
                                    return;
                                }
                            }
                            Err(_) => return,
                        }
                    }
                    let text = String::from_utf8_lossy(&request);
                    let path = text
                        .lines()
                        .next()
                        .and_then(|line| line.split_whitespace().nth(1))
                        .unwrap_or("/")
                        .split('?')
                        .next()
                        .unwrap_or("")
                        .to_string();
                    let found = routes.iter().find(|(route, _, _)| *route == path);
                    let mut response = match found {
                        Some((_, status, body)) => {
                            let mut head = format!(
                                "HTTP/1.1 {status} OK\r\nContent-Length: {}\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n",
                                body.len()
                            )
                            .into_bytes();
                            head.extend_from_slice(body);
                            head
                        }
                        None => b"HTTP/1.1 404 Not Found\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}"
                            .to_vec(),
                    };
                    let _ = stream.write_all(&mut response);
                    let _ = stream.flush();
                });
            }
        });
        TestServer { port }
    }

    fn temp_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "ifp-catalog-{name}-{}",
            uuid::Uuid::new_v4()
        ));
        std::fs::create_dir_all(&path).expect("temp root");
        path
    }

    struct CatalogDoc {
        value: Value,
        zip: Vec<u8>,
    }

    fn catalog_doc(version: &str, bundle_sha256: Option<String>) -> CatalogDoc {
        let files = test_factory::files();
        let manifest = test_factory::manifest(version, &files);
        let zip = test_factory::zip_bytes(&manifest, &files);
        let digest = bundle_sha256.unwrap_or_else(|| test_factory::hex(&zip));
        let value = json!({
            "schemaVersion": "1.0.0",
            "generatedAt": "2026-10-28T06:00:00.000Z",
            "items": [{
                "materialId": MATERIAL_ID,
                "version": version,
                "publishedAt": "2026-10-28T05:00:00.000Z",
                "updatedAt": "2026-10-28T05:00:00.000Z",
                "sizeBytes": zip.len(),
                "bundleSha256": digest,
                "downloadUrl": "",
                "signature": test_factory::signature_of(&manifest),
                "material": manifest,
            }],
            "nextCursor": null,
        });
        CatalogDoc { value, zip }
    }

    fn point_catalog_at(connection: &Connection, port: u16) {
        app_meta::set(
            connection,
            BASE_URL_KEY,
            &format!("http://127.0.0.1:{port}"),
        )
        .expect("base url");
    }

    fn install_once(connection: &mut Connection, root: &PathBuf, query: CatalogQuery) -> Result<InstallResult, AppError> {
        install_from_catalog(
            connection,
            root,
            &test_factory::keyring(),
            &CatalogInstallInput {
                material_id: MATERIAL_ID.to_string(),
                version: "1.0.0".to_string(),
                query,
            },
            "0.1.0",
        )
    }

    #[test]
    fn rejects_remote_plain_http_and_query_strings() {
        assert!(validate_http_url("https://katalog.gerbang.example", "Alamat").is_ok());
        assert!(validate_http_url("http://127.0.0.1:8789", "Alamat").is_ok());
        assert_eq!(
            validate_http_url("http://katalog.example", "Alamat")
                .expect_err("http remote")
                .code,
            "MATERIAL_INVALID"
        );
        assert_eq!(
            validate_http_url("https://katalog.example?x=1", "Alamat")
                .expect_err("query")
                .code,
            "MATERIAL_INVALID"
        );
    }

    #[test]
    fn accepts_presigned_download_urls_but_not_fragments() {
        assert_eq!(
            validate_download_url("https://storage.example/materi.zip?token=abc").expect("presigned"),
            "https://storage.example/materi.zip?token=abc"
        );
        assert_eq!(
            validate_download_url("http://127.0.0.1:8789/bundles/materi.zip?token=dev")
                .expect("loopback"),
            "http://127.0.0.1:8789/bundles/materi.zip?token=dev"
        );
        assert_eq!(
            validate_download_url("https://storage.example/materi.zip#bagian")
                .expect_err("fragmen")
                .code,
            "MATERIAL_INVALID"
        );
        assert_eq!(
            validate_download_url("http://storage.example/materi.zip?token=abc")
                .expect_err("http remote")
                .code,
            "MATERIAL_INVALID"
        );
    }

    #[test]
    fn builds_request_url_and_cache_key() {
        let query = CatalogQuery {
            grade: Some(3),
            subject: Some("ipas".to_string()),
            cursor: None,
            limit: Some(200),
        };
        assert_eq!(
            query.request_url("https://k.example"),
            "https://k.example/v1/materials?limit=100&grade=3&subject=ipas"
        );
        assert_eq!(
            query.cache_key(),
            "catalog:grade=3&subject=ipas&cursor=&limit=100"
        );
        assert!(query.validate().is_ok());
        assert!(
            CatalogQuery {
                grade: Some(9),
                ..CatalogQuery::default()
            }
            .validate()
            .is_err()
        );
    }

    #[test]
    fn returns_cover_data_url_from_catalog_item() {
        const COVER: &[u8] = b"RIFF\x00\x00\x00\x00WEBPVP8 ";
        let doc = catalog_doc("1.0.0", None);
        let server = serve_with(|port| {
            let mut value = doc.value.clone();
            value["items"][0]["coverUrl"] = json!(format!(
                "http://127.0.0.1:{port}/covers/materi.webp?token=uji"
            ));
            vec![
                (
                    "/v1/materials".to_string(),
                    200,
                    serde_json::to_vec(&value).expect("json"),
                ),
                ("/covers/materi.webp".to_string(), 200, COVER.to_vec()),
            ]
        });
        let connection = test_connection();
        point_catalog_at(&connection, server.port);

        let data_url = cover_from_catalog(
            &connection,
            &CatalogCoverInput {
                material_id: MATERIAL_ID.to_string(),
                version: "1.0.0".to_string(),
                query: CatalogQuery::default(),
            },
        )
        .expect("cover")
        .expect("ada cover");
        assert!(data_url.starts_with("data:image/webp;base64,"));
    }

    #[test]
    fn skips_cover_when_item_has_none_or_bytes_are_not_images() {
        const NOT_IMAGE: &[u8] = b"<html>bukan gambar</html>";
        let doc = catalog_doc("1.0.0", None);
        let server = serve_with(|port| {
            let mut junk = doc.value.clone();
            junk["items"][0]["coverUrl"] = json!(format!(
                "http://127.0.0.1:{port}/covers/rusak.webp?token=uji"
            ));
            vec![
                (
                    "/v1/materials".to_string(),
                    200,
                    serde_json::to_vec(&junk).expect("json"),
                ),
                ("/covers/rusak.webp".to_string(), 200, NOT_IMAGE.to_vec()),
            ]
        });
        let connection = test_connection();
        point_catalog_at(&connection, server.port);

        // Byte bukan gambar → data URL tidak dibuat (thumbnail memakai placeholder).
        let input = CatalogCoverInput {
            material_id: MATERIAL_ID.to_string(),
            version: "1.0.0".to_string(),
            query: CatalogQuery::default(),
        };
        assert!(cover_from_catalog(&connection, &input)
            .expect("cover")
            .is_none());

        // Item tanpa `coverUrl` (katalog lama) juga menghasilkan None.
        let page: Value = json!({
            "schemaVersion": "1.0.0",
            "generatedAt": "2026-10-28T06:00:00.000Z",
            "items": [{
                "materialId": MATERIAL_ID,
                "version": "1.0.0",
                "publishedAt": "2026-10-28T05:00:00.000Z",
                "updatedAt": "2026-10-28T05:00:00.000Z",
                "sizeBytes": 1,
                "bundleSha256": "0",
                "downloadUrl": "",
                "signature": { "keyId": "uji", "algorithm": "ed25519", "value": "AA" },
                "material": {},
            }],
            "nextCursor": null,
        });
        let parsed: RawPage = serde_json::from_value(page).expect("tanpa coverUrl tetap sah");
        assert!(parsed.items[0].cover_url.is_none());
    }

    #[test]
    fn cache_never_keeps_presigned_url() {
        let connection = test_connection();
        let doc = catalog_doc("1.0.0", None);
        let mut value = doc.value.clone();
        value["items"][0]["downloadUrl"] = json!("https://storage.example/berkas?token=rahasia");
        value["items"][0]["coverUrl"] = json!("https://storage.example/cover.webp?token=rahasia");
        let page: RawPage = serde_json::from_value(value).expect("page");

        write_cache(&connection, "catalog:uji", Some("\"etag-1\""), &page).expect("write");
        let cached = read_cache(&connection, "catalog:uji").expect("read").expect("row");

        assert!(!cached.body.contains("rahasia"));
        assert!(!cached.body.contains("storage.example"));
        assert_eq!(cached.etag.as_deref(), Some("\"etag-1\""));
        let stored: RawPage = serde_json::from_str(&cached.body).expect("parse cache");
        assert_eq!(stored.items.len(), 1);
        assert!(stored.items[0].download_url.is_empty());
        assert!(stored.items[0].cover_url.is_none());
    }

    #[test]
    fn lists_and_installs_from_catalog() {
        let doc = catalog_doc("1.0.0", None);
        let server = serve_with(|port| {
            let mut value = doc.value.clone();
            value["items"][0]["downloadUrl"] = json!(format!(
                "http://127.0.0.1:{port}/bundles/materi.zip?token=uji"
            ));
            vec![
                (
                    "/v1/materials".to_string(),
                    200,
                    serde_json::to_vec(&value).expect("json"),
                ),
                ("/bundles/materi.zip".to_string(), 200, doc.zip.clone()),
            ]
        });
        let mut connection = test_connection();
        point_catalog_at(&connection, server.port);

        let page = list_catalog(&connection, &CatalogQuery::default()).expect("list");
        assert!(!page.stale);
        assert_eq!(page.items.len(), 1);
        assert_eq!(page.items[0].title, "Materi Uji");
        assert!(page.items[0].installed_version.is_none());

        let root = temp_root("install");
        let result = install_once(&mut connection, &root, CatalogQuery::default()).expect("install");
        assert_eq!(result.version, "1.0.0");
        assert_eq!(result.files, 3);
        assert!(root.join(MATERIAL_ID).join("1.0.0").join("index.html").is_file());

        let page = list_catalog(&connection, &CatalogQuery::default()).expect("list after");
        assert_eq!(page.items[0].installed_version.as_deref(), Some("1.0.0"));

        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_bundle_that_does_not_match_catalog_hash() {
        let doc = catalog_doc("1.0.0", Some("0".repeat(64)));
        let server = serve_with(|port| {
            let mut value = doc.value.clone();
            value["items"][0]["downloadUrl"] = json!(format!(
                "http://127.0.0.1:{port}/bundles/materi.zip"
            ));
            vec![
                (
                    "/v1/materials".to_string(),
                    200,
                    serde_json::to_vec(&value).expect("json"),
                ),
                ("/bundles/materi.zip".to_string(), 200, doc.zip.clone()),
            ]
        });
        let mut connection = test_connection();
        point_catalog_at(&connection, server.port);

        let root = temp_root("hash");
        let error = install_once(&mut connection, &root, CatalogQuery::default())
            .expect_err("hash mismatch");
        assert_eq!(error.code, "MATERIAL_HASH_MISMATCH");
        assert!(!root.join(MATERIAL_ID).exists());

        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn serves_cached_page_when_catalog_unreachable() {
        let connection = test_connection();
        let doc = catalog_doc("1.0.0", None);
        let page: RawPage = serde_json::from_value(doc.value.clone()).expect("page");
        write_cache(&connection, &CatalogQuery::default().cache_key(), None, &page).expect("cache");
        app_meta::set(&connection, BASE_URL_KEY, "http://127.0.0.1:1").expect("base");

        let view = list_catalog(&connection, &CatalogQuery::default()).expect("cached list");
        assert!(view.stale);
        assert!(view.cached_at.is_some());
        assert_eq!(view.items.len(), 1);
        assert_eq!(view.items[0].material_id, MATERIAL_ID);
    }

    #[test]
    fn without_cache_a_dead_catalog_is_an_error() {
        let connection = test_connection();
        app_meta::set(&connection, BASE_URL_KEY, "http://127.0.0.1:1").expect("base");
        let error = list_catalog(&connection, &CatalogQuery::default()).expect_err("offline");
        assert_eq!(error.code, "MATERIAL_FETCH_FAILED");
    }

    #[test]
    fn requires_configured_catalog_url() {
        let connection = test_connection();
        // Variabel lingkungan di CI bisa kosong; bila terisi, lewati asersi ini.
        if std::env::var("IFP_CATALOG_URL").is_ok() {
            return;
        }
        let error = list_catalog(&connection, &CatalogQuery::default()).expect_err("unset");
        assert_eq!(error.code, "MATERIAL_INVALID");
    }
}
