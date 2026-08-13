use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, Runtime,
};

/// Shows and focuses the flashcard popup window.
pub fn show_popup<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(popup) = app.get_webview_window("popup") {
        let _ = popup.show();
        let _ = popup.set_focus();
        let _ = popup.center();
    }
}

/// Creates the system tray icon with Open / Study Now / Quit menu items.
pub fn setup_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let open_item = MenuItem::with_id(app, "open", "Open App", true, None::<&str>)?;
    let study_item = MenuItem::with_id(app, "study", "Study Now", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&open_item, &study_item, &quit_item])?;

    let mut builder = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Vocab Pet");

    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }

    builder
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            }
            "study" => show_popup(app),
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}
