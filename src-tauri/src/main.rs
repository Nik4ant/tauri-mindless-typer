#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Forget about .NET MAUI use rust", name)
}

fn main() {
    // TODO: customize menu in the future to make it fit with color theme
    // FIXME: change comment highliter plugin settings to work with different case and spaces before ':'
    // TODO 2: Icon with greek letter
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
