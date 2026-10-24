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

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteProfileResult {
    pub deleted_id: String,
    pub active_profile: ProfileView,
}

#[derive(Debug, Default)]
struct ProfileDataCounts {
    sessions: i64,
    attempts: i64,
    responses: i64,
    progress: i64,
    outbox: i64,
}

impl ProfileDataCounts {
    fn total(&self) -> i64 {
        self.sessions + self.attempts + self.responses + self.progress + self.outbox
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

pub fn rename_profile(
    connection: &Connection,
    id: &str,
    display_name: &str,
) -> Result<ProfileView, AppError> {
    let name = validate_name(display_name)?;
    let current = find_profile(connection, id)?.ok_or_else(AppError::profile_not_found)?;

    let duplicate: Option<String> = connection
        .query_row(
            "SELECT id FROM profiles
             WHERE id <> ?1 AND lower(trim(display_name)) = lower(?2)
             LIMIT 1",
            params![id, name],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if duplicate.is_some() {
        return Err(AppError::profile_name_taken());
    }

    if current.display_name == name {
        return Ok(current);
    }

    connection
        .execute(
            "UPDATE profiles
             SET display_name = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
             WHERE id = ?1",
            params![id, name],
        )
        .map_err(AppError::write)?;

    find_profile(connection, id)?.ok_or_else(AppError::profile_not_found)
}

fn profile_data_counts(
    connection: &Connection,
    profile_id: &str,
) -> Result<ProfileDataCounts, AppError> {
    let sessions: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM learning_sessions WHERE profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    let attempts: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM activity_attempts
             WHERE session_id IN (SELECT id FROM learning_sessions WHERE profile_id = ?1)",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    let responses: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM assessment_responses
             WHERE attempt_id IN (
               SELECT a.id FROM activity_attempts a
               JOIN learning_sessions s ON a.session_id = s.id
               WHERE s.profile_id = ?1
             )",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    let progress: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM progress_snapshots WHERE profile_id = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    let outbox: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sync_outbox
             WHERE json_extract(payload_json, '$.profileId') = ?1",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;

    Ok(ProfileDataCounts {
        sessions,
        attempts,
        responses,
        progress,
        outbox,
    })
}

pub fn delete_profile(
    connection: &mut Connection,
    id: &str,
    delete_data: bool,
) -> Result<DeleteProfileResult, AppError> {
    let target = find_profile(connection, id)?.ok_or_else(AppError::profile_not_found)?;

    let total: i64 = connection
        .query_row("SELECT COUNT(*) FROM profiles", [], |row| row.get(0))
        .map_err(AppError::read)?;
    if total <= 1 {
        return Err(AppError::profile_last_remaining());
    }

    let reviews: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM content_reviews WHERE reviewer_profile_id = ?1",
            [id],
            |row| row.get(0),
        )
        .map_err(AppError::read)?;
    if reviews > 0 {
        return Err(AppError::profile_has_reviews());
    }

    let counts = profile_data_counts(connection, id)?;
    if counts.total() > 0 && !delete_data {
        return Err(AppError::profile_has_data(&format!(
            "Profil \"{}\" memiliki {} sesi, {} percobaan, dan {} progres. Hapus profil beserta datanya untuk melanjutkan.",
            target.display_name, counts.sessions, counts.attempts, counts.progress
        )));
    }

    let transaction = connection.transaction().map_err(AppError::write)?;
    let was_active = app_meta::get(&transaction, ACTIVE_PROFILE_KEY)?.as_deref() == Some(id);

    if delete_data {
        transaction
            .execute(
                "DELETE FROM assessment_responses
                 WHERE attempt_id IN (
                   SELECT a.id FROM activity_attempts a
                   JOIN learning_sessions s ON a.session_id = s.id
                   WHERE s.profile_id = ?1
                 )",
                [id],
            )
            .map_err(AppError::write)?;
        transaction
            .execute(
                "DELETE FROM activity_attempts
                 WHERE session_id IN (SELECT id FROM learning_sessions WHERE profile_id = ?1)",
                [id],
            )
            .map_err(AppError::write)?;
        transaction
            .execute("DELETE FROM progress_snapshots WHERE profile_id = ?1", [id])
            .map_err(AppError::write)?;
        transaction
            .execute("DELETE FROM learning_sessions WHERE profile_id = ?1", [id])
            .map_err(AppError::write)?;
        transaction
            .execute(
                "DELETE FROM sync_outbox WHERE json_extract(payload_json, '$.profileId') = ?1",
                [id],
            )
            .map_err(AppError::write)?;
    }

    transaction
        .execute("DELETE FROM profiles WHERE id = ?1", [id])
        .map_err(AppError::write)?;

    if was_active {
        let next_id: Option<String> = transaction
            .query_row(
                "SELECT id FROM profiles ORDER BY created_at ASC, id ASC LIMIT 1",
                [],
                |row| row.get(0),
            )
            .optional()
            .map_err(AppError::read)?;
        if let Some(next_id) = next_id {
            app_meta::set(&transaction, ACTIVE_PROFILE_KEY, &next_id)?;
        }
    }

    let active_profile = get_active_profile(&transaction)?;
    transaction.commit().map_err(AppError::write)?;

    Ok(DeleteProfileResult {
        deleted_id: target.id,
        active_profile,
    })
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

#[tauri::command]
pub fn profile_rename(
    db: State<'_, DbState>,
    profile_id: String,
    display_name: String,
) -> Result<ProfileView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    rename_profile(&connection, &profile_id, &display_name)
}

#[tauri::command]
pub fn profile_delete(
    db: State<'_, DbState>,
    profile_id: String,
    delete_data: Option<bool>,
) -> Result<DeleteProfileResult, AppError> {
    let mut connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    delete_profile(&mut connection, &profile_id, delete_data.unwrap_or(false))
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

    #[test]
    fn renames_profile_and_rejects_duplicates() {
        let connection = test_connection();
        let first = get_active_profile(&connection).expect("first");
        let budi = create_profile(&connection, "Budi", "student").expect("budi");

        let renamed = rename_profile(&connection, &budi.id, "  Budi Santoso  ").expect("rename");
        assert_eq!(renamed.display_name, "Budi Santoso");

        let duplicate = rename_profile(&connection, &budi.id, "siswa lokal").expect_err("duplicate");
        assert_eq!(duplicate.code, "PROFILE_NAME_TAKEN");

        assert!(rename_profile(&connection, &budi.id, "   ").is_err());
        assert_eq!(
            rename_profile(&connection, &budi.id, "Budi Santoso")
                .expect("same name")
                .display_name,
            "Budi Santoso"
        );
        assert_eq!(
            find_profile(&connection, &first.id)
                .expect("find")
                .expect("exists")
                .display_name,
            "Siswa Lokal"
        );
    }

    fn seed_learning_data(connection: &Connection, profile_id: &str) {
        connection
            .execute(
                "INSERT INTO content_packages
                   (package_id, version, source, status, installed_at)
                 VALUES ('pkg-test', '1.0.0', 'bundled', 'active', '2026-10-24T00:00:00Z')",
                [],
            )
            .expect("package");
        connection
            .execute(
                "INSERT INTO learning_sessions
                   (id, profile_id, lesson_id, package_id, package_version, started_at, state)
                 VALUES ('s1', ?1, 'lesson-1', 'pkg-test', '1.0.0', '2026-10-24T00:00:00Z', 'active')",
                [profile_id],
            )
            .expect("session");
        connection
            .execute(
                "INSERT INTO activity_attempts
                   (id, session_id, activity_id, attempt_no, started_at, completed_at, score, state)
                 VALUES ('a1', 's1', 'activity-1', 1, '2026-10-24T00:00:00Z', '2026-10-24T00:01:00Z', 80, 'completed')",
                [],
            )
            .expect("attempt");
        connection
            .execute(
                "INSERT INTO assessment_responses
                   (id, attempt_id, question_id, response_json, is_correct, answered_at)
                 VALUES ('r1', 'a1', 'q1', '{\"optionId\":\"b\"}', 1, '2026-10-24T00:00:30Z')",
                [],
            )
            .expect("response");
        connection
            .execute(
                "INSERT INTO progress_snapshots
                   (id, profile_id, lesson_id, package_version, progress_json, updated_at)
                 VALUES ('p1', ?1, 'lesson-1', '1.0.0', '{}', '2026-10-24T00:01:00Z')",
                [profile_id],
            )
            .expect("progress");
        connection
            .execute(
                "INSERT INTO sync_outbox
                   (id, event_id, event_type, payload_json, created_at, attempts, state)
                 VALUES ('o1', 'e1', 'assessment.completed', ?1, '2026-10-24T00:01:00Z', 0, 'pending')",
                [format!(
                    "{{\"eventId\":\"e1\",\"profileId\":\"{profile_id}\"}}"
                )],
            )
            .expect("outbox");
    }

    #[test]
    fn deletes_profile_and_switches_active() {
        let mut connection = test_connection();
        let first = get_active_profile(&connection).expect("first");
        let second = create_profile(&connection, "Budi", "student").expect("second");
        assert_eq!(get_active_profile(&connection).expect("active").id, first.id);

        let deleted = delete_profile(&mut connection, &first.id, false).expect("delete");
        assert_eq!(deleted.deleted_id, first.id);
        assert_eq!(deleted.active_profile.id, second.id);
        assert_eq!(list_profiles(&connection).expect("list").len(), 1);

        let last = delete_profile(&mut connection, &second.id, false).expect_err("last");
        assert_eq!(last.code, "PROFILE_LAST_REMAINING");
    }

    #[test]
    fn blocks_deleting_reviewer_profile() {
        let mut connection = test_connection();
        let teacher = create_profile(&connection, "Bu Guru", "teacher").expect("teacher");
        create_profile(&connection, "Siswa Lain", "student").expect("student");
        connection
            .execute(
                "INSERT INTO content_packages
                   (package_id, version, source, status, installed_at)
                 VALUES ('pkg-review', '1.0.0', 'imported', 'active', '2026-10-24T00:00:00Z')",
                [],
            )
            .expect("package");
        connection
            .execute(
                "INSERT INTO content_reviews
                   (id, package_id, package_version, reviewer_profile_id, decision, notes, created_at)
                 VALUES ('rev-1', 'pkg-review', '1.0.0', ?1, 'approved', NULL, '2026-10-24T00:00:00Z')",
                [&teacher.id],
            )
            .expect("review");

        let blocked = delete_profile(&mut connection, &teacher.id, true).expect_err("blocked");
        assert_eq!(blocked.code, "PROFILE_HAS_REVIEWS");
        assert_eq!(list_profiles(&connection).expect("list").len(), 2);
    }

    #[test]
    fn requires_confirmation_and_removes_profile_data() {
        let mut connection = test_connection();
        let first = get_active_profile(&connection).expect("first");
        let second = create_profile(&connection, "Budi", "student").expect("second");
        seed_learning_data(&connection, &first.id);

        let refused = delete_profile(&mut connection, &first.id, false).expect_err("has data");
        assert_eq!(refused.code, "PROFILE_HAS_DATA");
        let counts = profile_data_counts(&connection, &first.id).expect("counts");
        assert_eq!(counts.total(), 5);

        let deleted = delete_profile(&mut connection, &first.id, true).expect("delete data");
        assert_eq!(deleted.active_profile.id, second.id);
        let counts = profile_data_counts(&connection, &first.id).expect("counts after");
        assert_eq!(counts.total(), 0);
        let sessions: i64 = connection
            .query_row("SELECT COUNT(*) FROM learning_sessions", [], |row| row.get(0))
            .expect("sessions");
        assert_eq!(sessions, 0);
        let outbox: i64 = connection
            .query_row("SELECT COUNT(*) FROM sync_outbox", [], |row| row.get(0))
            .expect("outbox");
        assert_eq!(outbox, 0);
    }
}
