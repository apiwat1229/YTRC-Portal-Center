// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri::Builder;

// ===== Commands =====
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        // Updater plugin (auto-update)
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Process plugin (ใช้ relaunch app หลังอัปเดต)
        .plugin(tauri_plugin_process::init())
        // Opener plugin (ที่คุณใช้อยู่)
        .plugin(tauri_plugin_opener::init())
        // ส่งคำสั่ง Rust ให้ FE เรียกได้
        .invoke_handler(tauri::generate_handler![greet])
        // run app
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
