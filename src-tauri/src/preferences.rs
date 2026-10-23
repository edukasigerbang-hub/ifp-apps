use crate::app_meta;
use crate::db::DbState;
use crate::error::AppError;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::State;

const PREFERENCES_KEY: &str = "preferences";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    pub reduced_motion: bool,
    pub font_scale: String,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            reduced_motion: false,
            font_scale: "normal".to_string(),
        }
    }
}

fn validate(preferences: &Preferences) -> Result<(), AppError> {
    if preferences.font_scale != "normal" && preferences.font_scale != "large" {
        return Err(AppError::validation("fontScale harus normal atau large."));
    }
    Ok(())
}

pub fn get_preferences(connection: &Connection) -> Result<Preferences, AppError> {
    let raw = app_meta::get(connection, PREFERENCES_KEY)?;
    match raw {
        None => Ok(Preferences::default()),
        Some(raw) => match serde_json::from_str::<Preferences>(&raw) {
            Ok(preferences) if validate(&preferences).is_ok() => Ok(preferences),
            _ => Ok(Preferences::default()),
        },
    }
}

pub fn set_preferences(connection: &Connection, preferences: &Preferences) -> Result<Preferences, AppError> {
    validate(preferences)?;
    let raw = serde_json::to_string(preferences)
        .map_err(|_| AppError::validation("Preferensi tidak dapat diserialisasi."))?;
    app_meta::set(connection, PREFERENCES_KEY, &raw)?;
    Ok(preferences.clone())
}

#[tauri::command]
pub fn preferences_get(db: State<'_, DbState>) -> Result<Preferences, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_preferences(&connection)
}

#[tauri::command]
pub fn preferences_set(db: State<'_, DbState>, input: Preferences) -> Result<Preferences, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_preferences(&connection, &input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    #[test]
    fn returns_defaults_when_unset() {
        let connection = test_connection();
        let preferences = get_preferences(&connection).expect("defaults");
        assert!(!preferences.reduced_motion);
        assert_eq!(preferences.font_scale, "normal");
    }

    #[test]
    fn persists_preferences() {
        let connection = test_connection();
        let saved = set_preferences(
            &connection,
            &Preferences {
                reduced_motion: true,
                font_scale: "large".to_string(),
            },
        )
        .expect("save");

        assert!(saved.reduced_motion);
        let loaded = get_preferences(&connection).expect("load");
        assert!(loaded.reduced_motion);
        assert_eq!(loaded.font_scale, "large");
    }

    #[test]
    fn rejects_invalid_font_scale() {
        let connection = test_connection();
        let error = set_preferences(
            &connection,
            &Preferences {
                reduced_motion: false,
                font_scale: "huge".to_string(),
            },
        )
        .expect_err("invalid");
        assert_eq!(error.code, "VALIDATION_FAILED");
    }
}
