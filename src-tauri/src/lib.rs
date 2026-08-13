mod auth;
mod commands;
mod tray;

use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

use commands::auth::{
    change_password, clear_account_avatar, confirm_password_reset, current_session, delete_account,
    has_accounts, init_auth_state, login_account, logout_account, register_account,
    request_password_reset, set_account_avatar, set_account_avatar_bytes, update_account_profile,
};
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
            description: "create_accounts",
            sql: include_str!("../migrations/017_accounts.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "create_app_session",
            sql: include_str!("../migrations/018_app_session.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "pet_state_user_id",
            sql: include_str!("../migrations/019_pet_state_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "user_progress_user_id",
            sql: include_str!("../migrations/020_user_progress_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "learning_progress_user_id",
            sql: include_str!("../migrations/021_learning_progress_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 22,
            description: "study_sessions_user_id",
            sql: include_str!("../migrations/022_study_sessions_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 23,
            description: "daily_missions_user_id",
            sql: include_str!("../migrations/023_daily_missions_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 24,
            description: "idx_pet_state_user",
            sql: include_str!("../migrations/024_pet_state_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 25,
            description: "idx_user_progress_user",
            sql: include_str!("../migrations/025_user_progress_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 26,
            description: "idx_learning_progress_user",
            sql: include_str!("../migrations/026_learning_progress_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 27,
            description: "idx_study_sessions_user",
            sql: include_str!("../migrations/027_study_sessions_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 28,
            description: "idx_daily_missions_user",
            sql: include_str!("../migrations/028_daily_missions_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 29,
            description: "idx_accounts_email",
            sql: include_str!("../migrations/029_accounts_email_idx.sql"),
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
            let auth_state = init_auth_state(&app.handle())?;
            app.manage(auth_state);
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
            write_app_settings,
            current_session,
            has_accounts,
            register_account,
            login_account,
            logout_account,
            change_password,
            request_password_reset,
            confirm_password_reset,
            update_account_profile,
            set_account_avatar,
            set_account_avatar_bytes,
            clear_account_avatar,
            delete_account
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
