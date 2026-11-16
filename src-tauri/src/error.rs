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

    pub fn profile_not_found() -> Self {
        Self::new("PROFILE_NOT_FOUND", "Profil tidak ditemukan.")
    }

    pub fn profile_name_taken() -> Self {
        Self::new("PROFILE_NAME_TAKEN", "Nama profil sudah dipakai.")
    }

    pub fn profile_last_remaining() -> Self {
        Self::new("PROFILE_LAST_REMAINING", "Profil terakhir tidak dapat dihapus.")
    }

    pub fn profile_has_data(message: &str) -> Self {
        Self::new("PROFILE_HAS_DATA", message)
    }

    pub fn review_forbidden() -> Self {
        Self::new(
            "REVIEW_FORBIDDEN",
            "Hanya profil guru yang dapat mencatat review konten.",
        )
    }

    pub fn profile_has_reviews() -> Self {
        Self::new(
            "PROFILE_HAS_REVIEWS",
            "Profil ini memiliki riwayat review konten dan tidak dapat dihapus.",
        )
    }

    pub fn avatar_invalid() -> Self {
        Self::new(
            "PROFILE_AVATAR_INVALID",
            "Foto profil harus berupa gambar PNG, JPEG, atau WebP.",
        )
    }

    pub fn avatar_too_large() -> Self {
        Self::new("PROFILE_AVATAR_TOO_LARGE", "Ukuran foto profil maksimal 1,5 MB.")
    }

    pub fn avatar_unreadable() -> Self {
        Self::new("PROFILE_AVATAR_UNREADABLE", "File foto profil tidak dapat dibaca.")
    }

    pub fn avatar_source_too_large() -> Self {
        Self::new(
            "PROFILE_AVATAR_SOURCE_TOO_LARGE",
            "Foto sumber maksimal 20 MB sebelum dipotong.",
        )
    }

    pub fn material_not_found(message: &str) -> Self {
        Self::new("MATERIAL_NOT_FOUND", message)
    }

    pub fn material_invalid(message: &str) -> Self {
        Self::new("MATERIAL_INVALID", message)
    }

    pub fn material_too_large() -> Self {
        Self::new("MATERIAL_TOO_LARGE", "Bundel materi melebihi batas 50 MB.")
    }

    pub fn material_hash_mismatch(message: &str) -> Self {
        Self::new("MATERIAL_HASH_MISMATCH", message)
    }

    pub fn material_signature_invalid(message: &str) -> Self {
        Self::new("MATERIAL_SIGNATURE_INVALID", message)
    }

    pub fn material_schema_unsupported(message: &str) -> Self {
        Self::new("MATERIAL_SCHEMA_UNSUPPORTED", message)
    }

    pub fn material_not_self_contained(message: &str) -> Self {
        Self::new("MATERIAL_NOT_SELF_CONTAINED", message)
    }

    pub fn material_incompatible_app(min_version: &str) -> Self {
        Self::new(
            "MATERIAL_INCOMPATIBLE_APP",
            &format!("Materi membutuhkan aplikasi versi {min_version} atau lebih baru."),
        )
    }

    pub fn material_fetch_failed(message: &str) -> Self {
        Self::new("MATERIAL_FETCH_FAILED", message)
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
