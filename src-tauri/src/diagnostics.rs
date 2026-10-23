use crate::db::DbState;
use crate::error::AppError;
use crate::license::{LicenseState, LicenseStatusView};
use chrono::Utc;
use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;
use tauri::State;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsCounts {
    pub profiles: i64,
    pub sessions: i64,
    pub attempts: i64,
    pub responses: i64,
    pub progress: i64,
    pub outbox: i64,
    pub content_packages: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsSync {
    pub pending: i64,
    pub failed: i64,
    pub acknowledged: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsLicense {
    pub configured: bool,
    pub valid: bool,
    pub license_type: Option<String>,
    pub expires_at: Option<String>,
    pub in_grace: bool,
    pub code: Option<String>,
    pub machine_id_redacted: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsPackage {
    pub package_id: String,
    pub version: String,
    pub status: String,
    pub source: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsReport {
    pub generated_at: String,
    pub app_version: String,
    pub os: String,
    pub arch: String,
    pub migrations: Vec<i64>,
    pub counts: DiagnosticsCounts,
    pub sync: DiagnosticsSync,
    pub license: DiagnosticsLicense,
    pub packages: Vec<DiagnosticsPackage>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsSummary {
    pub path: String,
    pub bytes: u64,
    pub sha256: String,
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

fn sync_count(connection: &Connection, state: &str) -> Result<i64, AppError> {
    let value: Option<i64> = connection
        .query_row(
            "SELECT COUNT(*) FROM sync_outbox WHERE state = ?1",
            [state],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    Ok(value.unwrap_or(0))
}

fn redact_machine_id(value: &str) -> String {
    if value.len() > 8 {
        format!("{}…", &value[..8])
    } else {
        "…".to_string()
    }
}

fn hex_digest(data: &[u8]) -> String {
    Sha256::digest(data)
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

pub fn build_report(
    connection: &Connection,
    license_state: &LicenseState,
) -> Result<DiagnosticsReport, AppError> {
    let machine_id = crate::sync::get_device_id(connection)?;
    let license_status: LicenseStatusView =
        crate::license::get_status(connection, license_state, Utc::now())?;

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

    let mut packages = Vec::new();
    {
        let mut statement = connection
            .prepare("SELECT package_id, version, status, source FROM content_packages ORDER BY package_id, version")
            .map_err(AppError::read)?;
        let rows = statement
            .query_map([], |row| {
                Ok(DiagnosticsPackage {
                    package_id: row.get(0)?,
                    version: row.get(1)?,
                    status: row.get(2)?,
                    source: row.get(3)?,
                })
            })
            .map_err(AppError::read)?;
        for row in rows {
            packages.push(row.map_err(AppError::read)?);
        }
    }

    Ok(DiagnosticsReport {
        generated_at: Utc::now().to_rfc3339(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        migrations,
        counts: DiagnosticsCounts {
            profiles: table_count(connection, "profiles")?,
            sessions: table_count(connection, "learning_sessions")?,
            attempts: table_count(connection, "activity_attempts")?,
            responses: table_count(connection, "assessment_responses")?,
            progress: table_count(connection, "progress_snapshots")?,
            outbox: table_count(connection, "sync_outbox")?,
            content_packages: table_count(connection, "content_packages")?,
        },
        sync: DiagnosticsSync {
            pending: sync_count(connection, "pending")?,
            failed: sync_count(connection, "failed")?,
            acknowledged: sync_count(connection, "acknowledged")?,
        },
        license: DiagnosticsLicense {
            configured: license_status.configured,
            valid: license_status.valid,
            license_type: license_status.license_type,
            expires_at: license_status.expires_at,
            in_grace: license_status.in_grace,
            code: license_status.code,
            machine_id_redacted: redact_machine_id(&machine_id),
        },
        packages,
    })
}

pub fn export_diagnostics(
    connection: &Connection,
    license_state: &LicenseState,
    destination: &Path,
) -> Result<DiagnosticsSummary, AppError> {
    let report = build_report(connection, license_state)?;
    let json = serde_json::to_vec_pretty(&report)
        .map_err(|_| AppError::backup_failed("Diagnostik tidak dapat diserialisasi."))?;

    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent)
            .map_err(|_| AppError::backup_failed("Folder diagnostik tidak dapat dibuat."))?;
    }
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(destination)
        .map_err(|_| AppError::backup_failed("File diagnostik sudah ada atau tidak dapat dibuat."))?;
    file.write_all(&json)
        .map_err(|_| AppError::backup_failed("Diagnostik tidak dapat ditulis."))?;
    file.flush()
        .map_err(|_| AppError::backup_failed("Diagnostik tidak dapat difinalisasi."))?;
    drop(file);

    Ok(DiagnosticsSummary {
        path: destination.display().to_string(),
        bytes: json.len() as u64,
        sha256: hex_digest(&json),
    })
}

#[tauri::command]
pub fn app_export_diagnostics(
    db: State<'_, DbState>,
    license: State<'_, LicenseState>,
    destination: String,
) -> Result<DiagnosticsSummary, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    export_diagnostics(&connection, &license, Path::new(&destination))
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
                profile_id: "profile-diag".to_string(),
                display_name: "Nama Rahasia".to_string(),
            },
        )
        .expect("profile");
        start_session(
            connection,
            &StartSessionInput {
                session_id: "session-diag".to_string(),
                profile_id: "profile-diag".to_string(),
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
                attempt_id: "attempt-diag".to_string(),
                progress_id: "progress-diag".to_string(),
                outbox_id: "outbox-diag".to_string(),
                event_id: "event-diag".to_string(),
                session_id: "session-diag".to_string(),
                activity_id: "kuis-pecahan-sederhana".to_string(),
                score: 90.0,
                occurred_at: "2026-10-24T00:00:00.000Z".to_string(),
                answers: vec![AnswerInput {
                    response_id: "response-diag".to_string(),
                    question_id: "soal-1".to_string(),
                    option_id: Some("opsi-a".to_string()),
                    is_correct: true,
                }],
            },
        )
        .expect("attempt");
    }

    #[test]
    fn report_includes_counts_and_redacts_identifiers() {
        let mut connection = test_connection();
        seed(&mut connection);
        let state = LicenseState {
            keys: Vec::new(),
            product_id: "ifp-learning".to_string(),
        };

        let report = build_report(&connection, &state).expect("report");
        assert_eq!(report.counts.profiles, 1);
        assert_eq!(report.counts.sessions, 1);
        assert_eq!(report.counts.attempts, 1);
        assert_eq!(report.sync.pending, 1);
        assert_eq!(report.packages.len(), 1);
        assert!(report.license.machine_id_redacted.ends_with('…'));

        let json = serde_json::to_string(&report).expect("json");
        assert!(!json.contains("Nama Rahasia"));
        assert!(!json.contains("license_json"));
        assert!(!json.contains("signature"));
        assert!(!json.contains("serial"));
        let machine_id = crate::sync::get_device_id(&connection).expect("machine");
        assert!(!json.contains(&machine_id));
    }

    #[test]
    fn export_writes_new_file_only() {
        let mut connection = test_connection();
        seed(&mut connection);
        let state = LicenseState {
            keys: Vec::new(),
            product_id: "ifp-learning".to_string(),
        };
        let root = std::env::temp_dir().join(format!("ifp-diag-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temp");
        let path = root.join("diagnostics.json");

        let summary = export_diagnostics(&connection, &state, &path).expect("export");
        assert!(summary.bytes > 0);
        assert!(path.is_file());

        let error = export_diagnostics(&connection, &state, &path).expect_err("overwrite");
        assert_eq!(error.code, "BACKUP_FAILED");

        let _ = fs::remove_dir_all(&root);
    }
}
