use crate::error::AppError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::Path;

/// Batas ukuran satu bundel materi (kontrak bundel v1 §3).
pub const MAX_BUNDLE_BYTES: u64 = 50 * 1024 * 1024;
pub const ENTRY_PATH: &str = "index.html";
/// Batas satu berkas video; gambar/suara tetap 8 MB di lapisan author.
pub const MAX_VIDEO_BYTES: u64 = 25 * 1024 * 1024;

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
    ("mp4", "video/mp4", "video/mp4"),
    ("webm", "video/webm", "video/webm"),
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

pub fn is_video(path: &str) -> bool {
    matches!(extension_of(path).as_deref(), Some("mp4" | "webm"))
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

const SCENE_SCRIPT_OPEN: &str = "<script type=\"application/json\" id=\"ifp-scene\">";
const SCENE_SCRIPT_CLOSE: &str = "</script>";

fn has_external(value: &str) -> Option<&'static str> {
    EXTERNAL_PATTERNS
        .iter()
        .find(|pattern| value.contains(*pattern))
        .copied()
}

/// Blok naskah `ifp-scene`: (awal skrip, akhir sesudah `</script>`, isi JSON).
fn scene_segment(html: &str) -> Option<(usize, usize, &str)> {
    let start = html.find(SCENE_SCRIPT_OPEN)?;
    let body_start = start + SCENE_SCRIPT_OPEN.len();
    let body_end = body_start + html[body_start..].find(SCENE_SCRIPT_CLOSE)?;
    Some((start, body_end + SCENE_SCRIPT_CLOSE.len(), &html[body_start..body_end]))
}

fn is_https_url(value: &str) -> bool {
    let trimmed = value.trim();
    trimmed
        .to_ascii_lowercase()
        .strip_prefix("https://")
        .is_some_and(|rest| !rest.is_empty())
        && !trimmed.chars().any(|character| character.is_whitespace() || character.is_control())
}

fn is_youtube_url(value: &str) -> bool {
    let lower = value.trim().to_ascii_lowercase();
    let Some(rest) = lower.strip_prefix("https://") else {
        return false;
    };
    let host = rest.split('/').next().unwrap_or("");
    let host = host.split(':').next().unwrap_or("");
    matches!(
        host,
        "youtube.com"
            | "www.youtube.com"
            | "m.youtube.com"
            | "youtu.be"
            | "www.youtu.be"
            | "youtube-nocookie.com"
            | "www.youtube-nocookie.com"
    )
}

fn block_text<'a>(block: &'a Value, key: &str) -> &'a str {
    block.get(key).and_then(Value::as_str).unwrap_or("")
}

fn block_array<'a>(value: &'a Value, key: &str) -> &'a [Value] {
    value.get(key).and_then(Value::as_array).map(Vec::as_slice).unwrap_or(&[])
}

/// ID video dari tautan YouTube: bentuk `watch?v=`, `youtu.be/<id>`, atau
/// segmen pertama `embed|shorts|live|v`. Host harus YouTube; `None` bila bentuk
/// atau ID-nya tidak sah (sebelas karakter `A-Za-z0-9-_`).
fn youtube_video_id(url: &str) -> Option<&str> {
    let rest = url.trim().strip_prefix("https://")?;
    let (host, path) = match rest.split_once('/') {
        Some(split) => split,
        None => (rest, ""),
    };
    let host = host
        .to_ascii_lowercase()
        .trim_start_matches("www.")
        .trim_start_matches("m.")
        .to_string();
    if !matches!(host.as_str(), "youtube.com" | "youtu.be" | "youtube-nocookie.com") {
        return None;
    }
    let (path_only, query) = match path.split_once('?') {
        Some(split) => (split.0, Some(split.1)),
        None => (path, None),
    };
    let segments: Vec<&str> = path_only
        .split('/')
        .filter(|segment| !segment.is_empty())
        .collect();
    let candidate = if host == "youtu.be" {
        segments.first().copied()?
    } else {
        match segments.first().copied() {
            Some("watch") => query?
                .split('&')
                .find_map(|pair| pair.strip_prefix("v="))?,
            Some("embed") | Some("shorts") | Some("live") | Some("v") => {
                segments.get(1).copied()?
            }
            _ => return None,
        }
    };
    let id = candidate.split('#').next().unwrap_or(candidate);
    (id.len() == 11
        && id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "-_".contains(character)))
    .then_some(id)
}

