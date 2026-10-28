use crate::error::AppError;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Component, Path, PathBuf};
use tauri::http::{header, Request, Response, StatusCode};
use tauri::State;

pub const SAMPLE_MATERIAL_ID: &str = "contoh-siklus-air";
pub const SAMPLE_VERSION: &str = "1.0.0";

const SEED_VERSION: u32 = 4;
const MAX_FILE_BYTES: u64 = 50 * 1024 * 1024;

// Berlaku hanya untuk dokumen materi. `connect-src 'none'` menegakkan syarat
// self-contained dari kontrak bundel; sumber eksplisit dipakai karena iframe
// sandbox ber-origin opaque sehingga `'self'` saja tidak dapat diandalkan.
const MATERIAL_CSP: &str = "default-src 'none'; script-src 'self' ifp-content: http://ifp-content.localhost; style-src 'self' ifp-content: http://ifp-content.localhost; img-src 'self' data: ifp-content: http://ifp-content.localhost; media-src 'self' ifp-content: http://ifp-content.localhost; font-src 'self' ifp-content: http://ifp-content.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'";

pub struct MaterialState {
    pub root: PathBuf,
}

struct SampleFile {
    path: &'static str,
    media_type: &'static str,
    bytes: &'static [u8],
}

const SAMPLE_FILES: &[SampleFile] = &[
    SampleFile {
        path: "index.html",
        media_type: "text/html",
        bytes: include_bytes!("../sample-material/index.html"),
    },
    SampleFile {
        path: "assets/app.js",
        media_type: "text/javascript",
        bytes: include_bytes!("../sample-material/assets/app.js"),
    },
    SampleFile {
        path: "assets/style.css",
        media_type: "text/css",
        bytes: include_bytes!("../sample-material/assets/style.css"),
    },
    SampleFile {
        path: "assets/cover.png",
        media_type: "image/png",
        bytes: include_bytes!("../sample-material/assets/cover.png"),
    },
    SampleFile {
        path: "transcript.txt",
        media_type: "text/plain",
        bytes: include_bytes!("../sample-material/transcript.txt"),
    },
];

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SeedMarker {
    seed_version: u32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MaterialManifest {
    schema_version: String,
    material_id: String,
    version: String,
    title: String,
    summary: String,
    locale: String,
    grade_levels: Vec<u32>,
    subjects: Vec<String>,
    estimated_minutes: u32,
    entry: String,
    transcript_path: String,
    completion: Completion,
    accessibility: Accessibility,
    review_status: String,
    min_app_version: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Completion {
    mode: String,
    #[serde(default)]
    min_dwell_seconds: Option<u32>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Accessibility {
    has_audio: bool,
    keyboard_navigable: bool,
    supports_reduced_motion: bool,
    contrast_checked: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MaterialView {
    pub schema_version: String,
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub summary: String,
    pub locale: String,
    pub grade_levels: Vec<u32>,
    pub subjects: Vec<String>,
    pub estimated_minutes: u32,
    pub entry_path: String,
    pub transcript_path: String,
    pub transcript: String,
    pub completion_mode: String,
    pub completion_min_dwell_seconds: u32,
    pub accessibility: Accessibility,
    pub review_status: String,
    pub min_app_version: String,
}

fn material_write(error: impl std::fmt::Display) -> AppError {
    AppError::material_invalid(&format!("Materi contoh tidak dapat ditulis: {error}"))
}

fn hex_digest(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn sample_manifest() -> serde_json::Value {
    let files: Vec<serde_json::Value> = SAMPLE_FILES
        .iter()
        .map(|file| {
            serde_json::json!({
                "path": file.path,
                "mediaType": file.media_type,
                "bytes": file.bytes.len(),
                "sha256": hex_digest(file.bytes),
            })
        })
        .collect();

    serde_json::json!({
        "schemaVersion": "1.0.0",
        "materialId": SAMPLE_MATERIAL_ID,
        "version": SAMPLE_VERSION,
        "title": "Siklus Air dalam Animasi",
        "summary": "Materi contoh prototipe: mengikuti perjalanan setetes air dari laut ke awan lalu kembali ke sungai.",
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
        "completion": { "mode": "signal", "minDwellSeconds": 2 },
        "minAppVersion": "0.1.0",
        "publisher": { "name": "Gerbang Edukasi" },
        "reviewStatus": "draft",
        "files": files,
    })
}

fn read_seed_version(path: &Path) -> Option<u32> {
    let bytes = fs::read(path).ok()?;
    let marker: SeedMarker = serde_json::from_slice(&bytes).ok()?;
    Some(marker.seed_version)
}

pub fn ensure_sample_material(root: &Path) -> Result<PathBuf, AppError> {
    let target = root.join(SAMPLE_MATERIAL_ID).join(SAMPLE_VERSION);
    if read_seed_version(&target.join("seed.json")) == Some(SEED_VERSION) {
        return Ok(target);
    }

    let staging = root.join(".staging").join(uuid::Uuid::new_v4().to_string());
    fs::create_dir_all(&staging).map_err(material_write)?;

    for file in SAMPLE_FILES {
        let path = staging.join(file.path);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(material_write)?;
        }
        fs::write(&path, file.bytes).map_err(material_write)?;
    }

    let manifest = serde_json::to_vec_pretty(&sample_manifest())
        .map_err(|_| AppError::material_invalid("Manifest materi contoh tidak dapat dibuat."))?;
    fs::write(staging.join("material.json"), manifest).map_err(material_write)?;
    fs::write(
        staging.join("seed.json"),
        serde_json::to_vec(&SeedMarker {
            seed_version: SEED_VERSION,
        })
        .map_err(|_| AppError::material_invalid("Penanda materi contoh tidak dapat dibuat."))?,
    )
    .map_err(material_write)?;

    if target.exists() {
        fs::remove_dir_all(&target).map_err(material_write)?;
    }
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(material_write)?;
    }
    fs::rename(&staging, &target).map_err(material_write)?;
    let _ = fs::remove_dir(root.join(".staging"));

    Ok(target)
}

fn is_valid_material_id(value: &str) -> bool {
    let mut characters = value.chars();
    let Some(first) = characters.next() else {
        return false;
    };
    value.len() >= 3
        && value.len() <= 64
        && first.is_ascii_lowercase()
        && characters.all(|character| character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-')
}

fn is_valid_version(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '+'))
}

fn validate_relative_path(value: &str) -> Result<(), AppError> {
    if value.is_empty() || value.len() > 512 || value.contains('\\') {
        return Err(AppError::material_invalid("Path materi tidak valid."));
    }
    let path = Path::new(value);
    if path.is_absolute() {
        return Err(AppError::material_invalid("Path absolut tidak diizinkan di materi."));
    }
    for component in path.components() {
        match component {
            Component::Normal(_) => {}
            _ => return Err(AppError::material_invalid("Path traversal tidak diizinkan di materi.")),
        }
    }
    Ok(())
}

fn open_material(
    root: &Path,
    directory: &Path,
    material_id: &str,
    version: &str,
) -> Result<MaterialView, AppError> {
    let manifest_bytes = fs::read(directory.join("material.json"))
        .map_err(|_| AppError::material_not_found("Manifest materi tidak ditemukan."))?;
    let manifest: MaterialManifest = serde_json::from_slice(&manifest_bytes)
        .map_err(|_| AppError::material_invalid("Manifest materi tidak dapat dibaca."))?;

    if manifest.material_id != material_id || manifest.version != version {
        return Err(AppError::material_invalid("Manifest materi tidak cocok dengan folder terpasang."));
    }
    if !manifest.schema_version.starts_with("1.") {
        return Err(AppError::material_invalid("Versi skema materi tidak didukung."));
    }
    validate_relative_path(&manifest.entry)?;
    validate_relative_path(&manifest.transcript_path)?;

    let transcript_path = directory.join(&manifest.transcript_path);
    let canonical_root = fs::canonicalize(root)
        .map_err(|_| AppError::material_not_found("Folder materi tidak tersedia."))?;
    let canonical_transcript = fs::canonicalize(&transcript_path)
        .map_err(|_| AppError::material_not_found("Transkrip materi tidak ditemukan."))?;
    if !canonical_transcript.starts_with(&canonical_root) {
        return Err(AppError::material_invalid("Path transkrip keluar dari folder materi."));
    }
    let transcript = fs::read_to_string(&canonical_transcript)
        .map_err(|_| AppError::material_invalid("Transkrip materi tidak dapat dibaca."))?;

    Ok(MaterialView {
        schema_version: manifest.schema_version,
        material_id: manifest.material_id.clone(),
        version: manifest.version.clone(),
        title: manifest.title,
        summary: manifest.summary,
        locale: manifest.locale,
        grade_levels: manifest.grade_levels,
        subjects: manifest.subjects,
        estimated_minutes: manifest.estimated_minutes,
        entry_path: format!("{}/{}/{}", material_id, version, manifest.entry),
        transcript_path: format!("{}/{}/{}", material_id, version, manifest.transcript_path),
        transcript,
        completion_mode: manifest.completion.mode,
        completion_min_dwell_seconds: manifest.completion.min_dwell_seconds.unwrap_or(0),
        accessibility: manifest.accessibility,
        review_status: manifest.review_status,
        min_app_version: manifest.min_app_version,
    })
}

#[tauri::command]
pub fn material_open_sample(state: State<'_, MaterialState>) -> Result<MaterialView, AppError> {
    let directory = ensure_sample_material(&state.root)?;
    open_material(&state.root, &directory, SAMPLE_MATERIAL_ID, SAMPLE_VERSION)
}

fn percent_decode(input: &str) -> Option<String> {
    let bytes = input.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' {
            if index + 2 >= bytes.len() {
                return None;
            }
            let hex = std::str::from_utf8(&bytes[index + 1..index + 3]).ok()?;
            let value = u8::from_str_radix(hex, 16).ok()?;
            output.push(value);
            index += 3;
        } else {
            output.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8(output).ok()
}

fn safe_segments(path: &str) -> Option<Vec<String>> {
    let decoded = percent_decode(path)?;
    let mut segments = Vec::new();
    for part in decoded.split('/') {
        if part.is_empty() {
            continue;
        }
        if part.starts_with('.') || part.contains('\\') || part.contains(':') {
            return None;
        }
        segments.push(part.to_string());
    }
    if segments.len() < 3 {
        return None;
    }
    if !is_valid_material_id(&segments[0]) || !is_valid_version(&segments[1]) {
        return None;
    }
    Some(segments)
}

fn media_type_for(path: &Path) -> Option<&'static str> {
    let extension = path.extension()?.to_str()?.to_ascii_lowercase();
    match extension.as_str() {
        "html" => Some("text/html; charset=utf-8"),
        "js" | "mjs" => Some("text/javascript; charset=utf-8"),
        "css" => Some("text/css; charset=utf-8"),
        "json" => Some("application/json; charset=utf-8"),
        "webp" => Some("image/webp"),
        "png" => Some("image/png"),
        "jpg" | "jpeg" => Some("image/jpeg"),
        "gif" => Some("image/gif"),
        "svg" => Some("image/svg+xml"),
        "mp3" => Some("audio/mpeg"),
        "m4a" => Some("audio/mp4"),
        "ogg" => Some("audio/ogg"),
        "wav" => Some("audio/wav"),
        "woff2" => Some("font/woff2"),
        "ttf" => Some("font/ttf"),
        "vtt" => Some("text/vtt; charset=utf-8"),
        "txt" => Some("text/plain; charset=utf-8"),
        _ => None,
    }
}

fn resolve_request(root: &Path, request_path: &str) -> Result<PathBuf, StatusCode> {
    let segments = safe_segments(request_path).ok_or(StatusCode::BAD_REQUEST)?;
    let candidate = root.join(segments.join("/"));

    let canonical_root = fs::canonicalize(root).map_err(|_| StatusCode::NOT_FOUND)?;
    let canonical = fs::canonicalize(&candidate).map_err(|_| StatusCode::NOT_FOUND)?;
    if !canonical.starts_with(&canonical_root) {
        return Err(StatusCode::FORBIDDEN);
    }
    let metadata = fs::metadata(&canonical).map_err(|_| StatusCode::NOT_FOUND)?;
    if !metadata.is_file() {
        return Err(StatusCode::NOT_FOUND);
    }
    if metadata.len() > MAX_FILE_BYTES {
        return Err(StatusCode::PAYLOAD_TOO_LARGE);
    }
    if media_type_for(&canonical).is_none() {
        return Err(StatusCode::UNSUPPORTED_MEDIA_TYPE);
    }
    Ok(canonical)
}

fn material_response(status: StatusCode, media_type: &str, bytes: Vec<u8>) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, media_type)
        .header(header::CACHE_CONTROL, "no-store")
        .header("X-Content-Type-Options", "nosniff")
        .header("Content-Security-Policy", MATERIAL_CSP)
        .body(bytes)
        .unwrap_or_else(|_| Response::new(Vec::new()))
}

