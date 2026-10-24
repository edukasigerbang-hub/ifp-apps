use crate::db::DbState;
use crate::error::AppError;
use crate::profile;
use crate::validation::validate_token;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::State;

const MAX_NOTES: usize = 1000;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewView {
    pub id: String,
    pub package_id: String,
    pub package_version: String,
    pub reviewer_name: String,
    pub decision: String,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordReviewInput {
    pub package_id: String,
    pub package_version: String,
    pub decision: String,
    pub notes: Option<String>,
}

fn validate_version(value: &str) -> Result<(), AppError> {
    let valid = !value.is_empty()
        && value.len() <= 40
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '+'));
    if valid {
        Ok(())
    } else {
        Err(AppError::validation("Versi paket tidak valid."))
    }
}

fn find_review(connection: &Connection, id: &str) -> Result<Option<ReviewView>, AppError> {
    connection
        .query_row(
            "SELECT r.id, r.package_id, r.package_version, p.display_name, r.decision,
                    r.notes, r.created_at
             FROM content_reviews r
             JOIN profiles p ON p.id = r.reviewer_profile_id
             WHERE r.id = ?1",
            [id],
            |row| {
                Ok(ReviewView {
                    id: row.get(0)?,
                    package_id: row.get(1)?,
                    package_version: row.get(2)?,
                    reviewer_name: row.get(3)?,
                    decision: row.get(4)?,
                    notes: row.get(5)?,
                    created_at: row.get(6)?,
                })
            },
        )
        .optional()
        .map_err(AppError::read)
}

pub fn list_reviews(
    connection: &Connection,
    package_id: Option<&str>,
    package_version: Option<&str>,
) -> Result<Vec<ReviewView>, AppError> {
    let mut statement = connection
        .prepare(
            "SELECT r.id, r.package_id, r.package_version, p.display_name, r.decision,
                    r.notes, r.created_at
             FROM content_reviews r
             JOIN profiles p ON p.id = r.reviewer_profile_id
             WHERE (?1 IS NULL OR r.package_id = ?1)
               AND (?2 IS NULL OR r.package_version = ?2)
             ORDER BY r.created_at DESC, r.rowid DESC
             LIMIT 100",
        )
        .map_err(AppError::read)?;

    let reviews = statement
        .query_map(params![package_id, package_version], |row| {
            Ok(ReviewView {
                id: row.get(0)?,
                package_id: row.get(1)?,
                package_version: row.get(2)?,
                reviewer_name: row.get(3)?,
                decision: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;

    Ok(reviews)
}

pub fn record_review(
    connection: &Connection,
    input: &RecordReviewInput,
) -> Result<ReviewView, AppError> {
    validate_token(&input.package_id, "ID paket")?;
    validate_version(&input.package_version)?;
    if input.decision != "approved" && input.decision != "rejected" {
        return Err(AppError::validation("Keputusan review harus approved atau rejected."));
    }
    let notes = match input.notes.as_deref().map(str::trim) {
        Some(value) if value.chars().count() > MAX_NOTES => {
            return Err(AppError::validation("Catatan review maksimal 1000 karakter."));
        }
        Some(value) if !value.is_empty() => Some(value.to_string()),
        _ => None,
    };

    let active = profile::get_active_profile(connection)?;
    if active.profile_type != "teacher" {
        return Err(AppError::review_forbidden());
    }

    let exists: Option<i64> = connection
        .query_row(
            "SELECT 1 FROM content_packages WHERE package_id = ?1 AND version = ?2",
            params![input.package_id, input.package_version],
            |row| row.get(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if exists.is_none() {
        return Err(AppError::validation("Paket tidak ditemukan di perangkat ini."));
    }

    let id = uuid::Uuid::new_v4().to_string();
    connection
        .execute(
            "INSERT INTO content_reviews
               (id, package_id, package_version, reviewer_profile_id, decision, notes, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
            params![
                id,
                input.package_id,
                input.package_version,
                active.id,
                input.decision,
                notes
            ],
        )
        .map_err(AppError::write)?;

    find_review(connection, &id)?.ok_or_else(|| AppError::read("Review tidak ditemukan."))
}

#[tauri::command]
pub fn review_list(
    db: State<'_, DbState>,
    package_id: Option<String>,
    package_version: Option<String>,
) -> Result<Vec<ReviewView>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_reviews(
        &connection,
        package_id.as_deref(),
        package_version.as_deref(),
    )
}

#[tauri::command]
pub fn review_record(
    db: State<'_, DbState>,
    input: RecordReviewInput,
) -> Result<ReviewView, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    record_review(&connection, &input)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_connection;

    fn seed_package(connection: &Connection) {
        connection
            .execute(
                "INSERT INTO content_packages
                   (package_id, version, source, status, installed_at)
                 VALUES ('pkg-uji', '1.0.0', 'imported', 'active', '2026-10-24T00:00:00Z')",
                [],
            )
            .expect("package");
    }

    fn teacher(connection: &Connection) -> String {
        let profile = profile::create_profile(connection, "Bu Guru", "teacher").expect("teacher");
        profile::set_active_profile(connection, &profile.id).expect("active");
        profile.id
    }

    fn input(decision: &str) -> RecordReviewInput {
        RecordReviewInput {
            package_id: "pkg-uji".to_string(),
            package_version: "1.0.0".to_string(),
            decision: decision.to_string(),
            notes: Some("  Sudah sesuai  ".to_string()),
        }
    }

    #[test]
    fn teacher_records_review_and_list_joins_name() {
        let connection = test_connection();
        seed_package(&connection);
        teacher(&connection);

        let review = record_review(&connection, &input("approved")).expect("review");
        assert_eq!(review.decision, "approved");
        assert_eq!(review.reviewer_name, "Bu Guru");
        assert_eq!(review.notes.as_deref(), Some("Sudah sesuai"));

        let all = list_reviews(&connection, Some("pkg-uji"), None).expect("list");
        assert_eq!(all.len(), 1);
        assert_eq!(all[0].id, review.id);
    }

    #[test]
    fn student_cannot_record_review() {
        let connection = test_connection();
        seed_package(&connection);
        profile::get_active_profile(&connection).expect("default student");

        let error = record_review(&connection, &input("approved")).expect_err("forbidden");
        assert_eq!(error.code, "REVIEW_FORBIDDEN");
        assert_eq!(list_reviews(&connection, None, None).expect("list").len(), 0);
    }

    #[test]
    fn rejects_invalid_reviews() {
        let connection = test_connection();
        seed_package(&connection);
        teacher(&connection);

        assert!(record_review(&connection, &input("pending")).is_err());

        let mut missing = input("approved");
        missing.package_id = "pkg-lain".to_string();
        assert!(record_review(&connection, &missing).is_err());

        let mut too_long = input("approved");
        too_long.notes = Some("x".repeat(MAX_NOTES + 1));
        assert!(record_review(&connection, &too_long).is_err());

        let mut bad_version = input("approved");
        bad_version.package_version = "1.0 beta".to_string();
        assert!(record_review(&connection, &bad_version).is_err());
    }

    #[test]
    fn lists_reviews_newest_first() {
        let connection = test_connection();
        seed_package(&connection);
        teacher(&connection);
        record_review(&connection, &input("rejected")).expect("first");
        record_review(&connection, &input("approved")).expect("second");

        let all = list_reviews(&connection, Some("pkg-uji"), Some("1.0.0")).expect("list");
        assert_eq!(all.len(), 2);
        assert_eq!(all[0].decision, "approved");
        assert_eq!(list_reviews(&connection, Some("pkg-lain"), None).expect("empty").len(), 0);
    }
}
