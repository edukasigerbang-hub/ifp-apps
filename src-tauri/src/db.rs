use rusqlite::{params, Connection, OptionalExtension};
use sha2::{Digest, Sha256};
use std::path::Path;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

#[derive(Debug)]
pub enum DbError {
    Sqlite(rusqlite::Error),
    ChecksumMismatch(i64),
}

impl std::fmt::Display for DbError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DbError::Sqlite(error) => write!(formatter, "sqlite error: {error}"),
            DbError::ChecksumMismatch(version) => {
                write!(formatter, "checksum migrasi {version} tidak cocok dengan skema yang sudah diterapkan")
            }
        }
    }
}

impl std::error::Error for DbError {}

impl From<rusqlite::Error> for DbError {
    fn from(error: rusqlite::Error) -> Self {
        DbError::Sqlite(error)
    }
}

struct Migration {
    version: i64,
    sql: &'static str,
}

const MIGRATIONS: &[Migration] = &[
    Migration {
        version: 1,
        sql: include_str!("migrations/0001_init.sql"),
    },
    Migration {
        version: 2,
        sql: include_str!("migrations/0002_sync.sql"),
    },
    Migration {
        version: 3,
        sql: include_str!("migrations/0003_content_activation.sql"),
    },
];

pub(crate) fn migration_count() -> i64 {
    MIGRATIONS.len() as i64
}

pub fn open(path: &Path) -> Result<Connection, DbError> {
    let mut connection = Connection::open(path)?;
    connection.pragma_update(None, "journal_mode", "WAL")?;
    connection.pragma_update(None, "foreign_keys", "ON")?;
    connection.pragma_update(None, "busy_timeout", 5000)?;
    migrate(&mut connection)?;
    Ok(connection)
}

fn checksum_of(sql: &str) -> String {
    Sha256::digest(sql.as_bytes())
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

pub(crate) fn migrate(connection: &mut Connection) -> Result<(), DbError> {
    connection.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
           version INTEGER PRIMARY KEY,
           applied_at TEXT NOT NULL,
           checksum TEXT NOT NULL
         );",
    )?;

    for migration in MIGRATIONS {
        let checksum = checksum_of(migration.sql);
        let applied: Option<String> = connection
            .query_row(
                "SELECT checksum FROM schema_migrations WHERE version = ?1",
                params![migration.version],
                |row| row.get(0),
            )
            .optional()?;

        match applied {
            Some(existing) if existing != checksum => {
                return Err(DbError::ChecksumMismatch(migration.version));
            }
            Some(_) => {}
            None => {
                let transaction = connection.transaction()?;
                transaction.execute_batch(migration.sql)?;
                transaction.execute(
                    "INSERT INTO schema_migrations (version, applied_at, checksum)
                     VALUES (?1, strftime('%Y-%m-%dT%H:%M:%fZ','now'), ?2)",
                    params![migration.version, checksum],
                )?;
                transaction.commit()?;
            }
        }
    }

    Ok(())
}

#[cfg(test)]
pub(crate) fn test_connection() -> Connection {
    let mut connection = Connection::open_in_memory().expect("in-memory sqlite");
    migrate(&mut connection).expect("migrasi in-memory");
    connection
}
