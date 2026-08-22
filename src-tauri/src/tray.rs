//! System tray: Open app / Study now / Quick lookup / Quit.

use tauri::image::Image;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, Emitter};

use crate::commands::window::{show_main_window, show_popup_window};

/// Circular brand mark for the system tray (transparent outside the disc).
const TRAY_CIRCLE_PNG: &[u8] = include_bytes!("../icons/tray-circle-32.png");

pub fn setup_tray(app: &App) -> tauri::Result<()> {
    let app_label = MenuItem::with_id(app, "app_name", "Yume", false, None::<&str>)?;
    let open_item = MenuItem::with_id(app, "open", "Mở app", true, None::<&str>)?;
    let study_item = MenuItem::with_id(app, "study", "Học ngay", true, None::<&str>)?;
    let lookup_item = MenuItem::with_id(app, "quick_lookup", "Tra từ nhanh", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Thoát", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[&app_label, &open_item, &study_item, &lookup_item, &quit_item],
    )?;

    let icon = Image::from_bytes(TRAY_CIRCLE_PNG).expect("invalid tray circle icon");

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
            "quick_lookup" => {
                let _ = show_main_window(app.clone());
                let _ = app.emit("navigate-quick-lookup", ());
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
