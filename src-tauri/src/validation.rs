use crate::error::AppError;

pub(crate) const MAX_ID_LEN: usize = 100;

pub(crate) fn validate_token(value: &str, label: &str) -> Result<(), AppError> {
    let valid = !value.is_empty()
        && value.len() <= MAX_ID_LEN
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || character == '-' || character == '_');

    if valid {
        Ok(())
    } else {
        Err(AppError::validation(&format!("{label} tidak valid.")))
    }
}

pub(crate) fn validate_timestamp(value: &str) -> Result<(), AppError> {
    let valid = (10..=40).contains(&value.len())
        && value
            .chars()
            .all(|character| character.is_ascii_digit() || matches!(character, '-' | ':' | '.' | 'T' | 'Z' | '+'));

    if valid {
        Ok(())
    } else {
        Err(AppError::validation("Waktu kejadian tidak valid."))
    }
}