/// Alamat pemutar yang dirender dari blok video YouTube. Bundel menyimpan tautan
/// yang dideklarasikan penulis, sementara `index.html` memuat embed nocookie-nya,
/// jadi alamat turunan itu ikut dinetralkan sebelum pemindaian rujukan eksternal.
fn scene_embed_urls(scene: &Value) -> Vec<String> {
    block_array(scene, "steps")
        .iter()
        .flat_map(|step| block_array(step, "blocks"))
        .filter(|block| {
            block_text(block, "kind") == "video" && block_text(block, "source") == "youtube"
        })
        .filter_map(|block| youtube_video_id(block_text(block, "url")))
        .map(|id| format!("https://www.youtube-nocookie.com/embed/{id}"))
        .collect()
}

/// Memeriksa blok video/sematan di naskah dan mengumpulkan URL https yang
/// dideklarasikan penulis. Blok teks/gambar/suara tetap dilarang memuat alamat.
fn scene_urls(scene: &Value) -> Result<Vec<String>, String> {
    let mut urls = Vec::new();
    for (step_index, step) in block_array(scene, "steps").iter().enumerate() {
        for (block_index, block) in block_array(step, "blocks").iter().enumerate() {
            let where_ = format!("Langkah {} blok {}", step_index + 1, block_index + 1);
            let title = block_text(block, "title").trim();
            match block_text(block, "kind") {
                "video" => {
                    let url = block_text(block, "url").trim();
                    match block_text(block, "source") {
                        "lokal" => {}
                        "youtube" => {
                            if !is_https_url(url) || !is_youtube_url(url) {
                                return Err(format!(
                                    "{where_}: tautan YouTube harus alamat https://youtube.com atau https://youtu.be."
                                ));
                            }
                            urls.push(url.to_string());
                        }
                        "daring" => {
                            if !is_https_url(url) {
                                return Err(format!(
                                    "{where_}: berkas video daring harus alamat https://."
                                ));
                            }
                            urls.push(url.to_string());
                        }
                        _ => return Err(format!("{where_}: sumber video tidak dikenal.")),
                    }
                    if title.is_empty() {
                        return Err(format!("{where_}: judul video wajib diisi."));
                    }
                }
                "semat" => {
                    let url = block_text(block, "url").trim();
                    if !is_https_url(url) {
                        return Err(format!("{where_}: alamat sematan harus https://."));
                    }
                    if title.is_empty() {
                        return Err(format!("{where_}: judul sematan wajib diisi."));
                    }
                    urls.push(url.to_string());
                }
                kind => {
                    for key in ["text", "caption", "alt", "label"] {
                        if has_external(&block_text(block, key).to_ascii_lowercase()).is_some() {
                            return Err(format!(
                                "{where_}: {key} memuat alamat web; blok {kind} harus mandiri."
                            ));
                        }
                    }
                }
            }
        }
    }
    Ok(urls)
}

/// URL daring yang dideklarasikan blok video/sematan di index.html.
pub fn scene_remote_urls(html: &str) -> Vec<String> {
    scene_segment(html)
        .and_then(|(_, _, body)| serde_json::from_str::<Value>(body).ok())
        .and_then(|scene| scene_urls(&scene).ok())
        .unwrap_or_default()
}

