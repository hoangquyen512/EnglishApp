mod commands;
mod tray;

use tauri_plugin_sql::{Migration, MigrationKind};

const DB_URL: &str = "sqlite:vocab_pet.db";

fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "initial_schema_and_seed",
        sql: include_str!("../migrations/001_initial.sql"),
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tray::setup_tray(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
