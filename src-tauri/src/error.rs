use serde::Serialize;
use std::fmt::Display;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: String,
    pub message: String,
}

impl AppError {
    fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
        }
    }

    pub fn validation(message: &str) -> Self {
        Self::new("VALIDATION_FAILED", message)
    }

    pub fn session_not_found() -> Self {
        Self::new("SESSION_NOT_FOUND", "Sesi belajar tidak ditemukan.")
    }

    pub fn state_unavailable() -> Self {
        Self::new("STATE_UNAVAILABLE", "Penyimpanan lokal tidak tersedia.")
    }

    pub fn write(error: impl Display) -> Self {
        eprintln!("database write error: {error}");
        Self::new("DATABASE_WRITE_FAILED", "Hasil belajar gagal disimpan.")
    }

    pub fn read(error: impl Display) -> Self {
        eprintln!("database read error: {error}");
        Self::new("DATABASE_READ_FAILED", "Data lokal tidak dapat dibaca.")
    }
}