fn escape_attr(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// Menolak sumber daya jaringan di HTML/JS/CSS, kecuali URL yang dideklarasikan
/// blok video/sematan pada naskah `ifp-scene`. Pemeriksaan pola + tinjauan
/// manusia sesuai kontrak; bukan pengganti sandbox iframe/CSP.
pub fn ensure_self_contained(path: &str, bytes: &[u8]) -> Result<(), AppError> {
    let source = String::from_utf8_lossy(bytes);
    let mut rest = source.to_string();
    let mut allowed: Vec<String> = Vec::new();

    if extension_of(path).as_deref() == Some("html") {
        if let Some((start, end, body)) = scene_segment(&source) {
            let scene: Value = serde_json::from_str(body).map_err(|_| {
                AppError::material_not_self_contained(&format!(
                    "Berkas {path}: blok naskah ifp-scene bukan JSON yang sah."
                ))
            })?;
            allowed = scene_urls(&scene).map_err(|message| {
                AppError::material_not_self_contained(&format!("Berkas {path}: {message}"))
            })?;
            allowed.extend(scene_embed_urls(&scene));
            rest = format!("{}{}", &source[..start], &source[end..]);
        }
    }

    let mut lowered = rest.to_ascii_lowercase();
    for url in &allowed {
        let plain = url.to_ascii_lowercase();
        lowered = lowered.replace(&plain, "about:blank");
        let escaped = escape_attr(url).to_ascii_lowercase();
        if escaped != plain {
            lowered = lowered.replace(&escaped, "about:blank");
        }
    }
    if let Some(pattern) = has_external(&lowered) {
        return Err(AppError::material_not_self_contained(&format!(
            "Berkas {path} memuat rujukan eksternal ({pattern}) di luar blok video/sematan."
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scene_html(blocks: &str) -> String {
        format!(
            "<!doctype html><html><body><script type=\"application/json\" id=\"ifp-scene\">{{\"schemaVersion\":1,\"steps\":[{{\"blocks\":[{blocks}]}}]}}</script><script src=\"assets/app.js\"></script></body></html>"
        )
    }

    #[test]
    fn video_media_types_allowed() {
        assert_eq!(bare_media_type("assets/video.mp4"), Some("video/mp4"));
        assert_eq!(bare_media_type("assets/video.webm"), Some("video/webm"));
        assert!(is_video("assets/video.mp4"));
        assert!(!is_video("assets/gambar.webp"));
    }

    #[test]
    fn declared_remote_blocks_are_allowed() {
        let html = scene_html(
            r#"{"kind":"video","source":"youtube","url":"https://www.youtube.com/watch?v=abcDEF12345","title":"Pembuka"},{"kind":"semat","url":"https://www.geogebra.org/m/xyz","title":"GeoGebra"}"#,
        );
        assert!(ensure_self_contained("index.html", html.as_bytes()).is_ok());
        assert_eq!(scene_remote_urls(&html).len(), 2);
    }

    /// `index.html` hasil susunan memuat alamat pemutar turunan, bukan tautan
    /// yang dideklarasikan penulis, jadi keduanya harus dikenali.
    #[test]
    fn rendered_youtube_embed_is_allowed() {
        let embed = "<iframe src=\"https://www.youtube-nocookie.com/embed/abcDEF12345?rel=0\"></iframe>";
        let html = scene_html(
            r#"{"kind":"video","source":"youtube","url":"https://www.youtube.com/watch?v=abcDEF12345","title":"Pembuka"}"#,
        )
        .replace("</body>", &format!("{embed}</body>"));
        assert!(ensure_self_contained("index.html", html.as_bytes()).is_ok());

        let asing = html.replace("abcDEF12345?rel=0", "ZYXWVUTSRQP?rel=0");
        assert!(
            ensure_self_contained("index.html", asing.as_bytes()).is_err(),
            "Embed YouTube dengan id di luar naskah tidak boleh ikut lolos."
        );
    }

    #[test]
    fn youtube_video_id_accepts_link_shapes() {
        for url in [
            "https://www.youtube.com/watch?v=abcDEF12345",
            "https://youtu.be/abcDEF12345",
            "https://m.youtube.com/watch?v=abcDEF12345&list=PL1",
            "https://www.youtube.com/embed/abcDEF12345",
            "https://www.youtube.com/shorts/abcDEF12345",
        ] {
            assert_eq!(
                youtube_video_id(url),
                Some("abcDEF12345"),
                "ID tidak terbaca dari {url}"
            );
        }
        assert_eq!(youtube_video_id("https://www.youtube.com/watch?v=pendek"), None);
        assert_eq!(youtube_video_id("https://contoh.test/watch?v=abcDEF12345"), None);
    }

    #[test]
    fn escaped_url_in_markup_is_allowed() {
        let html = scene_html(
            r#"{"kind":"semat","url":"https://www.geogebra.org/m/a?b=1&c=2","title":"GeoGebra"}"#,
        )
        .replace(
            "</body>",
            "<iframe src=\"https://www.geogebra.org/m/a?b=1&amp;c=2\"></iframe></body>",
        );
        assert!(ensure_self_contained("index.html", html.as_bytes()).is_ok());
    }

    #[test]
    fn undeclared_external_reference_is_rejected() {
        let text = scene_html(r#"{"kind":"teks","text":"lihat https://contoh.test"}"#);
        assert!(ensure_self_contained("index.html", text.as_bytes()).is_err());

        let script = scene_html(
            r#"{"kind":"video","source":"youtube","url":"https://www.youtube.com/watch?v=abcDEF12345","title":"Pembuka"}"#,
        )
        .replace("assets/app.js", "https://cdn.contoh.test/app.js");
        assert!(ensure_self_contained("index.html", script.as_bytes()).is_err());
    }

    #[test]
    fn unsafe_scene_urls_are_rejected() {
        for url in [
            "http://youtu.be/abcDEF12345",
            "https://contoh.test/video.mp4",
            "javascript:alert(1)",
        ] {
            let html = scene_html(&format!(
                r#"{{"kind":"video","source":"youtube","url":"{url}","title":"Pembuka"}}"#
            ));
            assert!(
                ensure_self_contained("index.html", html.as_bytes()).is_err(),
                "URL harus ditolak: {url}"
            );
        }
    }

    #[test]
    fn remote_blocks_need_title() {
        let html = scene_html(r#"{"kind":"semat","url":"https://www.geogebra.org/m/xyz","title":""}"#);
        assert!(ensure_self_contained("index.html", html.as_bytes()).is_err());
    }
}
