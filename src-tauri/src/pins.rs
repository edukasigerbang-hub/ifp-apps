use crate::db::DbState;
use crate::error::AppError;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

pub const MAX_PINNED: i64 = 24;
const MAX_ID_CHARS: usize = 120;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PinnedLesson {
    pub package_id: String,
    pub lesson_id: String,
    pub pinned_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPinnedInput {
    pub profile_id: String,
    pub package_id: String,
    pub lesson_id: String,
    pub pinned: bool,
}

fn validate_id(label: &str, value: &str) -> Result<(), AppError> {
    if value.trim().is_empty() || value.chars().count() > MAX_ID_CHARS {
        return Err(AppError::validation(&format!(
            "{label} harus 1–{MAX_ID_CHARS} karakter."
        )));
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

pub fn list_pinned(
    connection: &Connection,
    profile_id: &str,
) -> Result<Vec<PinnedLesson>, AppError> {
    ensure_profile(connection, profile_id)?;
    let mut statement = connection
        .prepare(
            "SELECT package_id, lesson_id, pinned_at
               FROM pinned_lessons
              WHERE profile_id = ?1
              ORDER BY pinned_at DESC, rowid DESC",
        )
        .map_err(AppError::read)?;
    let pinned = statement
        .query_map([profile_id], |row| {
            Ok(PinnedLesson {
                package_id: row.get(0)?,
                lesson_id: row.get(1)?,
                pinned_at: row.get(2)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;
    Ok(pinned)
}

pub fn set_pinned(connection: &Connection, input: &SetPinnedInput) -> Result<bool, AppError> {
    validate_id("profileId", &input.profile_id)?;
    validate_id("packageId", &input.package_id)?;
    validate_id("lessonId", &input.lesson_id)?;
    ensure_profile(connection, &input.profile_id)?;

    if !input.pinned {
        connection
            .execute(
                "DELETE FROM pinned_lessons
                  WHERE profile_id = ?1 AND package_id = ?2 AND lesson_id = ?3",
                params![input.profile_id, input.package_id, input.lesson_id],
            )
            .map_err(AppError::write)?;
        return Ok(false);
    }

    let already = connection
        .query_row(
            "SELECT 1 FROM pinned_lessons
              WHERE profile_id = ?1 AND package_id = ?2 AND lesson_id = ?3",
            params![input.profile_id, input.package_id, input.lesson_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if already.is_some() {
        return Ok(true);
    }

    let count: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM pinned_lessons WHERE profile_id = ?1",
            [&input.profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    if count >= MAX_PINNED {
        return Err(AppError::validation(&format!(
            "Maksimal {MAX_PINNED} materi disematkan per profil."
        )));
    }

    connection
        .execute(
            "INSERT INTO pinned_lessons (profile_id, package_id, lesson_id, pinned_at)
             VALUES (?1, ?2, ?3, strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
            params![input.profile_id, input.package_id, input.lesson_id],
        )
        .map_err(AppError::write)?;
    Ok(true)
}

#[tauri::command]
pub fn pinned_list(
    db: State<'_, DbState>,
    profile_id: String,
) -> Result<Vec<PinnedLesson>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_pinned(&connection, &profile_id)
}

#[tauri::command]
pub fn pinned_set(db: State<'_, DbState>, input: SetPinnedInput) -> Result<bool, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_pinned(&connection, &input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    fn sample(profile_id: &str, lesson: &str, pinned: bool) -> SetPinnedInput {
        SetPinnedInput {
            profile_id: profile_id.to_string(),
            package_id: "kelas3-matematika-b04-pecahan".to_string(),
            lesson_id: lesson.to_string(),
            pinned,
        }
    }

    #[test]
    fn pins_and_lists_without_duplicates() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");

        assert!(set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", true)).expect("pin"));
        assert!(set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", true)).expect("pin again"));
        assert!(set_pinned(&connection, &sample(&profile.id, "membandingkan-pecahan", true)).expect("pin"));

        let pinned = list_pinned(&connection, &profile.id).expect("list");
        assert_eq!(pinned.len(), 2);
        assert!(pinned
            .iter()
            .any(|item| item.lesson_id == "pecahan-sederhana"));
    }

    #[test]
    fn unpin_removes_and_is_idempotent() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", true)).expect("pin");

        assert!(!set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", false)).expect("unpin"));
        assert!(!set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", false)).expect("unpin again"));
        assert!(list_pinned(&connection, &profile.id).expect("list").is_empty());
    }

    #[test]
    fn rejects_unknown_profile() {
        let connection = test_connection();
        let error = set_pinned(&connection, &sample("tidak-ada", "pecahan-sederhana", true))
            .expect_err("unknown profile");
        assert_eq!(error.code, "PROFILE_NOT_FOUND");
        assert!(list_pinned(&connection, "tidak-ada").is_err());
    }

    #[test]
    fn rejects_empty_ids() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        let error = set_pinned(&connection, &sample(&profile.id, "  ", true)).expect_err("empty");
        assert_eq!(error.code, "VALIDATION_FAILED");
    }

    #[test]
    fn enforces_pin_limit() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        for index in 0..MAX_PINNED {
            set_pinned(&connection, &sample(&profile.id, &format!("lesson-{index}"), true))
                .expect("pin within limit");
        }
        let error = set_pinned(&connection, &sample(&profile.id, "satu-terlalu-banyak", true))
            .expect_err("limit");
        assert_eq!(error.code, "VALIDATION_FAILED");
        assert_eq!(list_pinned(&connection, &profile.id).expect("list").len() as i64, MAX_PINNED);

        // Menyematkan ulang materi yang sudah ada tetap boleh walau batas tercapai.
        assert!(set_pinned(&connection, &sample(&profile.id, "lesson-0", true)).expect("repin"));
    }

    #[test]
    fn deleting_profile_removes_pins() {
        let connection = test_connection();
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .expect("pragma");
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        let other = crate::profile::create_profile(&connection, "Sari", "student").expect("profile");
        set_pinned(&connection, &sample(&profile.id, "pecahan-sederhana", true)).expect("pin");

        connection
            .execute("DELETE FROM profiles WHERE id = ?1", [&profile.id])
            .expect("delete profile");

        assert!(list_pinned(&connection, &other.id).expect("list").is_empty());
        let remaining: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM pinned_lessons WHERE profile_id = ?1",
                [&profile.id],
                |row| row.get(0),
            )
            .expect("count");
        assert_eq!(remaining, 0);
    }
}
