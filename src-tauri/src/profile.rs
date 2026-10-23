use crate::app_meta;
use crate::db::DbState;
use crate::error::AppError;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

const ACTIVE_PROFILE_KEY: &str = "active_profile_id";
const DEFAULT_PROFILE_NAME: &str = "Siswa Lokal";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProfileView {
    pub id: String,
    pub display_name: String,
    pub profile_type: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProfileInput {
    pub display_name: String,
    pub profile_type: Option<String>,
}

fn validate_name(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() || trimmed.chars().count() > 80 {
        return Err(AppError::validation("Nama profil harus 1–80 karakter."));
    }
    Ok(trimmed.to_string())
}

fn validate_type(value: &str) -> Result<String, AppError> {
    match value {
        "student" | "teacher" => Ok(value.to_string()),
        _ => Err(AppError::validation("Tipe profil harus student atau teacher.")),
    }
}

fn find_profile(connection: &Connection, id: &str) -> Result<Option<ProfileView>, AppError> {
    connection
        .query_row(
            "SELECT id, display_name, profile_type, created_at, updated_at FROM profiles WHERE id = ?1",
            [id],
            |row| {
                Ok(ProfileView {
                    id: row.get(0)?,
                    display_name: row.get(1)?,
                    profile_type: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            },
        )
        .optional()
        .map_err(AppError::read)
}

pub fn list_profiles(connection: &Connection) -> Result<Vec<ProfileView>, AppError> {
    let mut statement = connection
        .prepare(
            "SELECT id, display_name, profile_type, created_at, updated_at
             FROM profiles ORDER BY created_at ASC, id ASC",
        )
        .map_err(AppError::read)?;

    let profiles = statement
        .query_map([], |row| {
            Ok(ProfileView {
                id: row.get(0)?,
                display_name: row.get(1)?,
                profile_type: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    Ok(profiles)
}

pub fn create_profile(
    connection: &Connection,
    display_name: &str,
    profile_type: &str,
) -> Result<ProfileView, AppError> {
    let name = validate_name(display_name)?;
    let profile_type = validate_type(profile_type)?;
    let id = uuid::Uuid::new_v4().to_string();

    connection
        .execute(
            "INSERT INTO profiles (id, display_name, profile_type, created_at, updated_at)
             VALUES (?1, ?2, ?3, strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
            params![id, name, profile_type],
        )
        .map_err(AppError::write)?;

    find_profile(connection, &id)?.ok_or_else(|| AppError::read("Profil tidak ditemukan."))
}

pub fn get_active_profile(connection: &Connection) -> Result<ProfileView, AppError> {
    if let Some(id) = app_meta::get(connection, ACTIVE_PROFILE_KEY)? {
        if let Some(profile) = find_profile(connection, &id)? {
            return Ok(profile);
        }
    }

    let profiles = list_profiles(connection)?;
    if let Some(profile) = profiles.into_iter().next() {
        app_meta::set(connection, ACTIVE_PROFILE_KEY, &profile.id)?;
        return Ok(profile);
    }

    let profile = create_profile(connection, DEFAULT_PROFILE_NAME, "student")?;
    app_meta::set(connection, ACTIVE_PROFILE_KEY, &profile.id)?;
    Ok(profile)
}

pub fn set_active_profile(connection: &Connection, id: &str) -> Result<ProfileView, AppError> {
    let profile = find_profile(connection, id)?
        .ok_or_else(|| AppError::validation("Profil tidak ditemukan."))?;
    app_meta::set(connection, ACTIVE_PROFILE_KEY, &profile.id)?;
    Ok(profile)
}

#[tauri::command]
pub fn profile_list(db: State<'_, DbState>) -> Result<Vec<ProfileView>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_profiles(&connection)
}

#[tauri::command]
pub fn profile_create(
    db: State<'_, DbState>,
    input: CreateProfileInput,
) -> Result<ProfileView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    create_profile(
        &connection,
        &input.display_name,
        input.profile_type.as_deref().unwrap_or("student"),
    )
}

#[tauri::command]
pub fn profile_get_active(db: State<'_, DbState>) -> Result<ProfileView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    get_active_profile(&connection)
}

#[tauri::command]
pub fn profile_set_active(db: State<'_, DbState>, profile_id: String) -> Result<ProfileView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_active_profile(&connection, &profile_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    #[test]
    fn creates_default_profile_and_keeps_it_active() {
        let connection = test_connection();
        let first = get_active_profile(&connection).expect("first");
        assert_eq!(first.display_name, "Siswa Lokal");
        assert_eq!(first.profile_type, "student");

        let second = get_active_profile(&connection).expect("second");
        assert_eq!(second.id, first.id);

        let all = list_profiles(&connection).expect("list");
        assert_eq!(all.len(), 1);
    }

    #[test]
    fn creates_and_switches_profiles() {
        let connection = test_connection();
        let teacher = create_profile(&connection, "  Bu Sari  ", "teacher").expect("teacher");
        assert_eq!(teacher.display_name, "Bu Sari");
        assert_eq!(teacher.profile_type, "teacher");

        let active = set_active_profile(&connection, &teacher.id).expect("active");
        assert_eq!(active.id, teacher.id);

        let current = get_active_profile(&connection).expect("current");
        assert_eq!(current.id, teacher.id);
        assert_eq!(list_profiles(&connection).expect("list").len(), 1);
    }

    #[test]
    fn rejects_invalid_profiles() {
        let connection = test_connection();
        assert!(create_profile(&connection, "   ", "student").is_err());
        assert!(create_profile(&connection, "Budi", "admin").is_err());
        assert!(set_active_profile(&connection, "missing").is_err());
    }
}
