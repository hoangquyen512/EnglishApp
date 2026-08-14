use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};

use crate::auth::mailer::{Mailer, SmtpMailer};
use crate::auth::service::{self, AuthRuntime, SessionDto};
use crate::commands::paths::{ensure_user_data_dirs, SqliteUrl};

pub struct AuthState(pub AuthRuntime);

pub fn init_auth_state(app: &AppHandle) -> Result<AuthState, String> {
    let paths = ensure_user_data_dirs(app)?;
    let sqlite_url = app.state::<SqliteUrl>().0.clone();
    let db_path = sqlite_url
        .strip_prefix("sqlite:")
        .unwrap_or(&sqlite_url)
        .to_string();
    Ok(AuthState(AuthRuntime {
        db_path: PathBuf::from(db_path),
        local_data_dir: PathBuf::from(paths.local_data_dir),
        lockout: Mutex::new(HashMap::new()),
    }))
}

fn map_err(err: String) -> String {
    err
}

#[tauri::command]
pub fn current_session(state: State<AuthState>) -> Result<Option<SessionDto>, String> {
    service::current_session(&state.0).map_err(map_err)
}

#[tauri::command]
pub fn has_accounts(state: State<AuthState>) -> Result<bool, String> {
    service::has_accounts(&state.0).map_err(map_err)
}

#[tauri::command]
pub fn register_account(
    state: State<AuthState>,
    username: String,
    password: String,
) -> Result<SessionDto, String> {
    service::register_account(&state.0, &username, &password).map_err(map_err)
}

#[tauri::command]
pub fn login_account(
    state: State<AuthState>,
    username: String,
    password: String,
) -> Result<SessionDto, String> {
    service::login_account(&state.0, &username, &password).map_err(map_err)
}

#[tauri::command]
pub fn logout_account(state: State<AuthState>) -> Result<(), String> {
    service::logout_account(&state.0).map_err(map_err)
}

#[tauri::command]
pub fn change_password(
    state: State<AuthState>,
    current_password: String,
    new_password: String,
) -> Result<(), String> {
    service::change_password(&state.0, &current_password, &new_password).map_err(map_err)
}

#[tauri::command]
pub fn request_password_reset(
    state: State<AuthState>,
    username: String,
    email: String,
) -> Result<serde_json::Value, String> {
    let mailer = SmtpMailer;
    service::request_password_reset(&state.0, &mailer as &dyn Mailer, &username, &email)
        .map_err(map_err)?;
    Ok(serde_json::json!({ "ok": true }))
}

#[tauri::command]
pub fn confirm_password_reset(
    state: State<AuthState>,
    username: String,
    default_password: String,
    new_password: String,
) -> Result<SessionDto, String> {
    service::confirm_password_reset(&state.0, &username, &default_password, &new_password)
        .map_err(map_err)
}

#[tauri::command]
pub fn update_account_profile(
    state: State<AuthState>,
    display_name: String,
    email: String,
) -> Result<SessionDto, String> {
    service::update_account_profile(&state.0, &display_name, &email).map_err(map_err)
}

#[tauri::command]
pub fn set_account_avatar(state: State<AuthState>, source_path: String) -> Result<SessionDto, String> {
    service::set_account_avatar_path(&state.0, &source_path).map_err(map_err)
}

#[tauri::command]
pub fn set_account_avatar_bytes(
    state: State<AuthState>,
    bytes: Vec<u8>,
) -> Result<SessionDto, String> {
    service::set_account_avatar_bytes(&state.0, &bytes).map_err(map_err)
}

#[tauri::command]
pub fn clear_account_avatar(state: State<AuthState>) -> Result<SessionDto, String> {
    service::clear_account_avatar(&state.0).map_err(map_err)
}

#[tauri::command]
pub fn delete_account(state: State<AuthState>, password: String) -> Result<(), String> {
    service::delete_account(&state.0, &password).map_err(map_err)
}
