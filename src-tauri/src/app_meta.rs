use crate::error::AppError;
use rusqlite::{params, Connection, OptionalExtension};

pub fn get(connection: &Connection, key: &str) -> Result<Option<String>, AppError> {
    connection
        .query_row("SELECT value FROM app_meta WHERE key = ?1", [key], |row| row.get(0))
        .optional()
        .map_err(AppError::read)
}

pub fn set(connection: &Connection, key: &str, value: &str) -> Result<(), AppError> {
    connection
        .execute(
            "INSERT INTO app_meta (key, value, updated_at)
             VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            params![key, value],
        )
        .map_err(AppError::write)?;
    Ok(())
}
