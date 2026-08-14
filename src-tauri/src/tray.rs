//! System tray: Open app / Study now / Quit.

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::App;

use crate::commands::window::{show_main_window, show_popup_window};

pub fn setup_tray(app: &App) -> tauri::Result<()> {
    let app_label = MenuItem::with_id(app, "app_name", "Yume", false, None::<&str>)?;
    let open_item = MenuItem::with_id(app, "open", "Mở app", true, None::<&str>)?;
    let study_item = MenuItem::with_id(app, "study", "Học ngay", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Thoát", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&app_label, &open_item, &study_item, &quit_item])?;

    let icon = app
        .default_window_icon()
        .cloned()
        .expect("missing default window icon");

    TrayIconBuilder::new()
        .icon(icon)
        .tooltip("Yume")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main_window(app.clone());
            }
            "study" => {
                let _ = show_popup_window(app.clone());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                let _ = show_main_window(app.clone());
            }
        })
        .build(app)?;

    Ok(())
}
