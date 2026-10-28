use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::path::Path;

/// Batas ukuran satu bundel materi (kontrak bundel v1 §3).
pub const MAX_BUNDLE_BYTES: u64 = 50 * 1024 * 1024;
pub const ENTRY_PATH: &str = "index.html";

/// (ekstensi, tipe MIME telanjang untuk manifest, tipe MIME yang disajikan)
const MEDIA_TYPES: &[(&str, &str, &str)] = &[
    ("html", "text/html", "text/html; charset=utf-8"),
    ("js", "text/javascript", "text/javascript; charset=utf-8"),
    ("mjs", "text/javascript", "text/javascript; charset=utf-8"),
    ("css", "text/css", "text/css; charset=utf-8"),
    ("json", "application/json", "application/json; charset=utf-8"),
    ("webp", "image/webp", "image/webp"),
    ("png", "image/png", "image/png"),
    ("jpg", "image/jpeg", "image/jpeg"),
    ("jpeg", "image/jpeg", "image/jpeg"),
    ("gif", "image/gif", "image/gif"),
    ("svg", "image/svg+xml", "image/svg+xml"),
    ("mp3", "audio/mpeg", "audio/mpeg"),
    ("m4a", "audio/mp4", "audio/mp4"),
    ("ogg", "audio/ogg", "audio/ogg"),
    ("wav", "audio/wav", "audio/wav"),
    ("woff2", "font/woff2", "font/woff2"),
    ("ttf", "font/ttf", "font/ttf"),
    ("vtt", "text/vtt", "text/vtt; charset=utf-8"),
    ("txt", "text/plain", "text/plain; charset=utf-8"),
];

/// Pola sumber daya eksternal yang dilarang di dalam bundel (kontrak §3).
/// Ini pemeriksaan pola, bukan sandbox; sandbox tetap iframe + CSP.
const EXTERNAL_PATTERNS: &[&str] = &[
    "http://",
    "https://",
    "ws://",
    "wss://",
    "window.open",
    "xmlhttprequest",
    "new websocket",
    "fetch(",
];

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Accessibility {
    pub has_audio: bool,
    pub keyboard_navigable: bool,
    pub supports_reduced_motion: bool,
    pub contrast_checked: bool,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Completion {
    pub mode: String,
    #[serde(default)]
    pub min_dwell_seconds: Option<u32>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Publisher {
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CurriculumRef {
    pub framework: String,
    pub id: String,
    pub version: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MaterialFile {
    pub path: String,
    pub media_type: String,
    pub bytes: u64,
    pub sha256: String,
}

/// Manifest materi v1 (kontrak bundel §4): objek strict, field tak dikenal ditolak.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MaterialManifest {
    pub schema_version: String,
    pub material_id: String,
    pub version: String,
    pub title: String,
    pub summary: String,
    pub locale: String,
    pub grade_levels: Vec<u32>,
    pub subjects: Vec<String>,
    #[serde(default)]
    pub topics: Vec<String>,
    #[serde(default)]
    pub curriculum_refs: Vec<CurriculumRef>,
    pub estimated_minutes: u32,
    pub entry: String,
    pub cover: String,
    pub transcript_path: String,
    #[serde(default)]
    pub captions_path: Option<String>,
    pub accessibility: Accessibility,
    pub completion: Completion,
    pub min_app_version: String,
    pub publisher: Publisher,
    pub review_status: String,
    pub files: Vec<MaterialFile>,
}

fn extension_of(path: &str) -> Option<String> {
    Path::new(path)
        .extension()
        .and_then(|value| value.to_str())
        .map(str::to_ascii_lowercase)
}

fn lookup(extension: &str, column: usize) -> Option<&'static str> {
    MEDIA_TYPES
        .iter()
        .find(|entry| entry.0 == extension)
        .map(|entry| if column == 1 { entry.1 } else { entry.2 })
}

/// Tipe MIME yang dipakai protokol `ifp-content` untuk menyajikan berkas.
pub fn media_type_for(path: &Path) -> Option<&'static str> {
    let extension = path.extension()?.to_str()?.to_ascii_lowercase();
    lookup(&extension, 2)
}

pub fn bare_media_type(path: &str) -> Option<&'static str> {
    lookup(&extension_of(path)?, 1)
}

pub fn is_text_source(path: &str) -> bool {
    matches!(extension_of(path).as_deref(), Some("html" | "js" | "mjs" | "css"))
}

pub fn is_image(path: &str) -> bool {
    matches!(
        extension_of(path).as_deref(),
        Some("webp" | "png" | "jpg" | "jpeg")
    )
}

