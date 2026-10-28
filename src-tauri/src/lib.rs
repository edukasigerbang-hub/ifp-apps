mod app_meta;
mod backup;
mod content;
mod db;
mod diagnostics;
mod error;
mod learning;
mod license;
mod material;
mod material_catalog;
mod material_install;
mod material_manifest;
mod pins;
mod preferences;
mod profile;
mod results;
mod review;
mod sync;
mod ui_state;
mod validation;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .register_uri_scheme_protocol("ifp-content", |ctx, request| {
      let state = ctx.app_handle().state::<material::MaterialState>();
      material::handle_request(&state.root, &request)
    })
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

      let material_root = data_dir.join("materials");
      std::fs::create_dir_all(&material_root)?;
      material::ensure_sample_material(&material_root).map_err(|error| {
        std::io::Error::other(format!("{}: {}", error.code, error.message))
      })?;
      app.manage(material::MaterialState { root: material_root });
      app.manage(material_install::MaterialKeyring::from_env());

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
      license::license_export_transfer_request,
      license::license_refresh,
      license::license_activate_online,
      backup::backup_export,
      backup::backup_inspect,
      backup::backup_restore,
      diagnostics::app_export_diagnostics,
      results::results_export_csv,
      profile::profile_list,
      profile::profile_create,
      profile::profile_get_active,
      profile::profile_set_active,
      profile::profile_rename,
      profile::profile_delete,
      profile::profile_avatar_set_data,
      profile::profile_avatar_preview,
      profile::profile_avatar_clear,
      profile::profile_avatar_get,
      review::review_list,
      review::review_record,
      review::review_export_csv,
      pins::pinned_list,
      pins::pinned_set,
      pins::pinned_material_list,
      pins::pinned_material_set,
      ui_state::ui_state_get,
      ui_state::ui_state_set,
      ui_state::ui_state_clear,
      material::material_open_sample,
      material_install::material_install_bundle,
      material_install::material_list_installed,
      material_install::material_open_installed,
      material_install::material_installed_cover,
      material_catalog::material_catalog_config_get,
      material_catalog::material_catalog_config_set,
      material_catalog::material_catalog_list,
      material_catalog::material_catalog_install,
      material_catalog::material_catalog_cover,
      preferences::preferences_get,
      preferences::preferences_set
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
