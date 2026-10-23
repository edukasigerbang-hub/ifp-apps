use crate::db::DbState;
use crate::error::AppError;
use crate::validation::validate_token;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use std::fs;
use std::path::{Component, Path, PathBuf};
use tauri::State;

const MAX_FILES: usize = 5000;
const MAX_TOTAL_BYTES: u64 = 2_147_483_648;
const MAX_DEPTH: usize = 12;
const SUPPORTED_SCHEMA_VERSION: &str = "1.0.0";

pub struct ContentState {
    pub root: PathBuf,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportInput {
    pub source_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub package_id: String,
    pub version: String,
    pub previous_version: Option<String>,
    pub files: usize,
    pub bytes: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageRecord {
    pub package_id: String,
    pub version: String,
    pub status: String,
    pub source: String,
    pub installed_at: String,
    pub activated_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RollbackResult {
    pub package_id: String,
    pub active_version: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Manifest {
    manifest_version: u32,
    package_id: String,
    package_version: String,
    schema_version: String,
    assets: Vec<ManifestAsset>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManifestAsset {
    path: String,
    size_bytes: u64,
    sha256: String,
}

struct CollectedFile {
    relative: String,
    absolute: PathBuf,
    size: u64,
}

fn validate_version(value: &str) -> Result<(), AppError> {
    let valid = !value.is_empty()
        && value.len() <= 64
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '+'));
    if valid {
        Ok(())
    } else {
        Err(AppError::content_invalid("Versi paket tidak valid."))
    }
}

fn validate_relative_path(value: &str) -> Result<(), AppError> {
    if value.is_empty() || value.len() > 512 || value.contains('\\') {
        return Err(AppError::content_invalid("Path di dalam paket tidak valid."));
    }
    let path = Path::new(value);
    if path.is_absolute() {
        return Err(AppError::content_invalid("Path absolut tidak diizinkan."));
    }
    for component in path.components() {
        match component {
            Component::Normal(_) => {}
            _ => return Err(AppError::content_invalid("Path traversal tidak diizinkan.")),
        }
    }
    Ok(())
}

fn hex_digest(data: &[u8]) -> String {
    Sha256::digest(data)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn collect_files(root: &Path) -> Result<(Vec<CollectedFile>, u64), AppError> {
    let mut files = Vec::new();
    let mut total: u64 = 0;
    walk(root, root, 0, &mut files, &mut total)?;
    Ok((files, total))
}

fn walk(
    base: &Path,
    current: &Path,
    depth: usize,
    files: &mut Vec<CollectedFile>,
    total: &mut u64,
) -> Result<(), AppError> {
    if depth > MAX_DEPTH {
        return Err(AppError::content_invalid("Struktur paket terlalu dalam."));
    }

    let entries = fs::read_dir(current).map_err(|_| AppError::content_invalid("Paket tidak dapat dibaca."))?;
    for entry in entries {
        let entry = entry.map_err(|_| AppError::content_invalid("Entri paket tidak valid."))?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path)
            .map_err(|_| AppError::content_invalid("Metadata paket tidak dapat dibaca."))?;

        if metadata.file_type().is_symlink() {
            return Err(AppError::content_invalid("Symlink tidak diizinkan di dalam paket."));
        }

        let relative = path
            .strip_prefix(base)
            .map_err(|_| AppError::content_invalid("Path paket tidak valid."))?
            .to_string_lossy()
            .replace('\\', "/");
        validate_relative_path(&relative)?;

        if metadata.is_dir() {
            walk(base, &path, depth + 1, files, total)?;
        } else if metadata.is_file() {
            let size = metadata.len();
            *total += size;
            if *total > MAX_TOTAL_BYTES {
                return Err(AppError::content_invalid("Ukuran paket melebihi batas."));
            }
            files.push(CollectedFile {
                relative,
                absolute: path,
                size,
            });
            if files.len() > MAX_FILES {
                return Err(AppError::content_invalid("Jumlah file melebihi batas."));
            }
        } else {
            return Err(AppError::content_invalid("Jenis file tidak didukung di dalam paket."));
        }
    }

    Ok(())
}

fn parse_manifest(source: &Path) -> Result<(Manifest, Vec<u8>), AppError> {
    let raw = fs::read(source.join("manifest.json"))
        .map_err(|_| AppError::content_invalid("manifest.json tidak ditemukan."))?;
    let manifest: Manifest = serde_json::from_slice(&raw)
        .map_err(|_| AppError::content_invalid("manifest.json tidak valid."))?;
    Ok((manifest, raw))
}

fn validate_manifest(source: &Path, manifest: &Manifest, files: &[CollectedFile]) -> Result<(), AppError> {
    if manifest.manifest_version != 1 {
        return Err(AppError::content_invalid("manifestVersion tidak didukung."));
    }
    if manifest.schema_version != SUPPORTED_SCHEMA_VERSION {
        return Err(AppError::content_invalid("schemaVersion tidak didukung."));
    }
    validate_token(&manifest.package_id, "ID paket")?;
    validate_version(&manifest.package_version)?;

    for directory in ["lessons", "activities"] {
        let path = source.join(directory);
        if !path.is_dir() {
            return Err(AppError::content_invalid(&format!("Direktori {directory} tidak ditemukan.")));
        }
        let has_json = fs::read_dir(&path)
            .map_err(|_| AppError::content_invalid("Direktori paket tidak dapat dibaca."))?
            .filter_map(|entry| entry.ok())
            .any(|entry| entry.path().extension().is_some_and(|extension| extension == "json"));
        if !has_json {
            return Err(AppError::content_invalid(&format!("Direktori {directory} tidak memiliki JSON.")));
        }
    }

    let by_path: std::collections::HashMap<&str, &CollectedFile> =
        files.iter().map(|file| (file.relative.as_str(), file)).collect();
    let mut seen = HashSet::new();

    for asset in &manifest.assets {
        validate_relative_path(&asset.path)?;
        if !seen.insert(asset.path.as_str()) {
            return Err(AppError::content_invalid("Path aset duplikat."));
        }
        if asset.sha256.len() != 64 || !asset.sha256.chars().all(|character| character.is_ascii_hexdigit()) {
            return Err(AppError::content_invalid("Hash aset tidak valid."));
        }

        let file = by_path
            .get(asset.path.as_str())
            .ok_or_else(|| AppError::content_invalid(&format!("Aset tidak ditemukan: {}", asset.path)))?;

        if file.size != asset.size_bytes {
            return Err(AppError::content_hash(&format!("Ukuran aset tidak cocok: {}", asset.path)));
        }

        let data = fs::read(&file.absolute)
            .map_err(|_| AppError::content_invalid(&format!("Aset tidak dapat dibaca: {}", asset.path)))?;
        if hex_digest(&data) != asset.sha256.to_ascii_lowercase() {
            return Err(AppError::content_hash(&format!("SHA-256 tidak cocok: {}", asset.path)));
        }
    }

    Ok(())
}

fn activate(
    connection: &mut Connection,
    package_id: &str,
    version: &str,
    manifest_hash: &str,
) -> Result<Option<String>, AppError> {
    let transaction = connection.transaction().map_err(AppError::write)?;

    let previous: Option<String> = transaction
        .query_row(
            "SELECT version FROM content_packages
             WHERE package_id = ?1 AND status = 'active' AND activated_at IS NOT NULL",
            [package_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;

    transaction
        .execute(
            "UPDATE content_packages SET status = 'disabled' WHERE package_id = ?1 AND status = 'active'",
            [package_id],
        )
        .map_err(AppError::write)?;

    transaction
        .execute(
            "INSERT INTO content_packages
               (package_id, version, source, status, manifest_hash, installed_at, activated_at)
             VALUES (?1, ?2, 'imported', 'active', ?3,
                     strftime('%Y-%m-%dT%H:%M:%fZ','now'),
                     strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(package_id, version) DO UPDATE
             SET status = 'active',
                 source = 'imported',
                 manifest_hash = excluded.manifest_hash,
                 installed_at = excluded.installed_at,
                 activated_at = excluded.activated_at",
            params![package_id, version, manifest_hash],
        )
        .map_err(AppError::write)?;

    transaction.commit().map_err(AppError::write)?;

    Ok(previous)
}

pub fn import_package(
    connection: &mut Connection,
    root: &Path,
    source: &Path,
) -> Result<ImportResult, AppError> {
    let (files, total_bytes) = collect_files(source)?;
    let (manifest, manifest_raw) = parse_manifest(source)?;
    validate_manifest(source, &manifest, &files)?;

    let destination = root
        .join("packages")
        .join(&manifest.package_id)
        .join(&manifest.package_version);

    if destination.exists() {
        return Err(AppError::content_activation("Versi paket sudah terpasang."));
    }

    let staging = root.join("staging").join(uuid::Uuid::new_v4().to_string());
    fs::create_dir_all(&staging).map_err(|_| AppError::content_activation("Staging tidak dapat dibuat."))?;

    let staged = (|| -> Result<(), AppError> {
        for file in &files {
            let target = staging.join(&file.relative);
            if let Some(parent) = target.parent() {
                fs::create_dir_all(parent)
                    .map_err(|_| AppError::content_activation("Gagal menyiapkan staging."))?;
            }
            fs::copy(&file.absolute, &target)
                .map_err(|_| AppError::content_activation("Gagal menyalin paket ke staging."))?;
        }
        Ok(())
    })();

    if let Err(error) = staged {
        let _ = fs::remove_dir_all(&staging);
        return Err(error);
    }

    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent)
            .map_err(|_| AppError::content_activation("Folder paket tidak dapat dibuat."))?;
    }

    if let Err(error) = fs::rename(&staging, &destination) {
        let _ = fs::remove_dir_all(&staging);
        return Err(AppError::content_activation(&format!("Aktivasi gagal: {error}")));
    }

    let manifest_hash = hex_digest(&manifest_raw);
    let previous = match activate(connection, &manifest.package_id, &manifest.package_version, &manifest_hash) {
        Ok(previous) => previous,
        Err(error) => {
            let _ = fs::remove_dir_all(&destination);
            return Err(error);
        }
    };

    Ok(ImportResult {
        package_id: manifest.package_id,
        version: manifest.package_version,
        previous_version: previous,
        files: files.len(),
        bytes: total_bytes,
    })
}

pub fn list_packages(connection: &Connection) -> Result<Vec<PackageRecord>, AppError> {
    let mut statement = connection
        .prepare(
            "SELECT package_id, version, status, source, installed_at, activated_at
             FROM content_packages
             ORDER BY package_id ASC, installed_at DESC, version DESC",
        )
        .map_err(AppError::read)?;

    let records = statement
        .query_map([], |row| {
            Ok(PackageRecord {
                package_id: row.get(0)?,
                version: row.get(1)?,
                status: row.get(2)?,
                source: row.get(3)?,
                installed_at: row.get(4)?,
                activated_at: row.get(5)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    Ok(records)
}

pub fn rollback_package(
    connection: &mut Connection,
    root: &Path,
    package_id: &str,
) -> Result<RollbackResult, AppError> {
    validate_token(package_id, "ID paket")?;

    let active: Option<(String, Option<String>)> = connection
        .query_row(
            "SELECT version, activated_at FROM content_packages
             WHERE package_id = ?1 AND status = 'active'",
            [package_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(AppError::read)?;

    let (_active_version, active_at) =
        active.ok_or_else(|| AppError::content_activation("Tidak ada versi aktif untuk paket ini."))?;
    let active_at = active_at.ok_or_else(|| {
        AppError::content_activation("Versi aktif bukan hasil impor; rollback tidak tersedia.")
    })?;

    let previous: Option<String> = connection
        .query_row(
            "SELECT version FROM content_packages
             WHERE package_id = ?1
               AND status = 'disabled'
               AND source = 'imported'
               AND activated_at IS NOT NULL
               AND activated_at < ?2
             ORDER BY activated_at DESC, version DESC
             LIMIT 1",
            params![package_id, active_at],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;

    let previous = previous.ok_or_else(|| AppError::content_activation("Tidak ada versi sebelumnya."))?;

    if !root.join("packages").join(package_id).join(&previous).is_dir() {
        return Err(AppError::content_activation("File versi sebelumnya tidak ditemukan."));
    }

    let transaction = connection.transaction().map_err(AppError::write)?;
    transaction
        .execute(
            "UPDATE content_packages SET status = 'disabled' WHERE package_id = ?1 AND status = 'active'",
            [package_id],
        )
        .map_err(AppError::write)?;
    let changed = transaction
        .execute(
            "UPDATE content_packages SET status = 'active' WHERE package_id = ?1 AND version = ?2",
            params![package_id, previous],
        )
        .map_err(AppError::write)?;
    if changed != 1 {
        return Err(AppError::content_activation("Rollback gagal: versi tidak ditemukan."));
    }
    transaction.commit().map_err(AppError::write)?;

    Ok(RollbackResult {
        package_id: package_id.to_string(),
        active_version: previous,
    })
}

#[tauri::command]
pub fn content_import_package(
    db: State<'_, DbState>,
    content: State<'_, ContentState>,
    input: ImportInput,
) -> Result<ImportResult, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    import_package(&mut connection, &content.root, Path::new(&input.source_path))
}

#[tauri::command]
pub fn content_list_packages(db: State<'_, DbState>) -> Result<Vec<PackageRecord>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_packages(&connection)
}

#[tauri::command]
pub fn content_rollback_package(
    db: State<'_, DbState>,
    content: State<'_, ContentState>,
    package_id: String,
) -> Result<RollbackResult, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    rollback_package(&mut connection, &content.root, &package_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    fn fixture() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../content/packages/matematika-kelas3-pecahan")
    }

    fn temp_root(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!("ifp-content-{name}-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&path).expect("temp root");
        path
    }

    fn copy_dir(from: &Path, to: &Path) {
        fs::create_dir_all(to).expect("copy dir");
        for entry in fs::read_dir(from).expect("read source") {
            let entry = entry.expect("entry");
            let target = to.join(entry.file_name());
            if entry.path().is_dir() {
                copy_dir(&entry.path(), &target);
            } else {
                fs::copy(entry.path(), target).expect("copy file");
            }
        }
    }

    fn source_copy(root: &Path) -> PathBuf {
        let target = root.join("source");
        copy_dir(&fixture(), &target);
        target
    }

    fn manifest_value(source: &Path) -> serde_json::Value {
        serde_json::from_slice(&fs::read(source.join("manifest.json")).expect("manifest")).expect("json")
    }

    fn write_manifest(source: &Path, value: &serde_json::Value) {
        fs::write(
            source.join("manifest.json"),
            serde_json::to_vec_pretty(value).expect("serialize"),
        )
        .expect("write manifest");
    }

    fn active_version(connection: &Connection) -> Option<String> {
        connection
            .query_row(
                "SELECT version FROM content_packages WHERE package_id = 'matematika-kelas3-pecahan' AND status = 'active'",
                [],
                |row| row.get(0),
            )
            .optional()
            .expect("active version")
    }

    #[test]
    fn imports_and_activates_package() {
        let mut connection = test_connection();
        let root = temp_root("import");
        let result = import_package(&mut connection, &root, &fixture()).expect("import");

        assert_eq!(result.package_id, "matematika-kelas3-pecahan");
        assert_eq!(result.version, "0.1.0");
        assert_eq!(result.previous_version, None);
        assert!(result.files >= 7);
        assert!(root
            .join("packages/matematika-kelas3-pecahan/0.1.0/manifest.json")
            .is_file());
        assert_eq!(active_version(&connection).as_deref(), Some("0.1.0"));

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_hash_mismatch_and_cleans_staging() {
        let mut connection = test_connection();
        let root = temp_root("hash");
        let source = source_copy(&root);
        let asset = source.join("assets/pecahan-setengah.png");
        let mut bytes = fs::read(&asset).expect("read asset");
        bytes.push(0);
        fs::write(&asset, bytes).expect("tamper asset");

        let error = import_package(&mut connection, &root, &source).expect_err("must reject");
        assert_eq!(error.code, "CONTENT_ASSET_HASH_MISMATCH");
        assert_eq!(active_version(&connection), None);

        let staging = root.join("staging");
        let staged_entries = fs::read_dir(&staging).map(|entries| entries.count()).unwrap_or(0);
        assert_eq!(staged_entries, 0);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_path_traversal_in_manifest() {
        let mut connection = test_connection();
        let root = temp_root("traversal");
        let source = source_copy(&root);
        let mut manifest = manifest_value(&source);
        manifest["assets"][0]["path"] = serde_json::Value::String("../escape.png".to_string());
        write_manifest(&source, &manifest);

        let error = import_package(&mut connection, &root, &source).expect_err("must reject");
        assert_eq!(error.code, "CONTENT_PACKAGE_INVALID");
        assert_eq!(active_version(&connection), None);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_duplicate_version() {
        let mut connection = test_connection();
        let root = temp_root("duplicate");
        import_package(&mut connection, &root, &fixture()).expect("first import");

        let error = import_package(&mut connection, &root, &fixture()).expect_err("duplicate");
        assert_eq!(error.code, "CONTENT_ACTIVATION_FAILED");

        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM content_packages", [], |row| row.get(0))
            .expect("count");
        assert_eq!(count, 1);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rollback_restores_previous_version() {
        let mut connection = test_connection();
        let root = temp_root("rollback");

        import_package(&mut connection, &root, &fixture()).expect("v1");

        let source_v2 = source_copy(&root);
        let mut manifest = manifest_value(&source_v2);
        manifest["packageVersion"] = serde_json::Value::String("0.2.0".to_string());
        write_manifest(&source_v2, &manifest);
        let v2 = import_package(&mut connection, &root, &source_v2).expect("v2");
        assert_eq!(v2.previous_version.as_deref(), Some("0.1.0"));
        assert_eq!(active_version(&connection).as_deref(), Some("0.2.0"));

        let rollback = rollback_package(&mut connection, &root, "matematika-kelas3-pecahan").expect("rollback");
        assert_eq!(rollback.active_version, "0.1.0");
        assert_eq!(active_version(&connection).as_deref(), Some("0.1.0"));

        let packages = list_packages(&connection).expect("list");
        assert_eq!(packages.len(), 2);
        assert!(packages.iter().any(|row| row.version == "0.1.0" && row.status == "active"));
        assert!(packages.iter().any(|row| row.version == "0.2.0" && row.status == "disabled"));

        let _ = fs::remove_dir_all(&root);
    }
}
