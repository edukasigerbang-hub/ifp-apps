mod db;
mod error;
mod learning;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
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
      let connection = db::open(&data_dir.join("ifp.db"))?;
      app.manage(db::DbState(std::sync::Mutex::new(connection)));

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      learning::learning_ensure_profile,
      learning::learning_start_session,
      learning::learning_save_attempt,
      learning::learning_get_summary
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
