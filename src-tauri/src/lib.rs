mod commands;
mod tray;

use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

use commands::paths::{
    ensure_user_data_dirs, read_app_settings, sqlite_db_url, user_data_paths, write_app_settings,
    SqliteUrl,
};
use commands::window::{hide_popup_window, show_main_window, show_popup_window};

fn sqlite_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_vocabulary",
            sql: include_str!("../migrations/001_vocabulary.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_learning_progress",
            sql: include_str!("../migrations/002_learning_progress.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_pet_state",
            sql: include_str!("../migrations/003_pet_state.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_study_sessions",
            sql: include_str!("../migrations/004_study_sessions.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_phrases",
            sql: include_str!("../migrations/005_phrases.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_pet_species",
            sql: include_str!("../migrations/006_pet_species.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_pet_evolution_stages",
            sql: include_str!("../migrations/007_pet_evolution_stages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "create_daily_missions",
            sql: include_str!("../migrations/008_daily_missions.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "create_user_progress",
            sql: include_str!("../migrations/009_user_progress.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "alter_pet_state_species_id",
            sql: include_str!("../migrations/010_pet_species_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "alter_pet_state_stage_id",
            sql: include_str!("../migrations/011_pet_stage_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "seed_vocabulary",
            sql: include_str!("../migrations/012_seed_vocabulary.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "seed_phrases",
            sql: include_str!("../migrations/013_seed_phrases.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 14,
            description: "seed_pet_species",
            sql: include_str!("../migrations/014_seed_species.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "seed_evolution_stages",
            sql: include_str!("../migrations/015_seed_stages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 16,
            description: "seed_user_progress",
            sql: include_str!("../migrations/016_seed_user_progress.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "vocab_phonetic",
            sql: include_str!("../migrations/017_vocab_phonetic.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "vocab_part_of_speech",
            sql: include_str!("../migrations/018_vocab_pos.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "vocab_image_key",
            sql: include_str!("../migrations/019_vocab_image_key.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "vocab_example_vi",
            sql: include_str!("../migrations/020_vocab_example_vi.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "replace_ngsl_with_toeic",
            sql: include_str!("../migrations/021_replace_ngsl_with_toeic.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 22,
            description: "seed_more_toeic",
            sql: include_str!("../migrations/022_seed_more_toeic.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 23,
            description: "vocab_word_unique",
            sql: include_str!("../migrations/023_vocab_word_unique.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 24,
            description: "seed_toeic_lexicon",
            sql: include_str!("../migrations/024_seed_toeic_lexicon.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let paths = ensure_user_data_dirs(&app.handle().clone())?;
            app.manage(SqliteUrl(paths.sqlite_url.clone()));
            app.handle().plugin(
                tauri_plugin_sql::Builder::new()
                    .add_migrations(&paths.sqlite_url, sqlite_migrations())
                    .build(),
            )?;
            tray::setup_tray(app)?;
            #[cfg(debug_assertions)]
            {
                let _ = show_main_window(app.handle().clone());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_main_window,
            show_popup_window,
            hide_popup_window,
            user_data_paths,
            sqlite_db_url,
            read_app_settings,
            write_app_settings
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
