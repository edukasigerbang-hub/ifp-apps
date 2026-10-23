use crate::db::DbState;
use crate::error::AppError;
use chrono::Utc;
use rusqlite::{backup, Connection, OpenFlags};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tauri::State;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupCounts {
    pub profiles: i64,
    pub sessions: i64,
    pub attempts: i64,
    pub responses: i64,
    pub progress: i64,
    pub outbox: i64,
    pub licenses: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupSummary {
    pub path: String,
    pub bytes: u64,
    pub sha256: String,
    pub created_at: String,
    pub migrations: Vec<i64>,
    pub counts: BackupCounts,
}

fn hex_digest(data: &[u8]) -> String {
    Sha256::digest(data)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn table_count(connection: &Connection, table: &str) -> Result<i64, AppError> {
    let exists: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [table],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    if exists == 0 {
        return Ok(0);
    }
    connection
        .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| row.get(0))
        .map_err(AppError::read)
}

fn summarize(connection: &Connection, path: &Path) -> Result<BackupSummary, AppError> {
    let integrity: String = connection
        .query_row("PRAGMA integrity_check", [], |row| row.get(0))
        .map_err(AppError::read)?;
    if integrity != "ok" {
        return Err(AppError::backup_invalid("Integritas database backup tidak valid."));
    }

    let mut migrations = Vec::new();
    let has_migrations: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'",
            [],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    if has_migrations == 0 {
        return Err(AppError::backup_invalid("Backup tidak memiliki schema_migrations."));
    }
    {
        let mut statement = connection
            .prepare("SELECT version FROM schema_migrations ORDER BY version")
            .map_err(AppError::read)?;
        let rows = statement
            .query_map([], |row| row.get::<_, i64>(0))
            .map_err(AppError::read)?;
        for row in rows {
            migrations.push(row.map_err(AppError::read)?);
        }
    }

    let counts = BackupCounts {
        profiles: table_count(connection, "profiles")?,
        sessions: table_count(connection, "learning_sessions")?,
        attempts: table_count(connection, "activity_attempts")?,
        responses: table_count(connection, "assessment_responses")?,
        progress: table_count(connection, "progress_snapshots")?,
        outbox: table_count(connection, "sync_outbox")?,
        licenses: table_count(connection, "license_state")?,
    };

    let bytes = fs::read(path).map_err(|_| AppError::backup_failed("Backup tidak dapat dibaca."))?;

    Ok(BackupSummary {
        path: path.display().to_string(),
        bytes: bytes.len() as u64,
        sha256: hex_digest(&bytes),
        created_at: Utc::now().to_rfc3339(),
        migrations,
        counts,
    })
}

fn manifest_path(destination: &Path) -> PathBuf {
    let name = destination
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_else(|| "ifp-backup.db".to_string());
    destination.with_file_name(format!("{name}.manifest.json"))
}

pub fn export_backup(
    source: &Connection,
    destination: &Path,
) -> Result<BackupSummary, AppError> {
    if destination.exists() {
        return Err(AppError::backup_failed("File backup sudah ada."));
    }
    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent).map_err(|_| AppError::backup_failed("Folder backup tidak dapat dibuat."))?;
    }

    let mut target = Connection::open(destination)
        .map_err(|_| AppError::backup_failed("File backup tidak dapat dibuat."))?;
    {
        let backup = backup::Backup::new(source, &mut target)
            .map_err(|_| AppError::backup_failed("Backup database gagal dimulai."))?;
        backup
            .run_to_completion(100, Duration::from_millis(5), None)
            .map_err(|_| AppError::backup_failed("Backup database gagal diselesaikan."))?;
    }
    target
        .pragma_update(None, "journal_mode", "DELETE")
        .map_err(|_| AppError::backup_failed("Backup tidak dapat difinalisasi."))?;
    drop(target);

    let summary = summarize(
        &Connection::open(destination).map_err(|_| AppError::backup_failed("Backup tidak dapat dibuka."))?,
        destination,
    )?;

    let manifest = serde_json::to_vec_pretty(&summary)
        .map_err(|_| AppError::backup_failed("Manifest backup gagal ditulis."))?;
    fs::write(manifest_path(destination), manifest)
        .map_err(|_| AppError::backup_failed("Manifest backup tidak dapat ditulis."))?;

    Ok(summary)
}

pub fn inspect_backup(path: &Path) -> Result<BackupSummary, AppError> {
    let connection = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY)
        .map_err(|_| AppError::backup_invalid("File backup tidak dapat dibuka."))?;
    summarize(&connection, path).map_err(|error| {
        if error.code == "DATABASE_READ_FAILED" {
            AppError::backup_invalid("File backup bukan database SQLite yang valid.")
        } else {
            error
        }
    })
}

pub fn restore_backup(connection: &mut Connection, path: &Path) -> Result<BackupSummary, AppError> {
    let summary = inspect_backup(path)?;

    let max_backup_version = summary.migrations.iter().copied().max().unwrap_or(0);
    if max_backup_version > crate::db::migration_count() {
        return Err(AppError::backup_schema_too_new());
    }

    let source = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY)
        .map_err(|_| AppError::backup_invalid("File backup tidak dapat dibuka."))?;
    {
        let backup = backup::Backup::new(&source, connection)
            .map_err(|_| AppError::backup_failed("Restore database gagal dimulai."))?;
        backup
            .run_to_completion(100, Duration::from_millis(5), None)
            .map_err(|_| AppError::backup_failed("Restore database gagal diselesaikan."))?;
    }

    crate::db::migrate(connection)
        .map_err(|_| AppError::backup_failed("Migrasi setelah restore gagal."))?;

    summarize_from_live(connection, path)
}

