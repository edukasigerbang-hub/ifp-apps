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

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PinnedMaterial {
    pub material_id: String,
    pub pinned_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPinnedMaterialInput {
    pub profile_id: String,
    pub material_id: String,
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

/// Batas sematan dipakai bersama oleh paket dan materi HTML5 (24 total).
fn count_pins(connection: &Connection, profile_id: &str) -> Result<i64, AppError> {
    connection
        .query_row(
            "SELECT (SELECT COUNT(*) FROM pinned_lessons WHERE profile_id = ?1)
                  + (SELECT COUNT(*) FROM pinned_materials WHERE profile_id = ?1)",
            [profile_id],
            |row| row.get(0),
        )
        .map_err(AppError::read)
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

    let count = count_pins(connection, &input.profile_id)?;
    if count >= MAX_PINNED {
        return Err(AppError::validation(&format!(
            "Maksimal {MAX_PINNED} materi disematkan per profil (paket dan materi HTML5 digabung)."
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

pub fn list_pinned_materials(
    connection: &Connection,
    profile_id: &str,
) -> Result<Vec<PinnedMaterial>, AppError> {
    ensure_profile(connection, profile_id)?;
    // `material_install` memakai PK (material_id, version) sehingga tidak bisa
    // menjadi target foreign key; baris yang menunjuk materi yang sudah tidak
    // terpasang dibuang di sini agar tidak ikut memakan kuota 24.
    connection
        .execute(
            "DELETE FROM pinned_materials
              WHERE profile_id = ?1
                AND material_id NOT IN (
                  SELECT material_id FROM material_install WHERE state = 'active'
                )",
            [profile_id],
        )
        .map_err(AppError::write)?;

    let mut statement = connection
        .prepare(
            "SELECT material_id, pinned_at
               FROM pinned_materials
              WHERE profile_id = ?1
              ORDER BY pinned_at DESC, rowid DESC",
        )
        .map_err(AppError::read)?;
    let pinned = statement
        .query_map([profile_id], |row| {
            Ok(PinnedMaterial {
                material_id: row.get(0)?,
                pinned_at: row.get(1)?,
            })
        })
        .map_err(AppError::read)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(AppError::read)?;
    Ok(pinned)
}

pub fn set_pinned_material(
    connection: &Connection,
    input: &SetPinnedMaterialInput,
) -> Result<bool, AppError> {
    validate_id("profileId", &input.profile_id)?;
    validate_id("materialId", &input.material_id)?;
    ensure_profile(connection, &input.profile_id)?;

    if !input.pinned {
        connection
            .execute(
                "DELETE FROM pinned_materials WHERE profile_id = ?1 AND material_id = ?2",
                params![input.profile_id, input.material_id],
            )
            .map_err(AppError::write)?;
        return Ok(false);
    }

    let installed = connection
        .query_row(
            "SELECT 1 FROM material_install WHERE material_id = ?1 AND state = 'active'",
            [&input.material_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if installed.is_none() {
        return Err(AppError::material_not_found(&format!(
            "Materi “{}” belum terpasang di perangkat ini.",
            input.material_id
        )));
    }

    let already = connection
        .query_row(
            "SELECT 1 FROM pinned_materials WHERE profile_id = ?1 AND material_id = ?2",
            params![input.profile_id, input.material_id],
            |row| row.get::<_, i64>(0),
        )
        .optional()
        .map_err(AppError::read)?;
    if already.is_some() {
        return Ok(true);
    }

    let count = count_pins(connection, &input.profile_id)?;
    if count >= MAX_PINNED {
        return Err(AppError::validation(&format!(
            "Maksimal {MAX_PINNED} materi disematkan per profil (paket dan materi HTML5 digabung)."
        )));
    }

    connection
        .execute(
            "INSERT INTO pinned_materials (profile_id, material_id, pinned_at)
             VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
            params![input.profile_id, input.material_id],
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

#[tauri::command]
pub fn pinned_material_list(
    db: State<'_, DbState>,
    profile_id: String,
) -> Result<Vec<PinnedMaterial>, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    list_pinned_materials(&connection, &profile_id)
}

#[tauri::command]
pub fn pinned_material_set(
    db: State<'_, DbState>,
    input: SetPinnedMaterialInput,
) -> Result<bool, AppError> {
    let connection = db.0.lock().map_err(|_| AppError::state_unavailable())?;
    set_pinned_material(&connection, &input)
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

    fn material(material_id: &str, pinned: bool) -> SetPinnedMaterialInput {
        SetPinnedMaterialInput {
            profile_id: String::new(),
            material_id: material_id.to_string(),
            pinned,
        }
    }

    fn install_material(connection: &Connection, material_id: &str) {
        connection
            .execute(
                "INSERT INTO material_install
                   (material_id, version, sha256, size_bytes, state, installed_at)
                 VALUES (?1, '1.0.0', 'abc', 1024, 'active', '2026-10-28T00:00:00Z')",
                [material_id],
            )
            .expect("material row");
    }

    #[test]
    fn pins_and_lists_material_once() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        install_material(&connection, "demo-siklus-air");

        let mut input = material("demo-siklus-air", true);
        input.profile_id = profile.id.clone();
        assert!(set_pinned_material(&connection, &input).expect("pin"));
        assert!(set_pinned_material(&connection, &input).expect("pin again"));

        let pinned = list_pinned_materials(&connection, &profile.id).expect("list");
        assert_eq!(pinned.len(), 1);
        assert_eq!(pinned[0].material_id, "demo-siklus-air");
        assert!(!pinned[0].pinned_at.is_empty());

        input.pinned = false;
        assert!(!set_pinned_material(&connection, &input).expect("unpin"));
        assert!(!set_pinned_material(&connection, &input).expect("unpin again"));
        assert!(list_pinned_materials(&connection, &profile.id).expect("list").is_empty());
    }

    #[test]
    fn material_pin_shares_limit_with_lessons() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        install_material(&connection, "demo-siklus-air");
        install_material(&connection, "demo-kedua");

        for index in 0..(MAX_PINNED - 1) {
            set_pinned(&connection, &sample(&profile.id, &format!("lesson-{index}"), true))
                .expect("pin within limit");
        }

        let mut first = material("demo-siklus-air", true);
        first.profile_id = profile.id.clone();
        assert!(set_pinned_material(&connection, &first).expect("pin ke-24"));

        let error = set_pinned(&connection, &sample(&profile.id, "satu-terlalu-banyak", true))
            .expect_err("limit bersama");
        assert_eq!(error.code, "VALIDATION_FAILED");

        let mut second = material("demo-kedua", true);
        second.profile_id = profile.id.clone();
        let error = set_pinned_material(&connection, &second).expect_err("limit bersama");
        assert_eq!(error.code, "VALIDATION_FAILED");

        // Menyematkan ulang materi yang sudah ada tetap boleh walau batas tercapai.
        assert!(set_pinned_material(&connection, &first).expect("repin"));
    }

    #[test]
    fn rejects_material_that_is_not_installed() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        let mut input = material("belum-terpasang", true);
        input.profile_id = profile.id.clone();
        let error = set_pinned_material(&connection, &input).expect_err("not installed");
        assert_eq!(error.code, "MATERIAL_NOT_FOUND");
    }

    #[test]
    fn prunes_pins_for_removed_material() {
        let connection = test_connection();
        let profile = crate::profile::create_profile(&connection, "Budi", "student").expect("profile");
        install_material(&connection, "demo-siklus-air");
        let mut input = material("demo-siklus-air", true);
        input.profile_id = profile.id.clone();
        set_pinned_material(&connection, &input).expect("pin");

        connection
            .execute("DELETE FROM material_install WHERE material_id = ?1", ["demo-siklus-air"])
            .expect("remove material");

        assert!(list_pinned_materials(&connection, &profile.id).expect("list").is_empty());
        let remaining: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM pinned_materials WHERE profile_id = ?1",
                [&profile.id],
                |row| row.get(0),
            )
            .expect("count");
        assert_eq!(remaining, 0);
    }

    #[test]
    fn rejects_unknown_profile_for_material() {
        let connection = test_connection();
        let mut input = material("demo-siklus-air", true);
        input.profile_id = "tidak-ada".to_string();
        let error = set_pinned_material(&connection, &input).expect_err("unknown profile");
        assert_eq!(error.code, "PROFILE_NOT_FOUND");
        assert!(list_pinned_materials(&connection, "tidak-ada").is_err());
    }
}
