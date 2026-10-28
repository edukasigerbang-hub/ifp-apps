use crate::db::DbState;
use crate::error::AppError;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Deserialize;
use tauri::State;

const MAX_KEY_CHARS: usize = 64;
const MAX_VALUE_BYTES: usize = 8 * 1024;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetUiStateInput {
    pub profile_id: String,
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UiStateKeyInput {
    pub profile_id: String,
    pub key: String,
}

fn validate_key(key: &str) -> Result<(), AppError> {
    if key.trim().is_empty() || key.chars().count() > MAX_KEY_CHARS {
        return Err(AppError::validation(&format!(
            "key harus 1–{MAX_KEY_CHARS} karakter."
        )));
    }
    if !key
        .chars()
        .all(|value| value.is_ascii_alphanumeric() || matches!(value, '-' | '_'))
    {
        return Err(AppError::validation(
            "key hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.",
        ));
    }
    Ok(())
}

fn ensure_profile(connection: &Connection, profile_id: &str) -> Result<(), AppError> {
    let found = connection
        .query_row(
            "SELECT 1 FROM profiles WHERE id = ?1",
            [profile_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(AppError::read)?;
    match found {
        Some(_) => Ok(()),
        None => Err(AppError::profile_not_found()),
    }
}

pub fn get_state(
    connection: &Connection,
    profile_id: &str,
    key: &str,
) -> Result<Option<String>, AppError> {
    validate_key(key)?;
    ensure_profile(connection, profile_id)?;
    connection
        .query_row(
            "SELECT value FROM profile_ui_state WHERE profile_id = ?1 AND state_key = ?2",
            params![profile_id, key],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)
}

pub fn set_state(connection: &Connection, input: &SetUiStateInput) -> Result<(), AppError> {
    validate_key(&input.key)?;
    if input.value.len() > MAX_VALUE_BYTES {
        return Err(AppError::validation(&format!(
            "value maksimal {MAX_VALUE_BYTES} byte."
        )));
    }
    ensure_profile(connection, &input.profile_id)?;
    connection
        .execute(
            "INSERT INTO profile_ui_state (profile_id, state_key, value, updated_at)
             VALUES (?1, ?2, ?3, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(profile_id, state_key)
             DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            params![input.profile_id, input.key, input.value],
        )
        .map_err(AppError::write)?;
    Ok(())
}

pub fn clear_state(connection: &Connection, input: &UiStateKeyInput) -> Result<(), AppError> {
    validate_key(&input.key)?;
    ensure_profile(connection, &input.profile_id)?;
    connection
        .execute(
            "DELETE FROM profile_ui_state WHERE profile_id = ?1 AND state_key = ?2",
            params![input.profile_id, input.key],
        )
        .map_err(AppError::write)?;
    Ok(())
}

#[tauri::command]
pub fn ui_state_get(
    db: State<'_, DbState>,
    profile_id: String,
    key: String,
) -> Result<Option<String>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_state(&connection, &profile_id, &key)
}

#[tauri::command]
pub fn ui_state_set(db: State<'_, DbState>, input: SetUiStateInput) -> Result<(), AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_state(&connection, &input)
}

#[tauri::command]
pub fn ui_state_clear(db: State<'_, DbState>, input: UiStateKeyInput) -> Result<(), AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    clear_state(&connection, &input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    fn input(profile_id: &str, key: &str, value: &str) -> SetUiStateInput {
        SetUiStateInput {
            profile_id: profile_id.to_string(),
            key: key.to_string(),
            value: value.to_string(),
        }
    }

    fn key_input(profile_id: &str, key: &str) -> UiStateKeyInput {
        UiStateKeyInput {
            profile_id: profile_id.to_string(),
            key: key.to_string(),
        }
    }

    #[test]
    fn stores_and_reads_per_profile() {
        let connection = test_connection();
        let budi = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        let sari = crate::profile::create_profile(&connection, "Sari", "student").expect("profile");

        set_state(&connection, &input(&budi.id, "home-tab", "explore")).expect("set");
        set_state(&connection, &input(&budi.id, "quiz-resume", "{\"questionIndex\":1}")).expect("set");

        assert_eq!(
            get_state(&connection, &budi.id, "home-tab").expect("get"),
            Some("explore".to_string())
        );
        assert_eq!(get_state(&connection, &sari.id, "home-tab").expect("get"), None);
    }

    #[test]
    fn upsert_replaces_value() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");

        set_state(&connection, &input(&profile.id, "home-tab", "pinned")).expect("set");
        set_state(&connection, &input(&profile.id, "home-tab", "available")).expect("set");

        assert_eq!(
            get_state(&connection, &profile.id, "home-tab").expect("get"),
            Some("available".to_string())
        );
        let rows: i64 = connection
            .query_row("SELECT COUNT(*) FROM profile_ui_state", [], |row| row.get(0))
            .expect("count");
        assert_eq!(rows, 1);
    }

    #[test]
    fn clear_is_idempotent() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        set_state(&connection, &input(&profile.id, "quiz-resume", "{}")).expect("set");

        clear_state(&connection, &key_input(&profile.id, "quiz-resume")).expect("clear");
        clear_state(&connection, &key_input(&profile.id, "quiz-resume")).expect("clear again");

        assert_eq!(
            get_state(&connection, &profile.id, "quiz-resume").expect("get"),
            None
        );
    }

    #[test]
    fn rejects_unknown_profile() {
        let connection = test_connection();
        let error = set_state(&connection, &input("tidak-ada", "home-tab", "pinned"))
            .expect_err("unknown profile");
        assert_eq!(error.code, "PROFILE_NOT_FOUND");
        assert!(get_state(&connection, "tidak-ada", "home-tab").is_err());
    }

    #[test]
    fn rejects_invalid_key_and_oversized_value() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");

        for key in ["", "   ", "home tab", "a".repeat(MAX_KEY_CHARS + 1).as_str()] {
            let error = set_state(&connection, &input(&profile.id, key, "x")).expect_err("bad key");
            assert_eq!(error.code, "VALIDATION_FAILED");
        }

        let error = set_state(&connection, &input(&profile.id, "home-tab", &"x".repeat(MAX_VALUE_BYTES + 1)))
            .expect_err("oversized");
        assert_eq!(error.code, "VALIDATION_FAILED");
    }

    #[test]
    fn deleting_profile_removes_state() {
        let connection = test_connection();
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .expect("pragma");
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        set_state(&connection, &input(&profile.id, "home-tab", "explore")).expect("set");

        connection
            .execute("DELETE FROM profiles WHERE id = ?1", [&profile.id])
            .expect("delete profile");

        let remaining: i64 = connection
            .query_row("SELECT COUNT(*) FROM profile_ui_state", [], |row| row.get(0))
            .expect("count");
        assert_eq!(remaining, 0);
    }
}