pub fn validate_relative_path(value: &str) -> Result<(), AppError> {
    if value.is_empty() || value.len() > 512 || value.contains('\\') || value.contains(':') {
        return Err(AppError::material_invalid("Path materi tidak valid."));
    }
    let path = Path::new(value);
    if path.is_absolute() {
        return Err(AppError::material_invalid("Path absolut tidak diizinkan di materi."));
    }
    for component in path.components() {
        match component {
            std::path::Component::Normal(_) => {}
            _ => return Err(AppError::material_invalid("Path traversal tidak diizinkan di materi.")),
        }
    }
    Ok(())
}

pub fn is_material_id(value: &str) -> bool {
    let mut characters = value.chars();
    let Some(first) = characters.next() else {
        return false;
    };
    value.len() >= 3
        && value.len() <= 64
        && first.is_ascii_lowercase()
        && characters
            .all(|character| character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-')
}

pub fn is_semver(value: &str) -> bool {
    if value.is_empty() || value.len() > 64 {
        return false;
    }
    let core = value.split(['-', '+']).next().unwrap_or("");
    let parts: Vec<&str> = core.split('.').collect();
    parts.len() == 3
        && parts
            .iter()
            .all(|part| !part.is_empty() && part.len() <= 6 && part.chars().all(|c| c.is_ascii_digit()))
}

fn semver_tuple(value: &str) -> Option<(u64, u64, u64)> {
    if !is_semver(value) {
        return None;
    }
    let core = value.split(['-', '+']).next().unwrap_or("");
    let mut parts = core.split('.').map(|part| part.parse::<u64>().ok());
    Some((parts.next()??, parts.next()??, parts.next()??))
}

fn is_locale(value: &str) -> bool {
    let mut parts = value.split('-');
    let Some(language) = parts.next() else {
        return false;
    };
    (2..=3).contains(&language.len())
        && language.chars().all(|c| c.is_ascii_alphabetic())
        && parts.all(|part| {
            (2..=8).contains(&part.len()) && part.chars().all(|c| c.is_ascii_alphanumeric())
        })
}

fn is_hex64(value: &str) -> bool {
    value.len() == 64 && value.chars().all(|c| c.is_ascii_hexdigit())
}

fn is_subject_slug(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
}

fn invalid(message: &str) -> AppError {
    AppError::material_invalid(message)
}

/// Validasi manifest terhadap kontrak bundel v1, termasuk kecocokan versi aplikasi.
pub fn validate(manifest: &MaterialManifest, app_version: &str) -> Result<(), AppError> {
    if !manifest.schema_version.starts_with("1.") {
        return Err(AppError::material_schema_unsupported(
            "schemaVersion materi tidak didukung (hanya 1.x).",
        ));
    }
    if !is_material_id(&manifest.material_id) {
        return Err(invalid("materialId harus slug huruf kecil 3–64 karakter."));
    }
    if !is_semver(&manifest.version) {
        return Err(invalid("version materi harus SemVer (mis. 1.0.0)."));
    }
    let title_chars = manifest.title.chars().count();
    if !(3..=200).contains(&title_chars) {
        return Err(invalid("title materi harus 3–200 karakter."));
    }
    let summary_chars = manifest.summary.chars().count();
    if !(1..=300).contains(&summary_chars) {
        return Err(invalid("summary materi harus 1–300 karakter."));
    }
    if !is_locale(&manifest.locale) {
        return Err(invalid("locale materi tidak valid (mis. id-ID)."));
    }

    if manifest.grade_levels.is_empty() || manifest.grade_levels.len() > 6 {
        return Err(invalid("gradeLevels harus 1–6 entri."));
    }
    let mut grades = std::collections::HashSet::new();
    for grade in &manifest.grade_levels {
        if !(1..=6).contains(grade) || !grades.insert(*grade) {
            return Err(invalid("gradeLevels harus unik dan bernilai 1–6."));
        }
    }

    if manifest.subjects.is_empty() || manifest.subjects.len() > 24 {
        return Err(invalid("subjects harus 1–24 entri."));
    }
    let mut subjects = std::collections::HashSet::new();
    for subject in &manifest.subjects {
        if !is_subject_slug(subject) || !subjects.insert(subject.as_str()) {
            return Err(invalid("subjects harus slug unik."));
        }
    }

    if manifest.topics.len() > 12 || manifest.topics.iter().any(|topic| topic.chars().count() > 80) {
        return Err(invalid("topics maksimal 12 label, tiap ≤ 80 karakter."));
    }
    if manifest.curriculum_refs.len() > 24 {
        return Err(invalid("curriculumRefs maksimal 24 entri."));
    }
    for reference in &manifest.curriculum_refs {
        if reference.framework.is_empty()
            || reference.framework.len() > 64
            || reference.id.is_empty()
            || reference.id.len() > 128
            || reference.version.is_empty()
            || reference.version.len() > 32
        {
            return Err(invalid("curriculumRefs tidak valid."));
        }
    }

    if !(1..=60).contains(&manifest.estimated_minutes) {
        return Err(invalid("estimatedMinutes harus 1–60."));
    }
    if manifest.entry != ENTRY_PATH {
        return Err(invalid("entry materi harus index.html."));
    }

    for path in [&manifest.cover, &manifest.transcript_path] {
        validate_relative_path(path)?;
    }
    if !is_image(&manifest.cover) {
        return Err(invalid("cover harus WebP, PNG, atau JPG."));
    }
    if extension_of(&manifest.transcript_path).as_deref() != Some("txt") {
        return Err(invalid("transcriptPath harus berkas .txt."));
    }
    if manifest.accessibility.has_audio {
        let captions = manifest
            .captions_path
            .as_ref()
            .ok_or_else(|| invalid("captionsPath wajib bila materi memiliki audio."))?;
        validate_relative_path(captions)?;
        if extension_of(captions).as_deref() != Some("vtt") {
            return Err(invalid("captionsPath harus berkas .vtt."));
        }
    } else if let Some(captions) = &manifest.captions_path {
        validate_relative_path(captions)?;
    }
    if !manifest.accessibility.keyboard_navigable {
        return Err(invalid("Materi harus keyboardNavigable."));
    }

    if manifest.completion.mode != "none" && manifest.completion.mode != "signal" {
        return Err(invalid("completion.mode harus none atau signal."));
    }
    if manifest
        .completion
        .min_dwell_seconds
        .is_some_and(|seconds| seconds > 600)
    {
        return Err(invalid("completion.minDwellSeconds maksimal 600."));
    }

    if !is_semver(&manifest.min_app_version) {
        return Err(invalid("minAppVersion harus SemVer."));
    }
    let publisher_chars = manifest.publisher.name.chars().count();
    if !(1..=80).contains(&publisher_chars) {
        return Err(invalid("publisher.name harus 1–80 karakter."));
    }
    if !matches!(manifest.review_status.as_str(), "draft" | "reviewed" | "approved") {
        return Err(invalid("reviewStatus tidak dikenal."));
    }

    if manifest.files.len() < 2 {
        return Err(invalid("files harus memuat minimal 2 berkas."));
    }
    let mut listed = std::collections::HashSet::new();
    for file in &manifest.files {
        validate_relative_path(&file.path)?;
        if file.path == "material.json" {
            return Err(invalid("material.json tidak boleh terdaftar di files."));
        }
        if !listed.insert(file.path.to_ascii_lowercase()) {
            return Err(invalid("files memuat path duplikat."));
        }
        let expected = bare_media_type(&file.path)
            .ok_or_else(|| invalid(&format!("Tipe berkas tidak diizinkan: {}", file.path)))?;
        if file.media_type != expected {
            return Err(invalid(&format!("mediaType tidak cocok untuk {}", file.path)));
        }
        if file.bytes == 0 {
            return Err(invalid("Ukuran berkas materi harus lebih dari 0."));
        }
        if !is_hex64(&file.sha256) {
            return Err(invalid(&format!("sha256 berkas tidak valid: {}", file.path)));
        }
    }
    for required in ["index.html", manifest.cover.as_str(), manifest.transcript_path.as_str()] {
        if !listed.contains(&required.to_ascii_lowercase()) {
            return Err(invalid(&format!("Berkas wajib tidak ada di files: {required}")));
        }
    }
    if let Some(captions) = &manifest.captions_path {
        if manifest.accessibility.has_audio && !listed.contains(&captions.to_ascii_lowercase()) {
            return Err(invalid("captionsPath harus terdaftar di files."));
        }
    }

    let required_version = semver_tuple(&manifest.min_app_version)
        .ok_or_else(|| invalid("minAppVersion harus SemVer."))?;
    if let Some(current) = semver_tuple(app_version) {
        if required_version > current {
            return Err(AppError::material_incompatible_app(&manifest.min_app_version));
        }
    }

    Ok(())
}

/// Menolak sumber daya jaringan di HTML/JS/CSS. Pemeriksaan pola + tinjauan
/// manusia sesuai kontrak; bukan pengganti sandbox iframe/CSP.
pub fn ensure_self_contained(path: &str, bytes: &[u8]) -> Result<(), AppError> {
    let text = String::from_utf8_lossy(bytes).to_ascii_lowercase();
    if let Some(pattern) = EXTERNAL_PATTERNS.iter().find(|pattern| text.contains(*pattern)) {
        return Err(AppError::material_not_self_contained(&format!(
            "Berkas {path} memuat rujukan eksternal ({pattern})."
        )));
    }
    Ok(())
}
