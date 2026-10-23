use crate::db::DbState;
use crate::error::AppError;
use rusqlite::Connection;
use serde::Serialize;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use tauri::State;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResultsExportSummary {
    pub path: String,
    pub rows: usize,
    pub bytes: u64,
}

fn csv_field(value: &str) -> String {
    let mut text = value.replace('"', "\"\"");
    if matches!(
        value.chars().next(),
        Some('=' | '+' | '-' | '@' | '\t' | '\r')
    ) {
        text.insert(0, '\'');
    }
    if text.contains(',') || text.contains('"') || text.contains('\n') || text.contains('\r') {
        format!("\"{text}\"")
    } else {
        text
    }
}

pub fn export_results_csv(
    connection: &Connection,
    destination: &Path,
) -> Result<ResultsExportSummary, AppError> {
    let mut statement = connection
        .prepare(
            "SELECT p.display_name, s.lesson_id, a.activity_id, a.attempt_no, a.score, a.completed_at
             FROM activity_attempts a
             JOIN learning_sessions s ON s.id = a.session_id
             JOIN profiles p ON p.id = s.profile_id
             ORDER BY a.completed_at DESC, a.id ASC",
        )
        .map_err(AppError::read)?;

    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, f64>(4)?,
                row.get::<_, Option<String>>(5)?,
            ))
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    let mut output = String::from("\u{FEFF}");
    output.push_str("profil,lesson_id,activity_id,percobaan,skor,selesai_pada\r\n");
    for (profile, lesson_id, activity_id, attempt_no, score, completed_at) in &rows {
        output.push_str(&format!(
            "{},{},{},{},{:.2},{}\r\n",
            csv_field(profile),
            csv_field(lesson_id),
            csv_field(activity_id),
            attempt_no,
            score,
            csv_field(completed_at.as_deref().unwrap_or(""))
        ));
    }

    if let Some(parent) = destination.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|_| AppError::export_failed("Folder laporan tidak dapat dibuat."))?;
    }
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(destination)
        .map_err(|_| AppError::export_failed("File laporan sudah ada atau tidak dapat dibuat."))?;
    file.write_all(output.as_bytes())
        .map_err(|_| AppError::export_failed("Laporan tidak dapat ditulis."))?;
    file.flush()
        .map_err(|_| AppError::export_failed("Laporan tidak dapat difinalisasi."))?;
    drop(file);

    Ok(ResultsExportSummary {
        path: destination.display().to_string(),
        rows: rows.len(),
        bytes: output.len() as u64,
    })
}

#[tauri::command]
pub fn results_export_csv(
    db: State<'_, DbState>,
    destination: String,
) -> Result<ResultsExportSummary, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    export_results_csv(&connection, Path::new(&destination))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;
    use crate::learning::{
        ensure_profile, save_attempt, start_session, AnswerInput, EnsureProfileInput, SaveAttemptInput,
        StartSessionInput,
    };

    fn seed(connection: &mut Connection, display_name: &str) {
        ensure_profile(
            connection,
            &EnsureProfileInput {
                profile_id: "profile-export".to_string(),
                display_name: display_name.to_string(),
            },
        )
        .expect("profile");
        start_session(
            connection,
            &StartSessionInput {
                session_id: "session-export".to_string(),
                profile_id: "profile-export".to_string(),
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
                attempt_id: "attempt-export".to_string(),
                progress_id: "progress-export".to_string(),
                outbox_id: "outbox-export".to_string(),
                event_id: "event-export".to_string(),
                session_id: "session-export".to_string(),
                activity_id: "kuis-pecahan-sederhana".to_string(),
                score: 87.5,
                occurred_at: "2026-10-24T00:00:00.000Z".to_string(),
                answers: vec![AnswerInput {
                    response_id: "response-export".to_string(),
                    question_id: "soal-1".to_string(),
                    option_id: Some("opsi-a".to_string()),
                    is_correct: true,
                }],
            },
        )
        .expect("attempt");
    }

    #[test]
    fn exports_csv_with_escaping_and_injection_guard() {
        let mut connection = test_connection();
        seed(&mut connection, "=SUM(A1), \"Guru\"");

        let root = std::env::temp_dir().join(format!("ifp-csv-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = root.join("laporan.csv");

        let summary = export_results_csv(&connection, &path).expect("export");
        assert_eq!(summary.rows, 1);

        let content = std::fs::read_to_string(&path).expect("read");
        assert!(content.starts_with('\u{FEFF}'));
        assert!(content.contains("profil,lesson_id,activity_id,percobaan,skor,selesai_pada"));
        assert!(content.contains("\"'=SUM(A1), \"\"Guru\"\"\""));
        assert!(content.contains("87.50"));
        assert!(!content.contains(",=SUM"));

        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn empty_database_exports_header_only() {
        let connection = test_connection();
        let root = std::env::temp_dir().join(format!("ifp-csv-empty-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = root.join("laporan.csv");

        let summary = export_results_csv(&connection, &path).expect("export");
        assert_eq!(summary.rows, 0);
        let content = std::fs::read_to_string(&path).expect("read");
        assert_eq!(content.lines().count(), 1);

        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn refuses_to_overwrite() {
        let connection = test_connection();
        let root = std::env::temp_dir().join(format!("ifp-csv-exist-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let path = root.join("laporan.csv");
        std::fs::write(&path, b"existing").expect("write");

        let error = export_results_csv(&connection, &path).expect_err("must refuse");
        assert_eq!(error.code, "EXPORT_FAILED");

        let _ = std::fs::remove_dir_all(&root);
    }
}
