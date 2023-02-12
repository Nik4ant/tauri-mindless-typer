#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


#[tauri::command]
fn save_to_disk(content: &str) {
    format!("Content from JS to Rust:\n{}", content);
}

fn main() {
    // TODO: customize menu in the future to make it fit with color theme
    // FIXME: change comment highliter plugin settings to work with different case and spaces before ':'
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_to_disk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
