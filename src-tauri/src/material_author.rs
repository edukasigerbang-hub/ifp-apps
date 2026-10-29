use crate::db::DbState;
use crate::error::AppError;
use crate::material::{self, MaterialState, MaterialView};
use crate::material_manifest::{
    self, MAX_BUNDLE_BYTES, bare_media_type, ensure_self_contained, is_image, is_material_id,
    is_semver, is_text_source, validate_relative_path,
};
use base64::Engine as _;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::State;

/// Berkas yang ditulis kerangka materi dari Studio (T-122).
struct Template {
    id: &'static str,
    label: &'static str,
    description: &'static str,
    index_html: &'static str,
    app_js: &'static str,
    transcript: &'static str,
}

const TEMPLATES: &[Template] = &[
    Template {
        id: "eksplorasi",
        label: "Eksplorasi berpoin",
        description: "Tiga langkah dengan tombol Sebelumnya/Berikutnya, tanda selesai, dan keluar.",
        index_html: include_str!("../material-templates/eksplorasi/index.html"),
        app_js: include_str!("../material-templates/eksplorasi/assets/app.js"),
        transcript: include_str!("../material-templates/eksplorasi/transcript.txt"),
    },
    Template {
        id: "kuis",
        label: "Kuis pilihan ganda",
        description: "Tiga soal satu-per-halaman; daftar soal disunting di assets/app.js.",
        index_html: include_str!("../material-templates/kuis/index.html"),
        app_js: include_str!("../material-templates/kuis/assets/app.js"),
        transcript: include_str!("../material-templates/kuis/transcript.txt"),
    },
];

const TEMPLATE_STYLE_CSS: &str = include_str!("../material-templates/style.css");
const TEMPLATE_COVER_PNG: &[u8] = include_bytes!("../material-templates/cover-placeholder.png");

