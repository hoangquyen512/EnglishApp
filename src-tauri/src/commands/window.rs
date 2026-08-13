//! Native window helpers used by the system tray and the frontend scheduler.

use tauri::{AppHandle, Manager};

fn show_labeled_window(app: &AppHandle, label: &str) -> Result<(), String> {
    let window = app
        .get_webview_window(label)
        .ok_or_else(|| format!("{label} window not found"))?;
    window.unminimize().map_err(|err| err.to_string())?;
    window.show().map_err(|err| err.to_string())?;
    window.set_focus().map_err(|err| err.to_string())?;
    Ok(())
}

/// Shows and focuses the main dashboard window.
///
/// Input: none (uses the app handle injected by Tauri).
/// Output: `Ok(())` on success, or an error string if the window is missing.
#[tauri::command]
pub fn show_main_window(app: AppHandle) -> Result<(), String> {
    show_labeled_window(&app, "main")
}

/// Shows the always-on-top flashcard popup.
///
/// Input: none (uses the app handle injected by Tauri).
/// Output: `Ok(())` on success, or an error string if the window is missing.
#[tauri::command]
pub fn show_popup_window(app: AppHandle) -> Result<(), String> {
    show_labeled_window(&app, "popup")
}

/// Hides the flashcard popup without quitting the app.
///
/// Input: none (uses the app handle injected by Tauri).
/// Output: `Ok(())` on success, or an error string if the window is missing.
#[tauri::command]
pub fn hide_popup_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("popup")
        .ok_or_else(|| "popup window not found".to_string())?;
    window.hide().map_err(|err| err.to_string())?;
    Ok(())
}
