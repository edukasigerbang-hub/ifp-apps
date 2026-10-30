use crate::error::AppError;
use crate::material_manifest::{
    self, is_material_id, media_type_for, Accessibility, MaterialManifest,
};
use base64::Engine as _;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::http::{header, Request, Response, StatusCode};
use tauri::State;

pub const SAMPLE_MATERIAL_ID: &str = "contoh-siklus-air";
pub const SAMPLE_VERSION: &str = "1.0.0";

const SEED_VERSION: u32 = 4;
const MAX_FILE_BYTES: u64 = 50 * 1024 * 1024;
/// Thumbnail cover dikirim ke UI sebagai data URL; batasnya jauh di bawah aset materi.
pub(crate) const MAX_COVER_BYTES: u64 = 2 * 1024 * 1024;

// Berlaku hanya untuk dokumen materi. `connect-src 'none'` menegakkan syarat
// self-contained dari kontrak bundel; sumber eksplisit dipakai karena iframe
// sandbox ber-origin opaque sehingga `'self'` saja tidak dapat diandalkan.
//
// `frame-src https:` dan `media-src … https:` adalah pengecualian terdeklarasi
// dari ADR-0036: blok video (sumber `daring`) dan sematan https dipilih penulis
// dan bebas beralamat. Keduanya hanya bisa bekerja kalau dokumen materi diizinkan
// membingkai/mengambil alamat itu — tanpa ini YouTube dan sematan diblokir CSP
// sebelum ada permintaan jaringan, dan yang terlihat hanyalah bingkai hitam.
// `connect-src` tetap `'none'`: naskah materi tidak boleh memanggil API apa pun.
const MATERIAL_CSP: &str = "default-src 'none'; script-src 'self' ifp-content: http://ifp-content.localhost; style-src 'self' ifp-content: http://ifp-content.localhost; img-src 'self' data: ifp-content: http://ifp-content.localhost; media-src 'self' ifp-content: http://ifp-content.localhost https:; font-src 'self' ifp-content: http://ifp-content.localhost; frame-src https: ifp-content:; connect-src 'none'; form-action 'none'; base-uri 'none'";

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

fn is_valid_version(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '+'))
}

pub(crate) fn open_material(
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
    material_manifest::validate(&manifest, env!("CARGO_PKG_VERSION"))?;

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

/// Tipe gambar ditentukan dari magic bytes, bukan ekstensi atau `Content-Type`:
/// byte-nya yang dipakai renderer, jadi itulah yang harus cocok.
pub(crate) fn sniff_image(bytes: &[u8]) -> Option<&'static str> {
    if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Some("image/webp");
    }
    if bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]) {
        return Some("image/png");
    }
    if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
        return Some("image/jpeg");
    }
    None
}

pub(crate) fn image_data_url(bytes: &[u8]) -> Option<String> {
    let media_type = sniff_image(bytes)?;
    Some(format!(
        "data:{media_type};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    ))
}

/// Cover bundel sebagai data URL untuk thumbnail di UI. Tidak memakai protokol
/// `ifp-content://` supaya `img-src` tidak perlu diperlebar; batas ukuran dan
/// containment tetap diperiksa.
pub(crate) fn cover_data_url(root: &Path, directory: &Path) -> Option<String> {
    let manifest: MaterialManifest =
        serde_json::from_slice(&fs::read(directory.join("material.json")).ok()?).ok()?;
    let canonical_root = fs::canonicalize(root).ok()?;
    let canonical = fs::canonicalize(directory.join(&manifest.cover)).ok()?;
    if !canonical.starts_with(&canonical_root) {
        return None;
    }
    let metadata = fs::metadata(&canonical).ok()?;
    if !metadata.is_file() || metadata.len() > MAX_COVER_BYTES {
        return None;
    }
    image_data_url(&fs::read(canonical).ok()?)
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
    if !is_material_id(&segments[0]) || !is_valid_version(&segments[1]) {
        return None;
    }
    Some(segments)
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
    fn sniffs_image_headers_and_builds_data_url() {
        let cover = SAMPLE_FILES
            .iter()
            .find(|file| file.path.ends_with("cover.png"))
            .expect("cover");
        assert_eq!(sniff_image(cover.bytes), Some("image/png"));
        assert_eq!(sniff_image(b"RIFF\x00\x00\x00\x00WEBPVP8 "), Some("image/webp"));
        assert_eq!(sniff_image(&[0xff, 0xd8, 0xff, 0xe0]), Some("image/jpeg"));
        assert_eq!(sniff_image(b"GIF89a"), None);
        assert_eq!(sniff_image(b"<html></html>"), None);

        let url = image_data_url(cover.bytes).expect("data url");
        assert!(url.starts_with("data:image/png;base64,"));
    }

    #[test]
    fn reads_cover_of_seeded_bundle_as_data_url() {
        let root = temp_root("cover");
        let directory = ensure_sample_material(&root).expect("seed");
        let url = cover_data_url(&root, &directory).expect("cover");
        assert!(url.starts_with("data:image/png;base64,"));
        assert!(url.len() > 1024);

        // Folder tanpa manifest tidak menghasilkan cover, bukan panik.
        let missing = root.join("tidak-ada");
        fs::create_dir_all(&missing).expect("dir");
        assert!(cover_data_url(&root, &missing).is_none());

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

    /// Blok video daring dan sematan https (ADR-0036) hanya bisa berputar kalau
    /// dokumen materi diizinkan membingkainya. Kalau directive ini hilang,
    /// pemutar diblokir sebelum ada permintaan jaringan dan gejalanya berupa
    /// bingkai kosong tanpa pesan.
    #[test]
    fn material_csp_permits_declared_online_media() {
        let root = temp_root("csp");
        ensure_sample_material(&root).expect("seed");
        let entry = handle_request(&root, &request("/contoh-siklus-air/1.0.0/index.html"));
        let csp = entry.headers()["Content-Security-Policy"]
            .to_str()
            .expect("utf-8 csp")
            .to_string();

        let directive = |name: &str| -> String {
            csp.split(';')
                .map(str::trim)
                .find(|part| part.starts_with(&format!("{name} ")))
                .unwrap_or("")
                .to_string()
        };
        assert!(
            directive("frame-src").contains("https:"),
            "frame-src harus mengizinkan https supaya iframe YouTube dan sematan tampil: {csp}"
        );
        assert!(
            directive("media-src").contains("https:"),
            "media-src harus mengizinkan https supaya blok video daring berputar: {csp}"
        );
        assert_eq!(directive("connect-src"), "connect-src 'none'");
        assert!(
            !directive("script-src").contains("https:"),
            "skrip pihak ketiga tidak boleh diizinkan: {csp}"
        );
    }
}