/// Batas berkas teks yang disunting di editor: satu berkas sumber materi jauh
/// di bawah ini, jadi nilai besar menandakan tempelan yang salah.
const MAX_TEXT_BYTES: usize = 512 * 1024;
const MAX_ASSET_BYTES: usize = 8 * 1024 * 1024;
const MAX_DRAFT_FILES: usize = 200;
const MANIFEST_FILE: &str = "material.json";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TemplateInfo {
    pub id: String,
    pub label: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftInfo {
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub template_id: String,
    pub created_at: String,
    pub updated_at: String,
    pub cover: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftFile {
    pub path: String,
    pub media_type: Option<String>,
    pub bytes: u64,
    pub editable: bool,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftContent {
    pub draft: DraftInfo,
    pub manifest: Value,
    pub files: Vec<DraftFile>,
    pub total_bytes: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftReport {
    pub ok: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub file_count: usize,
    pub total_bytes: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateDraftInput {
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub template_id: String,
    #[serde(default)]
    pub summary: Option<String>,
    #[serde(default)]
    pub grade: Option<u32>,
    #[serde(default)]
    pub subject: Option<String>,
    #[serde(default)]
    pub estimated_minutes: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DraftKey {
    pub material_id: String,
    pub version: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WriteDraftFileInput {
    pub material_id: String,
    pub version: String,
    pub path: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AddDraftAssetInput {
    pub material_id: String,
    pub version: String,
    pub path: String,
    /// Base64 telanjang atau data URL (`data:image/png;base64,...`).
    pub data: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ReadDraftAssetInput {
    pub material_id: String,
    pub version: String,
    pub path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftAssetView {
    pub path: String,
    pub media_type: String,
    pub data_url: String,
    pub bytes: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DeleteDraftFileInput {
    pub material_id: String,
    pub version: String,
    pub path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SetDraftManifestInput {
    pub material_id: String,
    pub version: String,
    pub manifest: Value,
}

fn hex_digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn invalid(message: &str) -> AppError {
    AppError::validation(message)
}

fn io_error(context: &str) -> AppError {
    AppError::material_invalid(&format!("{context} tidak dapat ditulis."))
}

fn now(connection: &Connection) -> Result<String, AppError> {
    connection
        .query_row("SELECT strftime('%Y-%m-%dT%H:%M:%fZ','now')", [], |row| {
            row.get(0)
        })
        .map_err(AppError::read)
}

fn validate_key(material_id: &str, version: &str) -> Result<(), AppError> {
    if !is_material_id(material_id) {
        return Err(invalid(
            "materialId harus slug huruf kecil 3–64 karakter (huruf, angka, tanda hubung).",
        ));
    }
    if !is_semver(version) {
        return Err(invalid("Versi draft harus SemVer, mis. 1.0.0."));
    }
    Ok(())
}

fn draft_dir(root: &Path, material_id: &str, version: &str) -> PathBuf {
    root.join(material_id).join(version)
}

/// Berkas yang boleh disunting sebagai teks di editor.
fn is_editable_text(path: &str) -> bool {
    is_text_source(path)
        || matches!(
            Path::new(path).extension().and_then(|v| v.to_str()),
            Some("txt") | Some("vtt")
        )
}

fn template_of(id: &str) -> Result<&'static Template, AppError> {
    TEMPLATES
        .iter()
        .find(|template| template.id == id)
        .ok_or_else(|| invalid("Kerangka materi tidak dikenal."))
}

pub fn templates() -> Vec<TemplateInfo> {
    TEMPLATES
        .iter()
        .map(|template| TemplateInfo {
            id: template.id.to_string(),
            label: template.label.to_string(),
            description: template.description.to_string(),
        })
        .collect()
}

fn list_paths(directory: &Path, prefix: &str, out: &mut Vec<String>) -> Result<(), AppError> {
    let entries = fs::read_dir(directory).map_err(|_| io_error("Folder draft"))?;
    for entry in entries {
        let entry = entry.map_err(|_| io_error("Folder draft"))?;
        let name = entry.file_name().to_string_lossy().to_string();
        let relative = if prefix.is_empty() {
            name
        } else {
            format!("{prefix}/{name}")
        };
        if entry.path().is_dir() {
            list_paths(&entry.path(), &relative, out)?;
        } else {
            out.push(relative);
        }
    }
    Ok(())
}

/// Isi `files` manifest dihitung dari disk supaya hash selalu cocok dengan
/// berkas yang benar-benar ada; penulis tidak pernah mengetik hash.
fn manifest_files(directory: &Path) -> Result<Vec<Value>, AppError> {
    let mut names = Vec::new();
    list_paths(directory, "", &mut names)?;
    names.sort();
    if names.len() > MAX_DRAFT_FILES {
        return Err(invalid(&format!(
            "Draft terlalu banyak berkas (maksimal {MAX_DRAFT_FILES})."
        )));
    }

    let mut files = Vec::new();
    for name in names {
        if name == MANIFEST_FILE || name == "seed.json" {
            continue;
        }
        validate_relative_path(&name)?;
        let media_type = bare_media_type(&name).ok_or_else(|| {
            AppError::material_invalid(&format!("Tipe berkas tidak diizinkan di bundel: {name}"))
        })?;
        let bytes = fs::read(directory.join(&name)).map_err(|_| io_error(&name))?;
        files.push(json!({
            "path": name,
            "mediaType": media_type,
            "bytes": bytes.len(),
            "sha256": hex_digest(&bytes),
        }));
    }
    Ok(files)
}

fn draft_row_to_info(root: &Path, row: &rusqlite::Row<'_>) -> rusqlite::Result<DraftInfo> {
    let material_id: String = row.get(0)?;
    let version: String = row.get(1)?;
    let title: String = row.get(2)?;
    let template_id: String = row.get(3)?;
    let created_at: String = row.get(4)?;
    let updated_at: String = row.get(5)?;
    let cover = material::cover_data_url(root, &draft_dir(root, &material_id, &version));
    Ok(DraftInfo {
        material_id,
        version,
        title,
        template_id,
        created_at,
        updated_at,
        cover,
    })
}

const DRAFT_SELECT: &str = "SELECT material_id, version, title, template_id, created_at, updated_at \
   FROM material_draft";

fn fetch_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<Option<DraftInfo>, AppError> {
    let mut statement = connection
        .prepare(&format!(
            "{DRAFT_SELECT} WHERE material_id = ?1 AND version = ?2"
        ))
        .map_err(AppError::read)?;
    let mut rows = statement
        .query_map(params![material_id, version], |row| {
            draft_row_to_info(root, row)
        })
        .map_err(AppError::read)?;
    match rows.next() {
        Some(row) => row.map(Some).map_err(AppError::read),
        None => Ok(None),
    }
}

fn ensure_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<DraftInfo, AppError> {
    validate_key(material_id, version)?;
    fetch_draft(connection, root, material_id, version)?.ok_or_else(|| {
        AppError::material_not_found(&format!("Draft {material_id}@{version} tidak ditemukan."))
    })
}

/// Draft memakai folder yang sama dengan bundel terpasang supaya pratinjau
/// berjalan lewat protokol `ifp-content` tanpa pelebaran CSP. Karena itu id dan
/// versi tidak boleh menimpa materi yang sudah dipasang.
fn ensure_not_installed(
    connection: &Connection,
    material_id: &str,
    version: &str,
) -> Result<(), AppError> {
    let found = connection
        .query_row(
            "SELECT 1 FROM material_install WHERE material_id = ?1 AND version = ?2",
            params![material_id, version],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if found.is_some() {
        return Err(invalid(&format!(
            "Materi {material_id} versi {version} sudah terpasang. Pakai versi lain agar tidak menimbun bundel yang sudah dipakai murid."
        )));
    }
    Ok(())
}

fn touch_draft(
    connection: &mut Connection,
    material_id: &str,
    version: &str,
    title: Option<&str>,
) -> Result<(), AppError> {
    let timestamp = now(connection)?;
    match title {
        Some(title) => connection
            .execute(
                "UPDATE material_draft SET updated_at = ?3, title = ?4
                  WHERE material_id = ?1 AND version = ?2",
                params![material_id, version, timestamp, title],
            )
            .map_err(AppError::write)?,
        None => connection
            .execute(
                "UPDATE material_draft SET updated_at = ?3
                  WHERE material_id = ?1 AND version = ?2",
                params![material_id, version, timestamp],
            )
            .map_err(AppError::write)?,
    };
    Ok(())
}

fn read_manifest_value(directory: &Path) -> Result<Value, AppError> {
    let bytes = fs::read(directory.join(MANIFEST_FILE))
        .map_err(|_| AppError::material_not_found("Manifest draft tidak ditemukan."))?;
    serde_json::from_slice(&bytes)
        .map_err(|_| AppError::material_invalid("Manifest draft tidak dapat dibaca sebagai JSON."))
}

fn write_manifest_value(directory: &Path, manifest: &Value) -> Result<(), AppError> {
    let bytes = serde_json::to_vec_pretty(manifest)
        .map_err(|_| AppError::material_invalid("Manifest draft tidak dapat ditulis."))?;
    fs::write(directory.join(MANIFEST_FILE), bytes).map_err(|_| io_error("Manifest draft"))
}

/// Setelah berkas berubah, `files` pada manifest dihitung ulang dari disk.
fn refresh_files(directory: &Path) -> Result<(), AppError> {
    let mut manifest = read_manifest_value(directory)?;
    let files = manifest_files(directory)?;
    manifest["files"] = Value::Array(files);
    write_manifest_value(directory, &manifest)
}

fn draft_files(directory: &Path) -> Result<Vec<DraftFile>, AppError> {
    let mut names = Vec::new();
    list_paths(directory, "", &mut names)?;
    names.sort();

    let mut files = Vec::new();
    for name in names {
        if name == "seed.json" {
            continue;
        }
        let bytes = fs::read(directory.join(&name)).map_err(|_| io_error(&name))?;
        let editable = name != MANIFEST_FILE && is_editable_text(&name);
        let content = editable
            .then(|| String::from_utf8(bytes.clone()).ok())
            .flatten();
        files.push(DraftFile {
            media_type: bare_media_type(&name).map(str::to_string),
            bytes: bytes.len() as u64,
            path: name,
            editable,
            content,
        });
    }
    Ok(files)
}

fn build_draft_content(info: DraftInfo, directory: &Path) -> Result<DraftContent, AppError> {
    let manifest = read_manifest_value(directory)?;
    let files = draft_files(directory)?;
    let total_bytes = files
        .iter()
        .filter(|file| file.path != MANIFEST_FILE)
        .map(|file| file.bytes)
        .sum();
    Ok(DraftContent {
        draft: info,
        manifest,
        files,
        total_bytes,
    })
}

fn write_all(path: &Path, bytes: &[u8]) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| io_error("Folder draft"))?;
    }
    fs::write(path, bytes).map_err(|_| io_error("Berkas draft"))
}

pub fn create_draft(
    connection: &mut Connection,
    root: &Path,
    input: &CreateDraftInput,
) -> Result<DraftContent, AppError> {
    validate_key(&input.material_id, &input.version)?;
    let template = template_of(&input.template_id)?;
    let title = input.title.trim();
    if title.chars().count() < 3 || title.chars().count() > 200 {
        return Err(invalid("Judul draft harus 3–200 karakter."));
    }

    if fetch_draft(connection, root, &input.material_id, &input.version)?.is_some() {
        return Err(invalid("Draft dengan id dan versi itu sudah ada."));
    }
    ensure_not_installed(connection, &input.material_id, &input.version)?;

    let directory = draft_dir(root, &input.material_id, &input.version);
    if directory.exists() {
        return Err(invalid(&format!(
            "Folder materi {}@{} sudah ada. Pakai versi lain.",
            input.material_id, input.version
        )));
    }

    let grade = input.grade.unwrap_or(3);
    if !(1..=6).contains(&grade) {
        return Err(invalid("Kelas harus 1–6."));
    }
    let subject = input
        .subject
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("ipas")
        .to_ascii_lowercase();
    let estimated_minutes = input.estimated_minutes.unwrap_or(5).clamp(1, 60);
    let summary = input
        .summary
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("Draft dari Studio Materi — masih perlu dilengkapi dan direview.")
        .chars()
        .take(300)
        .collect::<String>();

    let directory = draft_dir(root, &input.material_id, &input.version);
    let outcome = (|| -> Result<(), AppError> {
        write_all(
            &directory.join("index.html"),
            template.index_html.as_bytes(),
        )?;
        write_all(
            &directory.join("assets").join("app.js"),
            template.app_js.as_bytes(),
        )?;
        write_all(
            &directory.join("assets").join("style.css"),
            TEMPLATE_STYLE_CSS.as_bytes(),
        )?;
        write_all(
            &directory.join("assets").join("cover.png"),
            TEMPLATE_COVER_PNG,
        )?;
        write_all(
            &directory.join("transcript.txt"),
            template.transcript.as_bytes(),
        )?;

        let files = manifest_files(&directory)?;
        let manifest = json!({
            "schemaVersion": "1.0.0",
            "materialId": input.material_id,
            "version": input.version,
            "title": title,
            "summary": summary,
            "locale": "id-ID",
            "gradeLevels": [grade],
            "subjects": [subject],
            "topics": [],
            "curriculumRefs": [],
            "estimatedMinutes": estimated_minutes,
            "entry": "index.html",
            "cover": "assets/cover.png",
            "transcriptPath": "transcript.txt",
            "accessibility": {
                "hasAudio": false,
                "keyboardNavigable": true,
                "supportsReducedMotion": true,
                "contrastChecked": false,
            },
            "completion": { "mode": "signal" },
            "minAppVersion": env!("CARGO_PKG_VERSION"),
            "publisher": { "name": "Gerbang Edukasi" },
            "reviewStatus": "draft",
            "files": files,
        });
        let parsed: material_manifest::MaterialManifest = serde_json::from_value(manifest.clone())
            .map_err(|error| {
                AppError::material_invalid(&format!("Manifest kerangka tidak valid: {error}"))
            })?;
        material_manifest::validate(&parsed, env!("CARGO_PKG_VERSION"))?;
        write_manifest_value(&directory, &manifest)
    })();

    if let Err(error) = outcome {
        let _ = fs::remove_dir_all(&directory);
        return Err(error);
    }

    let timestamp = now(connection)?;
    connection
        .execute(
            "INSERT INTO material_draft (material_id, version, title, template_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
            params![input.material_id, input.version, title, template.id, timestamp],
        )
        .map_err(AppError::write)?;

    let info = ensure_draft(connection, root, &input.material_id, &input.version)?;
    build_draft_content(info, &directory)
}

pub fn list_drafts(connection: &Connection, root: &Path) -> Result<Vec<DraftInfo>, AppError> {
    let mut statement = connection
        .prepare(&format!(
            "{DRAFT_SELECT} ORDER BY updated_at DESC, material_id"
        ))
        .map_err(AppError::read)?;
    let rows = statement
        .query_map([], |row| draft_row_to_info(root, row))
        .map_err(AppError::read)?;
    rows.collect::<Result<Vec<_>, _>>().map_err(AppError::read)
}

pub fn read_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<DraftContent, AppError> {
    let info = ensure_draft(connection, root, material_id, version)?;
    build_draft_content(info, &draft_dir(root, material_id, version))
}

pub fn write_draft_file(
    connection: &mut Connection,
    root: &Path,
    input: &WriteDraftFileInput,
) -> Result<DraftContent, AppError> {
    let info = ensure_draft(connection, root, &input.material_id, &input.version)?;
    validate_relative_path(&input.path)?;
    if input.path == MANIFEST_FILE {
        return Err(invalid(
            "material.json disunting lewat tab Metadata, bukan sebagai berkas teks.",
        ));
    }
    if input.path == "index.html" && input.content.trim().is_empty() {
        return Err(invalid("index.html tidak boleh kosong."));
    }
    if !is_editable_text(&input.path) {
        return Err(invalid(
            "Hanya berkas .html, .js, .mjs, .css, .txt, atau .vtt yang dapat disunting.",
        ));
    }
    let bytes = input.content.as_bytes();
    if bytes.len() > MAX_TEXT_BYTES {
        return Err(invalid("Berkas teks materi melebihi 512 KB."));
    }
    if is_text_source(&input.path) {
        ensure_self_contained(&input.path, bytes)?;
    }

    let directory = draft_dir(root, &input.material_id, &input.version);
    write_all(&directory.join(&input.path), bytes)?;
    refresh_files(&directory)?;
    touch_draft(connection, &input.material_id, &input.version, None)?;
    build_draft_content(info, &directory)
}

fn strip_data_url(value: &str) -> &str {
    match value.find(";base64,") {
        Some(index) => &value[index + ";base64,".len()..],
        None => value,
    }
}

pub fn add_draft_asset(
    connection: &mut Connection,
    root: &Path,
    input: &AddDraftAssetInput,
) -> Result<DraftContent, AppError> {
    let info = ensure_draft(connection, root, &input.material_id, &input.version)?;
    validate_relative_path(&input.path)?;
    if input.path == MANIFEST_FILE || input.path == "index.html" {
        return Err(invalid("Berkas itu bukan aset yang dapat ditimpa."));
    }
    if bare_media_type(&input.path).is_none() {
        return Err(invalid(&format!(
            "Tipe berkas tidak diizinkan di bundel: {}",
            input.path
        )));
    }
    if is_text_source(&input.path) {
        return Err(invalid(
            "Berkas HTML/JS/CSS dibuat di tab Kode, bukan diunggah sebagai aset.",
        ));
    }

    let decoded = base64::engine::general_purpose::STANDARD
        .decode(strip_data_url(input.data.trim()))
        .map_err(|_| invalid("Data aset bukan base64 yang valid."))?;
    if decoded.is_empty() {
        return Err(invalid("Aset tidak boleh kosong."));
    }
    if decoded.len() > MAX_ASSET_BYTES {
        return Err(invalid("Satu aset materi maksimal 8 MB."));
    }

    let directory = draft_dir(root, &input.material_id, &input.version);
    let total = directory_total_bytes(&directory)? + decoded.len() as u64;
    if total > MAX_BUNDLE_BYTES {
        return Err(AppError::material_too_large());
    }
    write_all(&directory.join(&input.path), &decoded)?;
    refresh_files(&directory)?;
    touch_draft(connection, &input.material_id, &input.version, None)?;
    build_draft_content(info, &directory)
}

/// Membaca aset gambar draft sebagai data URL untuk galeri dan pratinjau di
/// editor. Jenis gambar ditentukan dari magic bytes, bukan ekstensi.
pub fn read_draft_asset(
    connection: &Connection,
    root: &Path,
    input: &ReadDraftAssetInput,
) -> Result<DraftAssetView, AppError> {
    ensure_draft(connection, root, &input.material_id, &input.version)?;
    validate_relative_path(&input.path)?;
    if input.path == MANIFEST_FILE || !is_image(&input.path) {
        return Err(invalid(
            "Hanya gambar WebP, PNG, atau JPG draft yang dapat dipratinjau.",
        ));
    }

    let directory = draft_dir(root, &input.material_id, &input.version);
    let canonical_root = fs::canonicalize(root).map_err(|_| io_error("Folder materi"))?;
    let canonical = fs::canonicalize(directory.join(&input.path))
        .map_err(|_| invalid("Gambar tidak ditemukan di draft."))?;
    if !canonical.starts_with(&canonical_root) {
        return Err(invalid("Path gambar keluar dari folder materi."));
    }
    let metadata = fs::metadata(&canonical).map_err(|_| io_error("Gambar draft"))?;
    if !metadata.is_file() {
        return Err(invalid("Gambar draft bukan berkas."));
    }
    if metadata.len() > MAX_ASSET_BYTES as u64 {
        return Err(invalid("Gambar draft melebihi 8 MB."));
    }

    let bytes = fs::read(&canonical).map_err(|_| io_error("Gambar draft"))?;
    let media_type = material::sniff_image(&bytes)
        .ok_or_else(|| invalid("Berkas itu bukan gambar WebP, PNG, atau JPG."))?;
    Ok(DraftAssetView {
        path: input.path.clone(),
        media_type: media_type.to_string(),
        data_url: format!(
            "data:{media_type};base64,{}",
            base64::engine::general_purpose::STANDARD.encode(&bytes)
        ),
        bytes: bytes.len() as u64,
    })
}

pub fn delete_draft_file(
    connection: &mut Connection,
    root: &Path,
    input: &DeleteDraftFileInput,
) -> Result<DraftContent, AppError> {
    let info = ensure_draft(connection, root, &input.material_id, &input.version)?;
    validate_relative_path(&input.path)?;
    if input.path == MANIFEST_FILE || input.path == "index.html" {
        return Err(invalid(
            "index.html dan material.json tidak dapat dihapus dari draft.",
        ));
    }

    let directory = draft_dir(root, &input.material_id, &input.version);
    let target = directory.join(&input.path);
    if !target.is_file() {
        return Err(AppError::material_not_found(
            "Berkas draft tidak ditemukan.",
        ));
    }
    fs::remove_file(&target)
        .map_err(|_| AppError::material_invalid("Berkas draft tidak dapat dihapus."))?;
    refresh_files(&directory)?;
    touch_draft(connection, &input.material_id, &input.version, None)?;
    build_draft_content(info, &directory)
}

pub fn set_draft_manifest(
    connection: &mut Connection,
    root: &Path,
    input: &SetDraftManifestInput,
) -> Result<DraftContent, AppError> {
    ensure_draft(connection, root, &input.material_id, &input.version)?;
    let mut manifest = input.manifest.clone();
    let object = match manifest.as_object_mut() {
        Some(object) => object,
        None => return Err(invalid("Manifest harus berupa objek JSON.")),
    };
    // Id dan versi adalah kunci folder; tidak dapat diubah lewat manifest.
    object.insert("materialId".to_string(), json!(input.material_id));
    object.insert("version".to_string(), json!(input.version));
    let files = manifest_files(&draft_dir(root, &input.material_id, &input.version))?;
    object.insert("files".to_string(), Value::Array(files));

    let parsed: material_manifest::MaterialManifest = serde_json::from_value(manifest.clone())
        .map_err(|error| {
            AppError::material_invalid(&format!("Manifest materi tidak valid: {error}"))
        })?;
    material_manifest::validate(&parsed, env!("CARGO_PKG_VERSION"))?;

    let directory = draft_dir(root, &input.material_id, &input.version);
    write_manifest_value(&directory, &manifest)?;
    touch_draft(
        connection,
        &input.material_id,
        &input.version,
        Some(&parsed.title),
    )?;
    let info = ensure_draft(connection, root, &input.material_id, &input.version)?;
    build_draft_content(info, &directory)
}

fn directory_total_bytes(directory: &Path) -> Result<u64, AppError> {
    let mut names = Vec::new();
    list_paths(directory, "", &mut names)?;
    let mut total = 0_u64;
    for name in names {
        if name == "seed.json" {
            continue;
        }
        total += fs::metadata(directory.join(&name))
            .map_err(|_| io_error(&name))?
            .len();
    }
    Ok(total)
}

/// Pemeriksaan penuh: manifest lolos kontrak bundel v1, hash cocok dengan disk,
/// dan tidak ada rujukan jaringan di berkas sumber.
pub fn check_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<DraftReport, AppError> {
    ensure_draft(connection, root, material_id, version)?;
    let directory = draft_dir(root, material_id, version);
    if !directory.join(MANIFEST_FILE).is_file() {
        return Ok(DraftReport {
            ok: false,
            errors: vec!["Manifest materi (material.json) belum ada di folder draft.".to_string()],
            warnings: Vec::new(),
            file_count: 0,
            total_bytes: 0,
        });
    }

    let mut errors: Vec<String> = Vec::new();
    let mut warnings: Vec<String> = Vec::new();

    let manifest = read_manifest_value(&directory)?;
    let parsed: Option<material_manifest::MaterialManifest> =
        match serde_json::from_value::<material_manifest::MaterialManifest>(manifest.clone()) {
            Ok(parsed) => Some(parsed),
            Err(error) => {
                errors.push(format!("Manifest tidak sesuai kontrak bundel: {error}"));
                None
            }
        };

    if let Some(parsed) = &parsed {
        if let Err(error) = material_manifest::validate(parsed, env!("CARGO_PKG_VERSION")) {
            errors.push(error.message);
        }
        if !parsed.accessibility.contrast_checked {
            warnings.push("Kontras warna belum dicentang di tab Metadata.".to_string());
        }

        for name in [&parsed.cover, &parsed.transcript_path] {
            if !directory.join(name).is_file() {
                errors.push(format!("Berkas wajib tidak ada di folder: {name}"));
            }
        }
        if !directory.join(&parsed.entry).is_file() {
            errors.push(format!(
                "Berkas masuk {} tidak ada di folder.",
                parsed.entry
            ));
        }
        if manifest_files_count_mismatch(&directory, parsed) {
            errors.push("Daftar files pada manifest tidak cocok dengan isi folder — simpan ulang metadata atau berkas untuk menyegarkan hash.".to_string());
        }

        for file in &parsed.files {
            if is_text_source(&file.path) {
                if let Ok(bytes) = fs::read(directory.join(&file.path)) {
                    if let Err(error) = ensure_self_contained(&file.path, &bytes) {
                        errors.push(error.message);
                    }
                }
            }
        }
        if parsed.review_status != "approved" {
            warnings.push(format!(
                "Status review masih \"{}\" — tandai approved hanya setelah materi dibaca manusia; pemasangan tetap butuh tanda tangan penerbit.",
                parsed.review_status
            ));
        }
        if let Ok(metadata) = fs::metadata(directory.join(&parsed.cover)) {
            if metadata.len() > material::MAX_COVER_BYTES {
                warnings.push(
                    "Cover lebih dari 2 MB sehingga thumbnail di aplikasi tidak tampil."
                        .to_string(),
                );
            }
        }
    }

    let total_bytes = directory_total_bytes(&directory)?;
    if total_bytes > 40 * 1024 * 1024 {
        warnings.push("Bundel mendekati batas 50 MB.".to_string());
    }

    let file_count = draft_files(&directory)?.len();
    Ok(DraftReport {
        ok: errors.is_empty(),
        errors,
        warnings,
        file_count,
        total_bytes,
    })
}

fn manifest_files_count_mismatch(
    directory: &Path,
    manifest: &material_manifest::MaterialManifest,
) -> bool {
    match manifest_files(directory) {
        Ok(computed) => {
            computed.len() != manifest.files.len()
                || computed
                    .iter()
                    .zip(manifest.files.iter())
                    .any(|(a, b)| a["path"] != json!(b.path) || a["sha256"] != json!(b.sha256))
        }
        Err(_) => true,
    }
}

pub fn preview_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<MaterialView, AppError> {
    ensure_draft(connection, root, material_id, version)?;
    let directory = draft_dir(root, material_id, version);
    material::open_material(root, &directory, material_id, version)
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportResult {
    pub source_directory: String,
    pub bundle_zip: String,
    pub total_bytes: u64,
}

/// Menyalin draft ke folder tujuan sebagai sumber materi + ZIP tanpa tanda
/// tangan. Penandatanganan tetap dilakukan di luar aplikasi lewat
/// `scripts/material-pack.mjs` supaya kunci privat tidak pernah masuk app.
pub fn export_draft(
    connection: &Connection,
    root: &Path,
    material_id: &str,
    version: &str,
    target_dir: &Path,
) -> Result<ExportResult, AppError> {
    ensure_draft(connection, root, material_id, version)?;
    let directory = draft_dir(root, material_id, version);
    let report = check_draft(connection, root, material_id, version)?;
    if !report.ok {
        return Err(AppError::material_invalid(&format!(
            "Draft belum lolos pemeriksaan: {}",
            report.errors.join(" ")
        )));
    }

    let folder_name = format!("{material_id}-{version}");
    let zip_name = format!("{material_id}-{version}.zip");
    let source_target = target_dir.join("materials-source").join(&folder_name);
    let bundle_target = target_dir.join(&zip_name);
    if source_target.exists() || bundle_target.exists() {
        return Err(invalid(
            "Hasil ekspor dengan nama itu sudah ada di folder tujuan. Pindahkan lebih dulu.",
        ));
    }

    let staging = target_dir.join(format!(".ifp-export-{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&staging).map_err(|_| io_error("Folder ekspor"))?;
    let outcome = (|| -> Result<ExportResult, AppError> {
        let mut names = Vec::new();
        list_paths(&directory, "", &mut names)?;
        names.sort();

        let staging_source = staging.join(&folder_name);
        let staging_zip = staging.join(&zip_name);
        let mut writer = zip::ZipWriter::new(
            fs::File::create(&staging_zip).map_err(|_| io_error("ZIP ekspor"))?,
        );
        let options = zip::write::SimpleFileOptions::default();

        let mut total = 0_u64;
        for name in names {
            if name == "seed.json" {
                continue;
            }
            let bytes = fs::read(directory.join(&name)).map_err(|_| io_error(&name))?;
            if bytes.is_empty() {
                return Err(invalid(&format!("Berkas materi kosong: {name}")));
            }
            total += bytes.len() as u64;
            write_all(&staging_source.join(&name), &bytes)?;
            writer
                .start_file(name.clone(), options)
                .map_err(|_| io_error("ZIP ekspor"))?;
            std::io::Write::write_all(&mut writer, &bytes).map_err(|_| io_error("ZIP ekspor"))?;
        }
        writer.finish().map_err(|_| io_error("ZIP ekspor"))?;

        fs::create_dir_all(target_dir.join("materials-source"))
            .map_err(|_| io_error("Folder ekspor"))?;
        fs::rename(&staging_source, &source_target).map_err(|_| io_error("Folder ekspor"))?;
        fs::rename(&staging_zip, &bundle_target).map_err(|_| io_error("ZIP ekspor"))?;

        Ok(ExportResult {
            source_directory: source_target.display().to_string(),
            bundle_zip: bundle_target.display().to_string(),
            total_bytes: total,
        })
    })();

    let _ = fs::remove_dir_all(&staging);
    outcome
}

#[tauri::command]
pub fn material_draft_templates() -> Vec<TemplateInfo> {
    templates()
}

#[tauri::command]
pub fn material_draft_create(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: CreateDraftInput,
) -> Result<DraftContent, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    create_draft(&mut connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_list(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
) -> Result<Vec<DraftInfo>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_drafts(&connection, &material.root)
}

#[tauri::command]
pub fn material_draft_read(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DraftKey,
) -> Result<DraftContent, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    read_draft(
        &connection,
        &material.root,
        &input.material_id,
        &input.version,
    )
}

#[tauri::command]
pub fn material_draft_file_write(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: WriteDraftFileInput,
) -> Result<DraftContent, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    write_draft_file(&mut connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_asset_add(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: AddDraftAssetInput,
) -> Result<DraftContent, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    add_draft_asset(&mut connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_asset_read(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: ReadDraftAssetInput,
) -> Result<DraftAssetView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    read_draft_asset(&connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_file_delete(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DeleteDraftFileInput,
) -> Result<DraftContent, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    delete_draft_file(&mut connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_manifest_set(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: SetDraftManifestInput,
) -> Result<DraftContent, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_draft_manifest(&mut connection, &material.root, &input)
}

#[tauri::command]
pub fn material_draft_check(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DraftKey,
) -> Result<DraftReport, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    check_draft(
        &connection,
        &material.root,
        &input.material_id,
        &input.version,
    )
}

#[tauri::command]
pub fn material_draft_open(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DraftKey,
) -> Result<MaterialView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    preview_draft(
        &connection,
        &material.root,
        &input.material_id,
        &input.version,
    )
}

#[tauri::command]
pub fn material_draft_export(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DraftKey,
    target_dir: String,
) -> Result<ExportResult, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    let target = Path::new(&target_dir);
    if !target.is_dir() {
        return Err(invalid(
            "Folder ekspor belum ada. Pilih folder yang sudah ada.",
        ));
    }
    export_draft(
        &connection,
        &material.root,
        &input.material_id,
        &input.version,
        target,
    )
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct DeleteDraftInput {
    pub material_id: String,
    pub version: String,
    /// Konfirmasi ketik: pemanggil harus mengetik `<materialId>@<version>`.
    pub confirm: String,
}

#[tauri::command]
pub fn material_draft_delete(
    db: State<'_, DbState>,
    material: State<'_, MaterialState>,
    input: DeleteDraftInput,
) -> Result<(), AppError> {
    let expected = format!("{}@{}", input.material_id, input.version);
    if input.confirm != expected {
        return Err(invalid(
            "Ketik <materialId>@<version> untuk menghapus draft beserta folder materinya.",
        ));
    }
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    delete_draft(
        &mut connection,
        &material.root,
        &input.material_id,
        &input.version,
    )
}

pub fn delete_draft(
    connection: &mut Connection,
    root: &Path,
    material_id: &str,
    version: &str,
) -> Result<(), AppError> {
    ensure_draft(connection, root, material_id, version)?;
    ensure_not_installed(connection, material_id, version)?;

    let directory = draft_dir(root, material_id, version);
    // Penanda seed = bundel contoh bawaan; bukan draft Studio.
    if directory.join("seed.json").is_file() {
        return Err(invalid(
            "Materi contoh bawaan tidak dapat dihapus dari Studio.",
        ));
    }
    connection
        .execute(
            "DELETE FROM material_draft WHERE material_id = ?1 AND version = ?2",
            params![material_id, version],
        )
        .map_err(AppError::write)?;
    if directory.is_dir() {
        fs::remove_dir_all(&directory)
            .map_err(|_| AppError::material_invalid("Folder draft tidak dapat dihapus."))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use tauri::http::{Request, StatusCode};

    fn temp_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("ifp-studio-{name}-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp root");
        path
    }

    fn input(id: &str, version: &str, template: &str) -> CreateDraftInput {
        CreateDraftInput {
            material_id: id.to_string(),
            version: version.to_string(),
            title: "Daur Ulang di Rumah".to_string(),
            template_id: template.to_string(),
            summary: None,
            grade: Some(4),
            subject: Some("ipas".to_string()),
            estimated_minutes: Some(8),
        }
    }

    fn mark_installed(connection: &mut Connection, material_id: &str, version: &str) {
        connection
            .execute(
                "INSERT INTO material_install
                   (material_id, version, sha256, size_bytes, state, installed_at)
                 VALUES (?1, ?2, ?3, 10, 'active', '2026-10-29T00:00:00.000Z')",
                params![material_id, version, "a".repeat(64)],
            )
            .expect("install row");
    }

    #[test]
    fn creates_draft_previewable_without_install_row() {
        let mut connection = test_connection();
        let root = temp_root("create");
        let content = create_draft(
            &mut connection,
            &root,
            &input("daur-ulang-rumah", "1.0.0", "eksplorasi"),
        )
        .expect("draft created");

        assert_eq!(content.draft.material_id, "daur-ulang-rumah");
        assert_eq!(content.draft.template_id, "eksplorasi");
        assert!(
            content.draft.cover.is_some(),
            "thumbnail cover draft tersedia"
        );

        let paths: Vec<&str> = content
            .files
            .iter()
            .map(|file| file.path.as_str())
            .collect();
        for expected in [
            "index.html",
            "assets/app.js",
            "assets/style.css",
            "assets/cover.png",
            "transcript.txt",
            MANIFEST_FILE,
        ] {
            assert!(paths.contains(&expected), "berkas {expected} terdaftar");
        }
        assert!(
            content
                .files
                .iter()
                .find(|file| file.path == "index.html")
                .and_then(|file| file.content.as_ref())
                .is_some()
        );

        let report = check_draft(&connection, &root, "daur-ulang-rumah", "1.0.0").expect("check");
        assert!(
            report.ok,
            "draft baru lolos pemeriksaan: {:?}",
            report.errors
        );

        let installed: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM material_install WHERE material_id = 'daur-ulang-rumah'",
                [],
                |row| row.get(0),
            )
            .expect("count");
        assert_eq!(installed, 0);

        let view = preview_draft(&connection, &root, "daur-ulang-rumah", "1.0.0").expect("preview");
        assert_eq!(view.entry_path, "daur-ulang-rumah/1.0.0/index.html");
        assert_eq!(view.review_status, "draft");

        // Protokol materi melayani berkas draft tanpa perubahan CSP.
        let request = Request::builder()
            .uri("http://ifp-content.localhost/daur-ulang-rumah/1.0.0/index.html")
            .body(Vec::new())
            .expect("request");
        let response = crate::material::handle_request(&root, &request);
        assert_eq!(response.status(), StatusCode::OK);

        assert_eq!(list_drafts(&connection, &root).expect("list").len(), 1);
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn refuses_to_shadow_installed_material() {
        let mut connection = test_connection();
        let root = temp_root("shadow");
        mark_installed(&mut connection, "contoh-air", "1.0.0");

        let error = create_draft(
            &mut connection,
            &root,
            &input("contoh-air", "1.0.0", "kuis"),
        )
        .expect_err("draft tidak boleh menimpa materi terpasang");
        assert_eq!(error.code, "VALIDATION_FAILED");
        assert!(!draft_dir(&root, "contoh-air", "1.0.0").exists());
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rewriting_a_file_refreshes_hashes_and_blocks_network() {
        let mut connection = test_connection();
        let root = temp_root("write");
        create_draft(
            &mut connection,
            &root,
            &input("pola-bilangan", "1.0.0", "eksplorasi"),
        )
        .expect("draft");
        let directory = draft_dir(&root, "pola-bilangan", "1.0.0");

        write_draft_file(
            &mut connection,
            &root,
            &WriteDraftFileInput {
                material_id: "pola-bilangan".to_string(),
                version: "1.0.0".to_string(),
                path: "index.html".to_string(),
                content:
                    "<!doctype html><html lang=\"id\"><body><h1>Pola Bilangan</h1></body></html>"
                        .to_string(),
            },
        )
        .expect("berkas tersimpan");

        let stored = read_manifest_value(&directory).expect("manifest");
        let entry = stored["files"]
            .as_array()
            .expect("files")
            .iter()
            .find(|file| file["path"] == json!("index.html"))
            .expect("index.html terdaftar");
        let bytes = fs::read(directory.join("index.html")).expect("read");
        assert_eq!(entry["sha256"], json!(hex_digest(&bytes)));
        assert_eq!(entry["bytes"], json!(bytes.len()));

        let blocked = write_draft_file(
            &mut connection,
            &root,
            &WriteDraftFileInput {
                material_id: "pola-bilangan".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/app.js".to_string(),
                content: "window.location = \"https://contoh.id\";".to_string(),
            },
        )
        .expect_err("rujukan jaringan ditolak");
        assert_eq!(blocked.code, "MATERIAL_NOT_SELF_CONTAINED");

        let partial = set_draft_manifest(
            &mut connection,
            &root,
            &SetDraftManifestInput {
                material_id: "pola-bilangan".to_string(),
                version: "1.0.0".to_string(),
                manifest: json!({ "title": "Judul Baru" }),
            },
        )
        .expect_err("manifest parsial ditolak");
        assert_eq!(partial.code, "MATERIAL_INVALID");
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn asset_add_and_delete_keep_bundle_valid() {
        let mut connection = test_connection();
        let root = temp_root("asset");
        create_draft(
            &mut connection,
            &root,
            &input("bangun-ruang", "1.0.0", "eksplorasi"),
        )
        .expect("draft");
        let directory = draft_dir(&root, "bangun-ruang", "1.0.0");
        let png = fs::read(directory.join("assets/cover.png")).expect("cover kerangka");
        let encoded = base64::engine::general_purpose::STANDARD.encode(&png);

        let content = add_draft_asset(
            &mut connection,
            &root,
            &AddDraftAssetInput {
                material_id: "bangun-ruang".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/bangun.png".to_string(),
                data: format!("data:image/png;base64,{encoded}"),
            },
        )
        .expect("aset ditambahkan");
        assert!(
            content
                .files
                .iter()
                .any(|file| file.path == "assets/bangun.png")
        );

        let traversal = add_draft_asset(
            &mut connection,
            &root,
            &AddDraftAssetInput {
                material_id: "bangun-ruang".to_string(),
                version: "1.0.0".to_string(),
                path: "../luar.png".to_string(),
                data: encoded.clone(),
            },
        )
        .expect_err("path traversal ditolak");
        assert_eq!(traversal.code, "MATERIAL_INVALID");

        let removed = delete_draft_file(
            &mut connection,
            &root,
            &DeleteDraftFileInput {
                material_id: "bangun-ruang".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/bangun.png".to_string(),
            },
        )
        .expect("aset dihapus");
        assert!(
            !removed
                .files
                .iter()
                .any(|file| file.path == "assets/bangun.png")
        );
        let report = check_draft(&connection, &root, "bangun-ruang", "1.0.0").expect("check");
        assert!(report.ok, "{:?}", report.errors);
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn delete_removes_folder_but_protects_installed_material() {
        let mut connection = test_connection();
        let root = temp_root("delete");
        create_draft(
            &mut connection,
            &root,
            &input("hapus-draft", "1.0.0", "kuis"),
        )
        .expect("draft");
        assert!(draft_dir(&root, "hapus-draft", "1.0.0").exists());

        delete_draft(&mut connection, &root, "hapus-draft", "1.0.0").expect("terhapus");
        assert!(!draft_dir(&root, "hapus-draft", "1.0.0").exists());
        assert!(list_drafts(&connection, &root).expect("list").is_empty());

        mark_installed(&mut connection, "terpasang", "2.0.0");
        fs::create_dir_all(draft_dir(&root, "terpasang", "2.0.0")).expect("dir");
        connection
            .execute(
                "INSERT INTO material_draft
                   (material_id, version, title, template_id, created_at, updated_at)
                 VALUES ('terpasang', '2.0.0', 'Tersangka', 'kuis', 'x', 'x')",
                [],
            )
            .expect("draft row");
        let blocked =
            delete_draft(&mut connection, &root, "terpasang", "2.0.0").expect_err("terlindungi");
        assert_eq!(blocked.code, "VALIDATION_FAILED");
        assert!(draft_dir(&root, "terpasang", "2.0.0").exists());
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn export_writes_source_folder_and_unsigned_zip() {
        let mut connection = test_connection();
        let root = temp_root("export");
        let target = temp_root("export-target");
        create_draft(
            &mut connection,
            &root,
            &input("ekspor-materi", "1.0.0", "eksplorasi"),
        )
        .expect("draft");

        let result =
            export_draft(&connection, &root, "ekspor-materi", "1.0.0", &target).expect("ekspor");
        assert!(
            Path::new(&result.source_directory)
                .join("index.html")
                .is_file()
        );
        assert!(
            Path::new(&result.source_directory)
                .join("material.json")
                .is_file()
        );
        assert!(Path::new(&result.bundle_zip).is_file());
        assert!(!Path::new(&result.bundle_zip).with_extension("sig").exists());

        let again = export_draft(&connection, &root, "ekspor-materi", "1.0.0", &target)
            .expect_err("ekspor kedua tidak menimpa");
        assert_eq!(again.code, "VALIDATION_FAILED");

        let mut archive = zip::ZipArchive::new(fs::File::open(&result.bundle_zip).expect("zip"))
            .expect("open zip");
        let names: Vec<String> = (0..archive.len())
            .map(|index| {
                archive
                    .by_index(index)
                    .expect("entry")
                    .name()
                    .expect("nama entri")
                    .to_string()
            })
            .collect();
        assert!(names.contains(&"material.json".to_string()));
        assert!(names.contains(&"assets/style.css".to_string()));
        assert_eq!(names.len(), 6);

        let _ = fs::remove_dir_all(&root);
        let _ = fs::remove_dir_all(&target);
    }

    #[test]
    fn reads_draft_image_as_data_url_and_rejects_others() {
        let mut connection = test_connection();
        let root = temp_root("asset-read");
        create_draft(
            &mut connection,
            &root,
            &input("galeri-gambar", "1.0.0", "eksplorasi"),
        )
        .expect("draft");
        let directory = draft_dir(&root, "galeri-gambar", "1.0.0");
        let png = fs::read(directory.join("assets/cover.png")).expect("cover kerangka");
        add_draft_asset(
            &mut connection,
            &root,
            &AddDraftAssetInput {
                material_id: "galeri-gambar".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/galeri.png".to_string(),
                data: base64::engine::general_purpose::STANDARD.encode(&png),
            },
        )
        .expect("aset ditambahkan");

        let view = read_draft_asset(
            &connection,
            &root,
            &ReadDraftAssetInput {
                material_id: "galeri-gambar".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/galeri.png".to_string(),
            },
        )
        .expect("gambar terbaca");
        assert_eq!(view.media_type, "image/png");
        assert!(view.data_url.starts_with("data:image/png;base64,"));
        assert_eq!(view.bytes, png.len() as u64);

        // Ekstensi gambar tapi isi bukan gambar: ditolak.
        fs::write(directory.join("assets/palsu.png"), b"bukan gambar").expect("tulis");
        let fake = read_draft_asset(
            &connection,
            &root,
            &ReadDraftAssetInput {
                material_id: "galeri-gambar".to_string(),
                version: "1.0.0".to_string(),
                path: "assets/palsu.png".to_string(),
            },
        )
        .expect_err("isi bukan gambar ditolak");
        assert_eq!(fake.code, "VALIDATION_FAILED");

        let traversal = read_draft_asset(
            &connection,
            &root,
            &ReadDraftAssetInput {
                material_id: "galeri-gambar".to_string(),
                version: "1.0.0".to_string(),
                path: "../ifp.db".to_string(),
            },
        )
        .expect_err("path traversal ditolak");
        assert_eq!(traversal.code, "MATERIAL_INVALID");

        let _ = fs::remove_dir_all(&root);
    }
}
