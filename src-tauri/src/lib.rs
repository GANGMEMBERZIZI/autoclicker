// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use enigo::{Button, Direction, Enigo, Mouse, Settings};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::State;
pub struct clickState {
    pub mode: String,
    pub interval: u64,
    pub is_running: bool,
}

#[tauri::command]
//获取前端数据
fn update_settings(mode: String, interval: u64, state: State<'_, Arc<Mutex<clickState>>>) {
    if let Ok(mut lock) = state.lock() {
        lock.mode = mode;
        lock.interval = interval;
    }
}
#[tauri::command]
//获取是否运行状态
fn toggle_clicking(is_running: bool, state: State<'_, Arc<Mutex<clickState>>>) {
    if let Ok(mut lock) = state.lock() {
        lock.is_running = is_running;
    }
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let clicker_state = Arc::new(Mutex::new(clickState {
        mode: "left".to_string(),
        interval: 100,
        is_running: false,
    }));
    let thread_state = Arc::clone(&clicker_state);
    thread::spawn(move || {
        let mut settings = Settings::default();
        settings.windows_dw_extra_info = Some(0);
        let mut enigo = Enigo::new(&settings).unwrap();
        loop {
            let mut should_click = false;
            let mut current_mode = String::new();
            let mut current_interval = 100;
            if let Ok(lock) = thread_state.lock() {
                should_click = lock.is_running;
                current_mode = lock.mode.clone();
                current_interval = lock.interval;
            }
            if should_click {
                if current_mode.trim() == "left" {
                    enigo.button(Button::Left, Direction::Click).unwrap();
                } else {
                    enigo.button(Button::Right, Direction::Click).unwrap();
                }
                thread::sleep(Duration::from_millis(current_interval));
            } else {
                thread::sleep(Duration::from_millis(20));
            }
        }
    });
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(clicker_state)
        .invoke_handler(tauri::generate_handler![update_settings, toggle_clicking])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
