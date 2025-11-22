// src-tauri/src/lib.rs
use tauri::{Builder, Manager};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // ใน Tauri V2 ต้องใช้ get_webview_window แทน get_window
                if let Some(main_window) = app.get_webview_window("main") {
                    main_window.open_devtools();
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
