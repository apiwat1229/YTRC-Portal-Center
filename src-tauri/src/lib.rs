// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

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
                if let Some(main_window) = app.get_window("main") {
                    // เปิด DevTools อัตโนมัติในโหมด dev
                    main_window.open_devtools();
                    // ปิดทันทีถ้าไม่อยากให้ค้างไว้ก็ได้ (คอมเมนต์บรรทัดนี้ถ้าอยากให้เปิดอยู่)
                    // main_window.close_devtools();
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
