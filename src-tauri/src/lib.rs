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
        Migration {
            version: 25,
            description: "seed_toeic_lexicon_1000",
            sql: include_str!("../migrations/025_seed_toeic_lexicon_1000.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 26,
            description: "create_accounts",
            sql: include_str!("../migrations/026_accounts.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 27,
            description: "create_app_session",
            sql: include_str!("../migrations/027_app_session.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 28,
            description: "pet_state_user_id",
            sql: include_str!("../migrations/028_pet_state_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 29,
            description: "user_progress_user_id",
            sql: include_str!("../migrations/029_user_progress_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 30,
            description: "learning_progress_user_id",
            sql: include_str!("../migrations/030_learning_progress_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 31,
            description: "study_sessions_user_id",
            sql: include_str!("../migrations/031_study_sessions_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 32,
            description: "daily_missions_user_id",
            sql: include_str!("../migrations/032_daily_missions_user_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 33,
            description: "idx_pet_state_user",
            sql: include_str!("../migrations/033_pet_state_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 34,
            description: "idx_user_progress_user",
            sql: include_str!("../migrations/034_user_progress_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 35,
            description: "idx_learning_progress_user",
            sql: include_str!("../migrations/035_learning_progress_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 36,
            description: "idx_study_sessions_user",
            sql: include_str!("../migrations/036_study_sessions_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 37,
            description: "idx_daily_missions_user",
            sql: include_str!("../migrations/037_daily_missions_user_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 38,
            description: "idx_accounts_email",
            sql: include_str!("../migrations/038_accounts_email_idx.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 39,
            description: "companion_messages",
            sql: include_str!("../migrations/039_companion_messages.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 40,
            description: "companion_state",
            sql: include_str!("../migrations/040_companion_state.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 41,
            description: "create_topics",
            sql: include_str!("../migrations/041_create_topics.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 42,
            description: "seed_topics",
            sql: include_str!("../migrations/042_seed_topics.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 43,
            description: "create_learning_program",
            sql: include_str!("../migrations/043_create_learning_program.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 44,
            description: "create_learning_program_topics",
            sql: include_str!("../migrations/044_create_learning_program_topics.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 45,
            description: "create_topic_conversation_banks",
            sql: include_str!("../migrations/045_create_topic_conversation_banks.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 46,
            description: "seed_topic_conversation_banks",
            sql: include_str!("../migrations/046_seed_topic_conversation_banks.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 47,
            description: "vocabulary_topic_id",
            sql: include_str!("../migrations/047_vocabulary_topic_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 48,
            description: "phrases_topic_id",
            sql: include_str!("../migrations/048_phrases_topic_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 49,
            description: "backfill_phrases_travel",
            sql: include_str!("../migrations/049_backfill_phrases_travel.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 50,
            description: "backfill_phrases_food",
            sql: include_str!("../migrations/050_backfill_phrases_food.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 51,
            description: "backfill_phrases_office",
            sql: include_str!("../migrations/051_backfill_phrases_office.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 52,
            description: "backfill_phrases_family",
            sql: include_str!("../migrations/052_backfill_phrases_family.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 53,
            description: "missions_topic_id",
            sql: include_str!("../migrations/053_missions_topic_id.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 54,
            description: "seed_vocab_family",
            sql: include_str!("../migrations/054_seed_vocab_family.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 55,
            description: "seed_vocab_food",
            sql: include_str!("../migrations/055_seed_vocab_food.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 56,
            description: "seed_vocab_office",
            sql: include_str!("../migrations/056_seed_vocab_office.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 57,
            description: "seed_vocab_travel",
            sql: include_str!("../migrations/057_seed_vocab_travel.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 58,
            description: "seed_learning_program_accounts",
            sql: include_str!("../migrations/058_seed_learning_program_accounts.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 59,
            description: "seed_learning_program_topics",
            sql: include_str!("../migrations/059_seed_learning_program_topics.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 60,
            description: "content_import_state",
            sql: include_str!("../migrations/060_content_import_state.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 61,
            description: "phrases_en_topic_unique",
            sql: include_str!("../migrations/061_phrases_en_topic_unique.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 62,
            description: "clear_topic_conversation_banks",
            sql: include_str!("../migrations/062_clear_topic_conversation_banks.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 63,
            description: "seed_topic_banks_one_to_one",
            sql: include_str!("../migrations/063_seed_topic_banks_one_to_one.sql"),
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
            // Release builds also start with the main window visible. Windows are
            // created with visible:false so the tray can own lifecycle; without
            // this call a packaged app looks like it "won't start".
            let _ = show_main_window(app.handle().clone());
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
