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

    pub fn content_invalid(message: &str) -> Self {
        Self::new("CONTENT_PACKAGE_INVALID", message)
    }

    pub fn content_hash(message: &str) -> Self {
        Self::new("CONTENT_ASSET_HASH_MISMATCH", message)
    }

    pub fn content_activation(message: &str) -> Self {
        Self::new("CONTENT_ACTIVATION_FAILED", message)
    }

    pub fn license_not_configured() -> Self {
        Self::new("LICENSE_NOT_CONFIGURED", "Kunci publik lisensi belum dikonfigurasi.")
    }

    pub fn license_invalid(message: &str) -> Self {
        Self::new("LICENSE_INVALID", message)
    }

    pub fn license_signature() -> Self {
        Self::new("LICENSE_SIGNATURE_INVALID", "Tanda tangan lisensi tidak valid.")
    }

    pub fn license_wrong_product() -> Self {
        Self::new("LICENSE_WRONG_PRODUCT", "Lisensi bukan untuk produk ini.")
    }

    pub fn license_device_mismatch() -> Self {
        Self::new("LICENSE_DEVICE_MISMATCH", "Lisensi tidak terikat ke perangkat ini.")
    }

    pub fn license_expired() -> Self {
        Self::new("LICENSE_EXPIRED", "Lisensi sudah kedaluwarsa.")
    }

    pub fn license_not_yet_valid() -> Self {
        Self::new("LICENSE_NOT_YET_VALID", "Lisensi belum berlaku.")
    }

    pub fn license_server_unavailable() -> Self {
        Self::new("LICENSE_SERVER_UNAVAILABLE", "Server aktivasi lisensi belum tersedia.")
    }

    pub fn backup_invalid(message: &str) -> Self {
        Self::new("BACKUP_INVALID", message)
    }

    pub fn backup_failed(message: &str) -> Self {
        Self::new("BACKUP_FAILED", message)
    }

    pub fn backup_schema_too_new() -> Self {
        Self::new("BACKUP_SCHEMA_TOO_NEW", "Backup berasal dari versi aplikasi yang lebih baru.")
    }

    pub fn export_failed(message: &str) -> Self {
        Self::new("EXPORT_FAILED", message)
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
