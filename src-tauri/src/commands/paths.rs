//! User-scoped data paths. SQLite and settings never live next to the .exe / .app.

use std::fs;
use std::path::Path;

use serde::Serialize;
use tauri::{AppHandle, Manager, State};

pub const SQLITE_FILENAME: &str = "vocab_pet.db";
pub const SETTINGS_FILENAME: &str = "settings.json";

#[derive(Clone)]
pub struct SqliteUrl(pub String);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserDataPaths {
    pub local_data_dir: String,
    pub app_data_dir: String,
    pub config_dir: String,
    pub sqlite_url: String,
    pub settings_path: String,
}

fn sqlite_url_from(local_data_dir: &Path) -> String {
    format!("sqlite:{}", local_data_dir.join(SQLITE_FILENAME).display())
}

/// Creates `{appLocalDataDir}`, `{appDataDir}`, and `{appConfigDir}` if needed.
pub fn ensure_user_data_dirs(app: &AppHandle) -> Result<UserDataPaths, String> {
    let local_data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|err| err.to_string())?;
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;
    let config_dir = app.path().app_config_dir().map_err(|err| err.to_string())?;

    fs::create_dir_all(&local_data_dir).map_err(|err| err.to_string())?;
    fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;
    fs::create_dir_all(&config_dir).map_err(|err| err.to_string())?;

    Ok(UserDataPaths {
        sqlite_url: sqlite_url_from(&local_data_dir),
        settings_path: app_data_dir.join(SETTINGS_FILENAME).display().to_string(),
        local_data_dir: local_data_dir.display().to_string(),
        app_data_dir: app_data_dir.display().to_string(),
        config_dir: config_dir.display().to_string(),
    })
}

/// Returns user-scoped directories and the SQLite URL (same string used for migrations).
///
/// Input: none (uses the app handle / path API).
/// Output: `{ localDataDir, appDataDir, configDir, sqliteUrl, settingsPath }`.
#[tauri::command]
pub fn user_data_paths(app: AppHandle) -> Result<UserDataPaths, String> {
    ensure_user_data_dirs(&app)
}

/// Returns the `sqlite:` URL under `appLocalDataDir`.
///
/// Input: none (reads the URL registered at startup).
/// Output: connection string, e.g. `sqlite:/Users/…/vocab_pet.db`.
#[tauri::command]
pub fn sqlite_db_url(url: State<SqliteUrl>) -> String {
    url.0.clone()
}

/// Reads `{appDataDir}/settings.json`.
///
/// Input: none.
/// Output: file contents, or `"{}"` when the file does not exist yet.
#[tauri::command]
pub fn read_app_settings(app: AppHandle) -> Result<String, String> {
    let paths = ensure_user_data_dirs(&app)?;
    match fs::read_to_string(&paths.settings_path) {
        Ok(contents) => Ok(contents),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok("{}".into()),
        Err(err) => Err(err.to_string()),
    }
}

/// Writes `{appDataDir}/settings.json`.
///
/// Input: `contents` — JSON object as a string.
/// Output: `Ok(())` after a successful write.
#[tauri::command]
pub fn write_app_settings(app: AppHandle, contents: String) -> Result<(), String> {
    let paths = ensure_user_data_dirs(&app)?;
    fs::write(&paths.settings_path, contents).map_err(|err| err.to_string())
}