fn summarize_from_live(connection: &Connection, source_path: &Path) -> Result<BackupSummary, AppError> {
    let integrity: String = connection
        .query_row("PRAGMA integrity_check", [], |row| row.get(0))
        .map_err(AppError::read)?;
    if integrity != "ok" {
        return Err(AppError::backup_failed("Database setelah restore tidak valid."));
    }

    let mut migrations = Vec::new();
    {
        let mut statement = connection
            .prepare("SELECT version FROM schema_migrations ORDER BY version")
            .map_err(AppError::read)?;
        let rows = statement
            .query_map([], |row| row.get::<_, i64>(0))
            .map_err(AppError::read)?;
        for row in rows {
            migrations.push(row.map_err(AppError::read)?);
        }
    }

    let counts = BackupCounts {
        profiles: table_count(connection, "profiles")?,
        sessions: table_count(connection, "learning_sessions")?,
        attempts: table_count(connection, "activity_attempts")?,
        responses: table_count(connection, "assessment_responses")?,
        progress: table_count(connection, "progress_snapshots")?,
        outbox: table_count(connection, "sync_outbox")?,
        licenses: table_count(connection, "license_state")?,
    };

    Ok(BackupSummary {
        path: source_path.display().to_string(),
        bytes: 0,
        sha256: String::new(),
        created_at: Utc::now().to_rfc3339(),
        migrations,
        counts,
    })
}

#[tauri::command]
pub fn backup_export(db: State<'_, DbState>, destination: String) -> Result<BackupSummary, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    export_backup(&connection, Path::new(&destination))
}

#[tauri::command]
pub fn backup_inspect(path: String) -> Result<BackupSummary, AppError> {
    inspect_backup(Path::new(&path))
}

#[tauri::command]
pub fn backup_restore(db: State<'_, DbState>, path: String) -> Result<BackupSummary, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    restore_backup(&mut connection, Path::new(&path))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use crate::learning::{
        ensure_profile, save_attempt, start_session, AnswerInput, EnsureProfileInput, SaveAttemptInput,
        StartSessionInput,
    };

    fn seed(connection: &mut Connection) {
        ensure_profile(
            connection,
            &EnsureProfileInput {
                profile_id: "profile-backup".to_string(),
                display_name: "Siswa Backup".to_string(),
            },
        )
        .expect("profile");
        start_session(
            connection,
            &StartSessionInput {
                session_id: "session-backup".to_string(),
                profile_id: "profile-backup".to_string(),
                package_id: "matematika-kelas3-pecahan".to_string(),
                package_version: "0.1.0".to_string(),
                lesson_id: "pecahan-sederhana".to_string(),
                manifest_hash: None,
            },
        )
        .expect("session");
        save_attempt(
            connection,
            &SaveAttemptInput {
                attempt_id: "attempt-backup".to_string(),
                progress_id: "progress-backup".to_string(),
                outbox_id: "outbox-backup".to_string(),
                event_id: "event-backup".to_string(),
                session_id: "session-backup".to_string(),
                activity_id: "kuis-pecahan-sederhana".to_string(),
                score: 80.0,
                occurred_at: "2026-10-24T00:00:00.000Z".to_string(),
                answers: vec![AnswerInput {
                    response_id: "response-backup".to_string(),
                    question_id: "soal-1".to_string(),
                    option_id: Some("opsi-a".to_string()),
                    is_correct: true,
                }],
            },
        )
        .expect("attempt");
    }

    #[test]
    fn exports_inspects_and_restores_backup() {
        let mut source = test_connection();
        seed(&mut source);

        let root = std::env::temp_dir().join(format!("ifp-backup-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temp");
        let path = root.join("backup.db");

        let exported = export_backup(&source, &path).expect("export");
        assert_eq!(exported.counts.profiles, 1);
        assert_eq!(exported.counts.sessions, 1);
        assert_eq!(exported.counts.attempts, 1);
        assert!(path.is_file());
        assert!(manifest_path(&path).is_file());

        let inspected = inspect_backup(&path).expect("inspect");
        assert_eq!(inspected.counts.responses, 1);
        assert_eq!(inspected.migrations.last().copied(), Some(crate::db::migration_count()));

        let mut target = test_connection();
        let restored = restore_backup(&mut target, &path).expect("restore");
        assert_eq!(restored.counts.profiles, 1);
        assert_eq!(restored.counts.sessions, 1);
        assert_eq!(restored.counts.outbox, 1);

        let profiles: i64 = target
            .query_row("SELECT COUNT(*) FROM profiles", [], |row| row.get(0))
            .expect("count");
        assert_eq!(profiles, 1);

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn rejects_invalid_backup() {
        let root = std::env::temp_dir().join(format!("ifp-backup-bad-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temp");
        let path = root.join("bad.db");
        fs::write(&path, b"not a database").expect("write");

        let error = inspect_backup(&path).expect_err("invalid");
        assert_eq!(error.code, "BACKUP_INVALID");

        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn refuses_to_overwrite_existing_backup() {
        let source = test_connection();
        let root = std::env::temp_dir().join(format!("ifp-backup-exist-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temp");
        let path = root.join("backup.db");
        fs::write(&path, b"existing").expect("write");

        let error = export_backup(&source, &path).expect_err("must refuse");
        assert_eq!(error.code, "BACKUP_FAILED");

        let _ = fs::remove_dir_all(&root);
    }
}