fn error_response(status: StatusCode) -> Response<Vec<u8>> {
    let message = match status {
        StatusCode::FORBIDDEN => "Materi: path di luar folder materi ditolak.",
        StatusCode::NOT_FOUND => "Materi: berkas tidak ditemukan.",
        StatusCode::PAYLOAD_TOO_LARGE => "Materi: berkas melebihi batas 50 MB.",
        StatusCode::UNSUPPORTED_MEDIA_TYPE => "Materi: tipe berkas tidak diizinkan.",
        _ => "Materi: permintaan tidak valid.",
    };
    material_response(status, "text/plain; charset=utf-8", message.as_bytes().to_vec())
}

pub fn handle_request(root: &Path, request: &Request<Vec<u8>>) -> Response<Vec<u8>> {
    let path = match resolve_request(root, request.uri().path()) {
        Ok(path) => path,
        Err(status) => return error_response(status),
    };
    let media_type = media_type_for(&path).unwrap_or("application/octet-stream");
    match fs::read(&path) {
        Ok(bytes) => material_response(StatusCode::OK, media_type, bytes),
        Err(_) => error_response(StatusCode::NOT_FOUND),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("ifp-material-{name}-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp root");
        path
    }

    fn request(path: &str) -> Request<Vec<u8>> {
        Request::builder()
            .uri(format!("http://ifp-content.localhost{path}"))
            .body(Vec::new())
            .expect("request")
    }

    #[test]
    fn seeds_sample_bundle_idempotently() {
        let root = temp_root("seed");
        let first = ensure_sample_material(&root).expect("seed");
        let manifest_before = fs::read(first.join("material.json")).expect("manifest");
        let second = ensure_sample_material(&root).expect("reseed");
        let manifest_after = fs::read(second.join("material.json")).expect("manifest");

        assert_eq!(first, second);
        assert_eq!(manifest_before, manifest_after);
        assert!(first.join("index.html").is_file());
        assert!(first.join("assets/cover.png").is_file());
        assert!(first.join("transcript.txt").is_file());
        assert!(!root.join(".staging").exists());

        let manifest: serde_json::Value = serde_json::from_slice(&manifest_before).expect("json");
        assert_eq!(manifest["materialId"], SAMPLE_MATERIAL_ID);
        assert_eq!(manifest["entry"], "index.html");
        let files = manifest["files"].as_array().expect("files");
        assert_eq!(files.len(), SAMPLE_FILES.len());
        for file in files {
            assert!(file["sha256"].as_str().unwrap_or("").len() == 64);
        }

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn opens_sample_manifest_with_transcript() {
        let root = temp_root("open");
        let directory = ensure_sample_material(&root).expect("seed");
        let view = open_material(&root, &directory, SAMPLE_MATERIAL_ID, SAMPLE_VERSION)
            .expect("open");

        assert_eq!(view.material_id, SAMPLE_MATERIAL_ID);
        assert_eq!(view.entry_path, "contoh-siklus-air/1.0.0/index.html");
        assert_eq!(view.completion_mode, "signal");
        assert_eq!(view.completion_min_dwell_seconds, 2);
        assert!(view.transcript.contains("SIKLUS AIR"));
        assert!(view.accessibility.keyboard_navigable);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn serves_entry_and_rejects_bad_paths() {
        let root = temp_root("serve");
        ensure_sample_material(&root).expect("seed");

        let entry = handle_request(&root, &request("/contoh-siklus-air/1.0.0/index.html"));
        assert_eq!(entry.status(), StatusCode::OK);
        assert_eq!(entry.headers()[header::CONTENT_TYPE], "text/html; charset=utf-8");
        assert!(!entry.body().is_empty());

        let script = handle_request(&root, &request("/contoh-siklus-air/1.0.0/assets/app.js"));
        assert_eq!(script.status(), StatusCode::OK);

        let traversal = handle_request(&root, &request("/contoh-siklus-air/1.0.0/../../ifp.db"));
        assert_eq!(traversal.status(), StatusCode::BAD_REQUEST);

        let encoded = handle_request(&root, &request("/contoh-siklus-air/1.0.0/%2e%2e/seed.json"));
        assert_eq!(encoded.status(), StatusCode::BAD_REQUEST);

        let unknown_material = handle_request(&root, &request("/materi-lain/1.0.0/index.html"));
        assert_eq!(unknown_material.status(), StatusCode::NOT_FOUND);

        let staging = handle_request(&root, &request("/.staging/1.0.0/index.html"));
        assert_eq!(staging.status(), StatusCode::BAD_REQUEST);

        fs::write(root.join("contoh-siklus-air/1.0.0/notes.bin"), b"x").expect("write bin");
        let wrong_type = handle_request(&root, &request("/contoh-siklus-air/1.0.0/notes.bin"));
        assert_eq!(wrong_type.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
    }
}
