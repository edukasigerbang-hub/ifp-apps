use crate::db::DbState;
use crate::error::AppError;
use crate::validation::{validate_timestamp, validate_token};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

const MAX_BATCH: i64 = 100;
const MAX_ATTEMPTS_LIMIT: i64 = 20;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OutboxEventView {
    pub outbox_id: String,
    pub event_id: String,
    pub event_type: String,
    pub payload_json: String,
    pub created_at: String,
    pub attempts: i64,
    pub next_attempt_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatusView {
    pub pending: i64,
    pub failed: i64,
    pub acknowledged: i64,
    pub next_attempt_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RetryInput {
    pub outbox_id: String,
    pub error_code: String,
    pub next_attempt_at: Option<String>,
    pub max_attempts: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AcknowledgeInput {
    pub outbox_id: String,
    pub acknowledged_at: String,
}

pub fn get_device_id(connection: &Connection) -> Result<String, AppError> {
    let existing: Option<String> = connection
        .query_row(
            "SELECT value FROM app_meta WHERE key = 'installation_id'",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;

    if let Some(value) = existing {
        return Ok(value);
    }

    let generated = uuid::Uuid::new_v4().to_string();
    connection
        .execute(
            "INSERT INTO app_meta (key, value, updated_at)
             VALUES ('installation_id', ?1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(key) DO NOTHING",
            [&generated],
        )
        .map_err(AppError::write)?;

    connection
        .query_row(
            "SELECT value FROM app_meta WHERE key = 'installation_id'",
            [],
            |row| row.get(0),
        )
        .map_err(AppError::read)
}

pub fn list_pending(
    connection: &Connection,
    limit: i64,
    max_attempts: i64,
) -> Result<Vec<OutboxEventView>, AppError> {
    if !(1..=MAX_BATCH).contains(&limit) {
        return Err(AppError::validation("Batas batch tidak valid."));
    }
    if !(1..=MAX_ATTEMPTS_LIMIT).contains(&max_attempts) {
        return Err(AppError::validation("Batas percobaan tidak valid."));
    }

    let mut statement = connection
        .prepare(
            "SELECT id, event_id, event_type, payload_json, created_at, attempts, next_attempt_at
             FROM sync_outbox
             WHERE state IN ('pending', 'failed')
               AND attempts < ?2
               AND (next_attempt_at IS NULL OR next_attempt_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ORDER BY created_at ASC, id ASC
             LIMIT ?1",
        )
        .map_err(AppError::read)?;

    let events = statement
        .query_map(params![limit, max_attempts], |row| {
            Ok(OutboxEventView {
                outbox_id: row.get(0)?,
                event_id: row.get(1)?,
                event_type: row.get(2)?,
                payload_json: row.get(3)?,
                created_at: row.get(4)?,
                attempts: row.get(5)?,
                next_attempt_at: row.get(6)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    Ok(events)
}

pub fn mark_retry(connection: &Connection, input: &RetryInput) -> Result<bool, AppError> {
    validate_token(&input.outbox_id, "ID outbox")?;
    validate_token(&input.error_code, "Kode error")?;
    if let Some(next_attempt_at) = &input.next_attempt_at {
        validate_timestamp(next_attempt_at)?;
    }
    if !(1..=MAX_ATTEMPTS_LIMIT).contains(&input.max_attempts) {
        return Err(AppError::validation("Batas percobaan tidak valid."));
    }

    let changed = connection
        .execute(
            "UPDATE sync_outbox
             SET attempts = attempts + 1,
                 state = 'failed',
                 last_error_code = ?2,
                 next_attempt_at = CASE WHEN attempts + 1 >= ?4 THEN NULL ELSE ?3 END
             WHERE id = ?1 AND state IN ('pending', 'failed')",
            params![
                input.outbox_id,
                input.error_code,
                input.next_attempt_at,
                input.max_attempts
            ],
        )
        .map_err(AppError::write)?;

    Ok(changed > 0)
}

pub fn mark_acknowledged(
    connection: &Connection,
    input: &AcknowledgeInput,
) -> Result<bool, AppError> {
    validate_token(&input.outbox_id, "ID outbox")?;
    validate_timestamp(&input.acknowledged_at)?;

    let changed = connection
        .execute(
            "UPDATE sync_outbox
             SET state = 'acknowledged',
                 next_attempt_at = NULL,
                 last_error_code = NULL,
                 acknowledged_at = ?2
             WHERE id = ?1 AND state <> 'acknowledged'",
            params![input.outbox_id, input.acknowledged_at],
        )
        .map_err(AppError::write)?;

    Ok(changed > 0)
}

pub fn get_status(connection: &Connection) -> Result<SyncStatusView, AppError> {
    let (pending, failed, acknowledged, next_attempt_at) = connection
        .query_row(
            "SELECT
               COALESCE(SUM(CASE WHEN state = 'pending' THEN 1 ELSE 0 END), 0),
               COALESCE(SUM(CASE WHEN state = 'failed' THEN 1 ELSE 0 END), 0),
               COALESCE(SUM(CASE WHEN state = 'acknowledged' THEN 1 ELSE 0 END), 0),
               MIN(CASE WHEN state IN ('pending', 'failed') AND next_attempt_at IS NOT NULL
                        THEN next_attempt_at END)
             FROM sync_outbox",
            [],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, i64>(1)?,
                    row.get::<_, i64>(2)?,
                    row.get::<_, Option<String>>(3)?,
                ))
            },
        )
        .map_err(AppError::read)?;

    Ok(SyncStatusView {
        pending,
        failed,
        acknowledged,
        next_attempt_at,
    })
}

#[tauri::command]
pub fn sync_get_device_id(state: State<'_, DbState>) -> Result<String, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_device_id(&connection)
}

#[tauri::command]
pub fn sync_list_pending(
    state: State<'_, DbState>,
    limit: i64,
    max_attempts: i64,
) -> Result<Vec<OutboxEventView>, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_pending(&connection, limit, max_attempts)
}

#[tauri::command]
pub fn sync_mark_retry(state: State<'_, DbState>, input: RetryInput) -> Result<bool, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    mark_retry(&connection, &input)
}

#[tauri::command]
pub fn sync_mark_acknowledged(
    state: State<'_, DbState>,
    input: AcknowledgeInput,
) -> Result<bool, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    mark_acknowledged(&connection, &input)
}

#[tauri::command]
pub fn sync_get_status(state: State<'_, DbState>) -> Result<SyncStatusView, AppError> {
    let connection = state.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_status(&connection)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    fn insert_event(
        connection: &Connection,
        id: &str,
        event_id: &str,
        state: &str,
        attempts: i64,
        next_attempt_at: Option<&str>,
    ) {
        connection
            .execute(
                "INSERT INTO sync_outbox
                   (id, event_id, event_type, payload_json, created_at, attempts, next_attempt_at, state)
                 VALUES (?1, ?2, 'assessment.completed', '{}', '2026-10-23T15:00:00.000Z', ?3, ?4, ?5)",
                params![id, event_id, attempts, next_attempt_at, state],
            )
            .expect("insert outbox");
    }

    #[test]
    fn lists_only_eligible_events() {
        let connection = test_connection();
        insert_event(&connection, "outbox-1", "event-1", "pending", 0, None);
        insert_event(
            &connection,
            "outbox-2",
            "event-2",
            "failed",
            1,
            Some("2000-01-01T00:00:00.000Z"),
        );
        insert_event(
            &connection,
            "outbox-3",
            "event-3",
            "failed",
            1,
            Some("2099-01-01T00:00:00.000Z"),
        );
        insert_event(&connection, "outbox-4", "event-4", "acknowledged", 1, None);

        let events = list_pending(&connection, 20, 5).expect("list");
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].event_id, "event-1");
        assert_eq!(events[1].event_id, "event-2");
    }

    #[test]
    fn retry_backoff_then_dead_letter() {
        let connection = test_connection();
        insert_event(&connection, "outbox-1", "event-1", "pending", 0, None);

        let updated = mark_retry(
            &connection,
            &RetryInput {
                outbox_id: "outbox-1".to_string(),
                error_code: "SYNC_NETWORK_UNAVAILABLE".to_string(),
                next_attempt_at: Some("2000-01-01T00:00:00.000Z".to_string()),
                max_attempts: 2,
            },
        )
        .expect("retry");
        assert!(updated);

        let events = list_pending(&connection, 20, 2).expect("list after retry");
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].attempts, 1);

        mark_retry(
            &connection,
            &RetryInput {
                outbox_id: "outbox-1".to_string(),
                error_code: "SYNC_NETWORK_UNAVAILABLE".to_string(),
                next_attempt_at: Some("2099-01-01T00:00:00.000Z".to_string()),
                max_attempts: 2,
            },
        )
        .expect("dead letter");

        let events = list_pending(&connection, 20, 2).expect("list dead letter");
        assert!(events.is_empty());

        let (attempts, next_attempt_at): (i64, Option<String>) = connection
            .query_row(
                "SELECT attempts, next_attempt_at FROM sync_outbox WHERE id = 'outbox-1'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .expect("row");
        assert_eq!(attempts, 2);
        assert_eq!(next_attempt_at, None);
    }

    #[test]
    fn acknowledge_is_idempotent_and_not_deleted() {
        let connection = test_connection();
        insert_event(&connection, "outbox-1", "event-1", "pending", 0, None);

        let first = mark_acknowledged(
            &connection,
            &AcknowledgeInput {
                outbox_id: "outbox-1".to_string(),
                acknowledged_at: "2026-10-23T16:00:00.000Z".to_string(),
            },
        )
        .expect("ack");
        let second = mark_acknowledged(
            &connection,
            &AcknowledgeInput {
                outbox_id: "outbox-1".to_string(),
                acknowledged_at: "2026-10-23T16:01:00.000Z".to_string(),
            },
        )
        .expect("ack again");

        assert!(first);
        assert!(!second);

        let (state, acknowledged_at): (String, Option<String>) = connection
            .query_row(
                "SELECT state, acknowledged_at FROM sync_outbox WHERE id = 'outbox-1'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .expect("row");
        assert_eq!(state, "acknowledged");
        assert_eq!(acknowledged_at.as_deref(), Some("2026-10-23T16:00:00.000Z"));
    }

    #[test]
    fn status_counts_by_state() {
        let connection = test_connection();
        insert_event(&connection, "outbox-1", "event-1", "pending", 0, None);
        insert_event(&connection, "outbox-2", "event-2", "failed", 1, None);
        insert_event(&connection, "outbox-3", "event-3", "acknowledged", 1, None);

        let status = get_status(&connection).expect("status");
        assert_eq!(status.pending, 1);
        assert_eq!(status.failed, 1);
        assert_eq!(status.acknowledged, 1);

        let events = list_pending(&connection, 20, 5).expect("list");
        assert_eq!(events.len(), 2);
    }

    #[test]
    fn device_id_is_stable() {
        let connection = test_connection();
        let first = get_device_id(&connection).expect("device id");
        let second = get_device_id(&connection).expect("device id again");

        assert_eq!(first, second);
        assert_eq!(first.len(), 36);
    }
}
