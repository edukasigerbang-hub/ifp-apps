use crate::db::DbState;
use crate::error::AppError;
use crate::validation::{validate_timestamp, validate_token};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

const MAX_ANSWERS: usize = 200;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnsureProfileInput {
    pub profile_id: String,
    pub display_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileView {
    pub profile_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartSessionInput {
    pub session_id: String,
    pub profile_id: String,
    pub package_id: String,
    pub package_version: String,
    pub lesson_id: String,
    pub manifest_hash: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionView {
    pub session_id: String,
    pub started_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnswerInput {
    pub response_id: String,
    pub question_id: String,
    pub option_id: Option<String>,
    pub is_correct: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAttemptInput {
    pub attempt_id: String,
    pub progress_id: String,
    pub outbox_id: String,
    pub event_id: String,
    pub session_id: String,
    pub activity_id: String,
    pub score: f64,
    pub occurred_at: String,
    pub answers: Vec<AnswerInput>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AttemptView {
    pub attempt_id: String,
    pub attempt_no: i64,
    pub score: f64,
    pub outbox_event_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentAttempt {
    pub lesson_id: String,
    pub activity_id: String,
    pub score: f64,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SummaryView {
    pub sessions: i64,
    pub attempts: i64,
    pub average_score: Option<f64>,
    pub recent: Vec<RecentAttempt>,
}

fn validate_score(score: f64) -> Result<(), AppError> {
    if !score.is_finite() || !(0.0..=100.0).contains(&score) {
        return Err(AppError::validation("Skor harus berada di antara 0 dan 100."));
    }
    Ok(())
}pub fn ensure_profile(connection: &Connection, input: &EnsureProfileInput) -> Result<ProfileView, AppError> {
    validate_token(&input.profile_id, "ID profil")?;

    let display_name = input.display_name.trim();
    if display_name.is_empty() || display_name.chars().count() > 80 {
        return Err(AppError::validation("Nama profil tidak valid."));
    }

    connection
        .execute(
            "INSERT INTO profiles (id, display_name, profile_type, created_at, updated_at)
             VALUES (?1, ?2, 'student', strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, updated_at = excluded.updated_at",
            params![input.profile_id, display_name],
        )
        .map_err(AppError::write)?;

    Ok(ProfileView {
        profile_id: input.profile_id.clone(),
    })
}

pub fn start_session(connection: &Connection, input: &StartSessionInput) -> Result<SessionView, AppError> {
    validate_token(&input.session_id, "ID sesi")?;
    validate_token(&input.profile_id, "ID profil")?;
    validate_token(&input.package_id, "ID paket")?;
    validate_token(&input.lesson_id, "ID lesson")?;

    if input.package_version.is_empty() || input.package_version.len() > 64 {
        return Err(AppError::validation("Versi paket tidak valid."));
    }
    if let Some(hash) = &input.manifest_hash {
        if hash.len() > 64 || !hash.chars().all(|character| character.is_ascii_hexdigit()) {
            return Err(AppError::validation("Hash manifest tidak valid."));
        }
    }

    connection
        .execute(
            "INSERT INTO content_packages (package_id, version, source, status, manifest_hash, installed_at)
             VALUES (?1, ?2, 'bundled', 'active', ?3, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(package_id, version) DO NOTHING",
            params![input.package_id, input.package_version, input.manifest_hash],
        )
        .map_err(AppError::write)?;

    connection
        .execute(
            "INSERT INTO learning_sessions (id, profile_id, lesson_id, package_id, package_version, started_at, state)
             VALUES (?1, ?2, ?3, ?4, ?5, strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'active')",
            params![
                input.session_id,
                input.profile_id,
                input.lesson_id,
                input.package_id,
                input.package_version
            ],
        )
        .map_err(AppError::write)?;

    let started_at: String = connection
        .query_row(
            "SELECT started_at FROM learning_sessions WHERE id = ?1",
            [&input.session_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    Ok(SessionView {
        session_id: input.session_id.clone(),
        started_at,
    })
}

pub fn save_attempt(connection: &mut Connection, input: &SaveAttemptInput) -> Result<AttemptView, AppError> {
    for (value, label) in [
        (&input.attempt_id, "ID percobaan"),
        (&input.progress_id, "ID progres"),
        (&input.outbox_id, "ID outbox"),
        (&input.event_id, "ID event"),
        (&input.session_id, "ID sesi"),
        (&input.activity_id, "ID aktivitas"),
    ] {
        validate_token(value, label)?;
    }

    validate_score(input.score)?;
    validate_timestamp(&input.occurred_at)?;
    if input.answers.is_empty() || input.answers.len() > MAX_ANSWERS {
        return Err(AppError::validation("Jumlah jawaban tidak valid."));
    }
    for answer in &input.answers {
        validate_token(&answer.response_id, "ID respons")?;
        validate_token(&answer.question_id, "ID soal")?;
        if let Some(option_id) = &answer.option_id {
            validate_token(option_id, "ID opsi")?;
        }
    }

    let transaction = connection.transaction().map_err(AppError::write)?;

    let session: Option<(String, String, String, String)> = transaction
        .query_row(
            "SELECT profile_id, lesson_id, package_id, package_version
             FROM learning_sessions WHERE id = ?1",
            [&input.session_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .optional()
        .map_err(AppError::read)?;

    let (profile_id, lesson_id, package_id, package_version) =
        session.ok_or_else(AppError::session_not_found)?;

    let attempt_no: i64 = transaction
        .query_row(
            "SELECT COALESCE(MAX(attempt_no), 0) + 1 FROM activity_attempts WHERE session_id = ?1",
            [&input.session_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    transaction
        .execute(
            "INSERT INTO activity_attempts
               (id, session_id, activity_id, attempt_no, started_at, completed_at, score, state)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5, ?6, 'completed')",
            params![
                input.attempt_id,
                input.session_id,
                input.activity_id,
                attempt_no,
                input.occurred_at,
                input.score
            ],
        )
        .map_err(AppError::write)?;

    for answer in &input.answers {
        transaction
            .execute(
                "INSERT INTO assessment_responses
                   (id, attempt_id, question_id, response_json, is_correct, answered_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    answer.response_id,
                    input.attempt_id,
                    answer.question_id,
                    serde_json::json!({ "optionId": answer.option_id }).to_string(),
                    if answer.is_correct { 1 } else { 0 },
                    input.occurred_at
                ],
            )
            .map_err(AppError::write)?;
    }

    let progress_json = serde_json::json!({
        "lastActivityId": &input.activity_id,
        "lastAttemptId": &input.attempt_id,
        "lastScore": input.score,
        "updatedAt": &input.occurred_at,
    })
    .to_string();

    transaction
        .execute(
            "INSERT INTO progress_snapshots
               (id, profile_id, lesson_id, package_version, progress_json, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(profile_id, lesson_id, package_version)
             DO UPDATE SET progress_json = excluded.progress_json, updated_at = excluded.updated_at",
            params![
                input.progress_id,
                profile_id,
                lesson_id,
                package_version,
                progress_json,
                input.occurred_at
            ],
        )
        .map_err(AppError::write)?;

    transaction
        .execute(
            "UPDATE learning_sessions
             SET state = 'completed', completed_at = COALESCE(completed_at, ?2)
             WHERE id = ?1",
            params![input.session_id, input.occurred_at],
        )
        .map_err(AppError::write)?;

    let payload_json = serde_json::json!({
        "eventId": &input.event_id,
        "eventType": "assessment.completed",
        "profileId": &profile_id,
        "packageId": &package_id,
        "packageVersion": &package_version,
        "lessonId": &lesson_id,
        "activityId": &input.activity_id,
        "attemptId": &input.attempt_id,
        "score": input.score,
        "occurredAt": &input.occurred_at,
        "answers": input.answers.iter().map(|answer| serde_json::json!({
            "questionId": &answer.question_id,
            "optionId": &answer.option_id,
            "isCorrect": answer.is_correct,
        })).collect::<Vec<_>>(),
    })
    .to_string();

    transaction
        .execute(
            "INSERT INTO sync_outbox
               (id, event_id, event_type, payload_json, created_at, attempts, state)
             VALUES (?1, ?2, 'assessment.completed', ?3, ?4, 0, 'pending')",
            params![input.outbox_id, input.event_id, payload_json, input.occurred_at],
        )
        .map_err(AppError::write)?;

    transaction.commit().map_err(AppError::write)?;

    Ok(AttemptView {
        attempt_id: input.attempt_id.clone(),
        attempt_no,
        score: input.score,
        outbox_event_id: input.event_id.clone(),
    })
}

pub fn get_summary(connection: &Connection, profile_id: &str) -> Result<SummaryView, AppError> {
    validate_token(profile_id, "ID profil")?;

    let sessions: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM learning_sessions WHERE profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    let attempts: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM activity_attempts a
             JOIN learning_sessions s ON s.id = a.session_id
             WHERE s.profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    let average_score: Option<f64> = connection
        .query_row(
            "SELECT AVG(a.score) FROM activity_attempts a
             JOIN learning_sessions s ON s.id = a.session_id
             WHERE s.profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    let mut statement = connection
        .prepare(
            "SELECT s.lesson_id, a.activity_id, a.score, a.completed_at
             FROM activity_attempts a
             JOIN learning_sessions s ON s.id = a.session_id
             WHERE s.profile_id = ?1
             ORDER BY a.completed_at DESC, a.started_at DESC
             LIMIT 10",
        )
        .map_err(AppError::read)?;

    let recent = statement
        .query_map([profile_id], |row| {
            Ok(RecentAttempt {
                lesson_id: row.get(0)?,
                activity_id: row.get(1)?,
                score: row.get(2)?,
                completed_at: row.get(3)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    Ok(SummaryView {
        sessions,
        attempts,
        average_score,
        recent,
    })
}

#[tauri::command]
pub fn learning_ensure_profile(
    state: State<'_, DbState>,
    input: EnsureProfileInput,
) -> Result<ProfileView, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    ensure_profile(&connection, &input)
}

#[tauri::command]
pub fn learning_start_session(
    state: State<'_, DbState>,
    input: StartSessionInput,
) -> Result<SessionView, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    start_session(&connection, &input)
}

#[tauri::command]
pub fn learning_save_attempt(
    state: State<'_, DbState>,
    input: SaveAttemptInput,
) -> Result<AttemptView, AppError> {
    let mut connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    save_attempt(&mut connection, &input)
}

#[tauri::command]
pub fn learning_get_summary(
    state: State<'_, DbState>,
    profile_id: String,
) -> Result<SummaryView, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_summary(&connection, &profile_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{migrate, test_connection};

    fn ensure_input() -> EnsureProfileInput {
        EnsureProfileInput {
            profile_id: "profile-test-1".to_string(),
            display_name: "Siswa Uji".to_string(),
        }
    }

    fn start_input() -> StartSessionInput {
        StartSessionInput {
            session_id: "session-test-1".to_string(),
            profile_id: "profile-test-1".to_string(),
            package_id: "matematika-kelas3-pecahan".to_string(),
            package_version: "0.1.0".to_string(),
            lesson_id: "pecahan-sederhana".to_string(),
            manifest_hash: None,
        }
    }

    fn save_input(unique: &str, event_id: &str) -> SaveAttemptInput {
        SaveAttemptInput {
            attempt_id: format!("attempt-{unique}"),
            progress_id: format!("progress-{unique}"),
            outbox_id: format!("outbox-{unique}"),
            event_id: event_id.to_string(),
            session_id: "session-test-1".to_string(),
            activity_id: "kuis-pecahan-sederhana".to_string(),
            score: 50.0,
            occurred_at: "2026-10-23T15:00:00.000Z".to_string(),
            answers: vec![
                AnswerInput {
                    response_id: format!("response-{unique}-1"),
                    question_id: "soal-1".to_string(),
                    option_id: Some("opsi-a".to_string()),
                    is_correct: true,
                },
                AnswerInput {
                    response_id: format!("response-{unique}-2"),
                    question_id: "soal-2".to_string(),
                    option_id: Some("opsi-b".to_string()),
                    is_correct: false,
                },
            ],
        }
    }

    fn count(connection: &Connection, table: &str) -> i64 {
        connection
            .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| row.get(0))
            .expect("count")
    }

    fn prepare() -> Connection {
        let connection = test_connection();
        ensure_profile(&connection, &ensure_input()).expect("profile");
        start_session(&connection, &start_input()).expect("session");
        connection
    }

    #[test]
    fn saves_attempt_responses_progress_and_outbox() {
        let mut connection = prepare();
        let view = save_attempt(&mut connection, &save_input("1", "event-1")).expect("save");

        assert_eq!(view.attempt_no, 1);
        assert_eq!(view.score, 50.0);
        assert_eq!(count(&connection, "activity_attempts"), 1);
        assert_eq!(count(&connection, "assessment_responses"), 2);
        assert_eq!(count(&connection, "progress_snapshots"), 1);
        assert_eq!(count(&connection, "sync_outbox"), 1);

        let state: String = connection
            .query_row(
                "SELECT state FROM learning_sessions WHERE id = 'session-test-1'",
                [],
                |row| row.get(0),
            )
            .expect("session state");
        assert_eq!(state, "completed");
    }

    #[test]
    fn duplicate_event_rolls_back_whole_attempt() {
        let mut connection = prepare();
        save_attempt(&mut connection, &save_input("1", "event-1")).expect("first save");

        let duplicate = save_attempt(&mut connection, &save_input("2", "event-1"));
        assert!(duplicate.is_err());

        assert_eq!(count(&connection, "activity_attempts"), 1);
        assert_eq!(count(&connection, "assessment_responses"), 2);
        assert_eq!(count(&connection, "sync_outbox"), 1);
    }

    #[test]
    fn attempt_number_increments_on_retry() {
        let mut connection = prepare();
        save_attempt(&mut connection, &save_input("1", "event-1")).expect("first save");
        let second = save_attempt(&mut connection, &save_input("2", "event-2")).expect("second save");

        assert_eq!(second.attempt_no, 2);
        assert_eq!(count(&connection, "activity_attempts"), 2);
        assert_eq!(count(&connection, "sync_outbox"), 2);
    }

    #[test]
    fn summary_aggregates_attempts_for_profile() {
        let mut connection = prepare();
        save_attempt(&mut connection, &save_input("1", "event-1")).expect("first save");
        let mut second = save_input("2", "event-2");
        second.score = 100.0;
        save_attempt(&mut connection, &second).expect("second save");

        let summary = get_summary(&connection, "profile-test-1").expect("summary");
        assert_eq!(summary.sessions, 1);
        assert_eq!(summary.attempts, 2);
        assert_eq!(summary.average_score, Some(75.0));
        assert_eq!(summary.recent.len(), 2);
    }

    #[test]
    fn migration_is_idempotent() {
        let mut connection = test_connection();
        migrate(&mut connection).expect("migrate again");
        let applied: i64 = connection
            .query_row("SELECT COUNT(*) FROM schema_migrations", [], |row| row.get(0))
            .expect("count migrations");
        assert_eq!(applied, crate::db::migration_count());
    }

    #[test]
    fn data_persists_across_reopen() {
        let path = std::env::temp_dir().join(format!("ifp-apps-test-{}.db", std::process::id()));
        let _ = std::fs::remove_file(&path);

        {
            let mut connection = crate::db::open(&path).expect("open file db");
            ensure_profile(&connection, &ensure_input()).expect("profile");
            start_session(&connection, &start_input()).expect("session");
            save_attempt(&mut connection, &save_input("1", "event-1")).expect("save");
        }

        {
            let connection = crate::db::open(&path).expect("reopen file db");
            let summary = get_summary(&connection, "profile-test-1").expect("summary after reopen");
            assert_eq!(summary.attempts, 1);
            assert_eq!(summary.sessions, 1);
        }

        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{suffix}", path.display()));
        }
    }
}
