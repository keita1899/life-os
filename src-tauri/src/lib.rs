#[tauri::command]
fn fetch_ical(url: String) -> Result<String, String> {
    reqwest::blocking::get(&url)
        .map_err(|e| format!("Failed to fetch iCal: {}", e))?
        .text()
        .map_err(|e| format!("Failed to read response: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::new().build())
    .invoke_handler(tauri::generate_handler![fetch_ical])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
