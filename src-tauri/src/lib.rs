mod backup;
mod content;
mod db;
mod error;
mod learning;
mod license;
mod sync;
mod validation;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let data_dir = match std::env::var_os("IFP_DATA_DIR") {
        Some(dir) => std::path::PathBuf::from(dir),
        None => app.path().app_data_dir()?,
      };
      std::fs::create_dir_all(&data_dir)?;
      let content_root = data_dir.join("content");
      std::fs::create_dir_all(&content_root)?;
      let connection = db::open(&data_dir.join("ifp.db"))?;
      app.manage(db::DbState(std::sync::Mutex::new(connection)));
      app.manage(content::ContentState { root: content_root });
      app.manage(license::LicenseState::from_env());

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      learning::learning_ensure_profile,
      learning::learning_start_session,
      learning::learning_save_attempt,
      learning::learning_get_summary,
      sync::sync_get_device_id,
      sync::sync_list_pending,
      sync::sync_mark_retry,
      sync::sync_mark_acknowledged,
      sync::sync_get_status,
      content::content_import_package,
      content::content_list_packages,
      content::content_rollback_package,
      content::content_get_active,
      content::content_read_asset,
      content::content_list_active,
      content::content_get_package,
      license::license_get_machine_id,
      license::license_get_status,
      license::license_import_file,
      license::license_import_json,
      license::license_get_entitlements,
      license::license_export_request,
      license::license_refresh,
      license::license_activate_online,
      backup::backup_export,
      backup::backup_inspect,
      backup::backup_restore
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
