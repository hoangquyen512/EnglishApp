use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use argon2::password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use argon2::{Argon2, ParamsBuilder};
use rand::Rng;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;

use super::mailer::Mailer;

const RESERVED: &[&str] = &["admin", "root", "system", "guest"];
const DEFAULT_PW_CHARS: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDto {
    pub user_id: i64,
    pub username: String,
    pub email: Option<String>,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
}

pub struct AuthRuntime {
    pub db_path: PathBuf,
    pub local_data_dir: PathBuf,
    pub lockout: Mutex<HashMap<String, Lockout>>,
}

pub struct Lockout {
    pub failures: u32,
    pub until: Option<Instant>,
}

fn open(path: &Path) -> Result<Connection, String> {
    let conn = Connection::open(path).map_err(|err| err.to_string())?;
    conn.busy_timeout(Duration::from_secs(5))
        .map_err(|err| err.to_string())?;
    conn.pragma_update(None, "foreign_keys", "ON")
        .map_err(|err| err.to_string())?;
    Ok(conn)
}

fn argon() -> Argon2<'static> {
    let params = if cfg!(test) {
        ParamsBuilder::new()
            .m_cost(8 * 1024)
            .t_cost(1)
            .p_cost(1)
            .build()
            .expect("argon params")
    } else {
        ParamsBuilder::new()
            .m_cost(19 * 1024)
            .t_cost(2)
            .p_cost(1)
            .build()
            .expect("argon params")
    };
    Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params)
}

fn hash_secret(secret: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut rand::thread_rng());
    argon()
        .hash_password(secret.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|err| err.to_string())
}

fn verify_secret(secret: &str, hash: &str) -> bool {
    let parsed = match PasswordHash::new(hash) {
        Ok(value) => value,
        Err(_) => return false,
    };
    argon().verify_password(secret.as_bytes(), &parsed).is_ok()
}

fn normalize_username(raw: &str) -> String {
    raw.trim().to_string()
}

fn normalize_email(raw: &str) -> Option<String> {
    let trimmed = raw.trim().to_lowercase();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
}

fn normalize_display_name(raw: &str) -> Option<String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn validate_username(raw: &str) -> Result<String, String> {
    let username = normalize_username(raw);
    let ok = username.len() >= 3
        && username.len() <= 24
        && username
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '_' || ch == '.');
    if !ok {
        return Err("invalid_username".into());
    }
    if RESERVED.iter().any(|item| item.eq_ignore_ascii_case(&username)) {
        return Err("reserved_username".into());
    }
    Ok(username)
}

fn validate_password(raw: &str, username: &str) -> Result<(), String> {
    if raw.len() < 8 || raw.len() > 128 {
        return Err("invalid_password".into());
    }
    if raw.eq_ignore_ascii_case(username) {
        return Err("password_matches_username".into());
    }
    Ok(())
}

fn validate_email_value(raw: &str) -> Result<Option<String>, String> {
    let Some(email) = normalize_email(raw) else {
        return Ok(None);
    };
    if email.len() > 254 || !email.contains('@') || !email.rsplit('@').next().unwrap_or("").contains('.') {
        return Err("invalid_email".into());
    }
    if email.chars().any(char::is_whitespace) {
        return Err("invalid_email".into());
    }
    Ok(Some(email))
}

fn validate_display_name(raw: &str) -> Result<Option<String>, String> {
    let Some(name) = normalize_display_name(raw) else {
        return Ok(None);
    };
    if name.len() > 40 || name.chars().any(|ch| ch.is_control()) {
        return Err("invalid_display_name".into());
    }
    Ok(Some(name))
}

fn generate_default_password() -> String {
    let mut rng = rand::thread_rng();
    (0..8)
        .map(|_| {
            let idx = rng.gen_range(0..DEFAULT_PW_CHARS.len());
            DEFAULT_PW_CHARS[idx] as char
        })
        .collect()
}

fn check_lockout(runtime: &AuthRuntime, username: &str) -> Result<(), String> {
    let key = username.to_lowercase();
    let map = runtime.lockout.lock().map_err(|err| err.to_string())?;
    if let Some(row) = map.get(&key) {
        if let Some(until) = row.until {
            if Instant::now() < until {
                return Err("lockout".into());
            }
        }
    }
    Ok(())
}

fn note_failure(runtime: &AuthRuntime, username: &str) {
    let key = username.to_lowercase();
    if let Ok(mut map) = runtime.lockout.lock() {
        let row = map.entry(key).or_insert(Lockout {
            failures: 0,
            until: None,
        });
        if row.until.is_some() && Instant::now() >= row.until.unwrap() {
            row.until = None;
            row.failures = 0;
        }
        row.failures += 1;
        if row.failures >= 5 {
            row.until = Some(Instant::now() + Duration::from_secs(30));
            row.failures = 0;
        }
    }
}

fn clear_failures(runtime: &AuthRuntime, username: &str) {
    if let Ok(mut map) = runtime.lockout.lock() {
        map.remove(&username.to_lowercase());
    }
}

fn avatar_url(local_data_dir: &Path, file: &Option<String>) -> Option<String> {
    file.as_ref().map(|name| {
        local_data_dir
            .join("avatars")
            .join(name)
            .display()
            .to_string()
    })
}

fn row_to_session(
    conn: &Connection,
    local_data_dir: &Path,
    user_id: i64,
) -> Result<SessionDto, String> {
    conn.query_row(
        "SELECT username, email, display_name, avatar_file FROM accounts WHERE id = ?1",
        params![user_id],
        |row| {
            let file: Option<String> = row.get(3)?;
            Ok(SessionDto {
                user_id,
                username: row.get(0)?,
                email: row.get(1)?,
                display_name: row.get(2)?,
                avatar_url: avatar_url(local_data_dir, &file),
            })
        },
    )
    .map_err(|err| err.to_string())
}

fn set_session(conn: &Connection, user_id: i64) -> Result<(), String> {
    conn.execute("DELETE FROM app_session", [])
        .map_err(|err| err.to_string())?;
    conn.execute(
        "INSERT INTO app_session (id, user_id) VALUES (1, ?1)",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

fn current_user_id(conn: &Connection) -> Result<Option<i64>, String> {
    conn.query_row("SELECT user_id FROM app_session WHERE id = 1", [], |row| {
        row.get(0)
    })
    .optional()
    .map_err(|err| err.to_string())
}

fn require_user_id(conn: &Connection) -> Result<i64, String> {
    current_user_id(conn)?.ok_or_else(|| "not_logged_in".to_string())
}

fn claim_orphans(conn: &Connection, user_id: i64) -> Result<(), String> {
    conn.execute(
        "UPDATE pet_state SET user_id = ?1 WHERE user_id IS NULL AND id = (SELECT MIN(id) FROM pet_state WHERE user_id IS NULL)",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE user_progress SET user_id = ?1 WHERE user_id IS NULL AND id = (SELECT MIN(id) FROM user_progress WHERE user_id IS NULL)",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE learning_progress SET user_id = ?1 WHERE user_id IS NULL",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE study_sessions SET user_id = ?1 WHERE user_id IS NULL",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE daily_missions SET user_id = ?1 WHERE user_id IS NULL",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

fn ensure_user_progress(conn: &Connection, user_id: i64) -> Result<(), String> {
    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;
    if exists == 0 {
        conn.execute(
            "INSERT INTO user_progress (total_words_learned, total_phrases_learned, current_streak, longest_streak, progress_by_topic, user_id)
             VALUES (0, 0, 0, 0, '{}', ?1)",
            params![user_id],
        )
        .map_err(|err| err.to_string())?;
    }
    Ok(())
}

pub fn current_session(runtime: &AuthRuntime) -> Result<Option<SessionDto>, String> {
    let conn = open(&runtime.db_path)?;
    let Some(user_id) = current_user_id(&conn)? else {
        return Ok(None);
    };
    match row_to_session(&conn, &runtime.local_data_dir, user_id) {
        Ok(session) => Ok(Some(session)),
        Err(_) => Ok(None),
    }
}

pub fn has_accounts(runtime: &AuthRuntime) -> Result<bool, String> {
    let conn = open(&runtime.db_path)?;
    match conn.query_row("SELECT COUNT(*) FROM accounts", [], |row| row.get::<_, i64>(0)) {
        Ok(count) => Ok(count > 0),
        Err(err) => {
            let message = err.to_string();
            if message.contains("no such table") {
                Ok(false)
            } else {
                Err(message)
            }
        }
    }
}

pub fn register_account(
    runtime: &AuthRuntime,
    username: &str,
    password: &str,
) -> Result<SessionDto, String> {
    let username = validate_username(username)?;
    validate_password(password, &username)?;
    let conn = open(&runtime.db_path)?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM accounts", [], |row| row.get(0))
        .map_err(|err| err.to_string())?;
    let hash = hash_secret(password)?;
    conn.execute(
        "INSERT INTO accounts (username, password_hash) VALUES (?1, ?2)",
        params![username, hash],
    )
    .map_err(|err| {
        if err.to_string().contains("UNIQUE") {
            "username_taken".into()
        } else {
            err.to_string()
        }
    })?;
    let user_id = conn.last_insert_rowid();
    if count == 0 {
        claim_orphans(&conn, user_id)?;
    }
    ensure_user_progress(&conn, user_id)?;
    set_session(&conn, user_id)?;
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

pub fn login_account(
    runtime: &AuthRuntime,
    username: &str,
    password: &str,
) -> Result<SessionDto, String> {
    check_lockout(runtime, username)?;
    let conn = open(&runtime.db_path)?;
    let row = conn
        .query_row(
            "SELECT id, password_hash FROM accounts WHERE username = ?1 COLLATE NOCASE",
            params![username.trim()],
            |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?)),
        )
        .optional()
        .map_err(|err| err.to_string())?;
    let Some((user_id, hash)) = row else {
        note_failure(runtime, username);
        return Err("auth_failed".into());
    };
    if !verify_secret(password, &hash) {
        note_failure(runtime, username);
        return Err("auth_failed".into());
    }
    clear_failures(runtime, username);
    set_session(&conn, user_id)?;
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

pub fn logout_account(runtime: &AuthRuntime) -> Result<(), String> {
    let conn = open(&runtime.db_path)?;
    conn.execute("DELETE FROM app_session", [])
        .map_err(|err| err.to_string())?;
    Ok(())
}

pub fn change_password(
    runtime: &AuthRuntime,
    current_password: &str,
    new_password: &str,
) -> Result<(), String> {
    let conn = open(&runtime.db_path)?;
    let user_id = require_user_id(&conn)?;
    let (username, hash): (String, String) = conn
        .query_row(
            "SELECT username, password_hash FROM accounts WHERE id = ?1",
            params![user_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|err| err.to_string())?;
    if !verify_secret(current_password, &hash) {
        return Err("auth_failed".into());
    }
    validate_password(new_password, &username)?;
    let next = hash_secret(new_password)?;
    conn.execute(
        "UPDATE accounts SET password_hash = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![next, user_id],
    )
    .map_err(|err| err.to_string())?;
    Ok(())
}

pub fn request_password_reset(
    runtime: &AuthRuntime,
    mailer: &dyn Mailer,
    username: &str,
    email: &str,
) -> Result<(), String> {
    let email = validate_email_value(email)?.ok_or_else(|| "reset_failed".to_string())?;
    let conn = open(&runtime.db_path)?;
    let row = conn
        .query_row(
            "SELECT id, email, password_hash FROM accounts WHERE username = ?1 COLLATE NOCASE",
            params![username.trim()],
            |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, Option<String>>(1)?,
                    r.get::<_, String>(2)?,
                ))
            },
        )
        .optional()
        .map_err(|err| err.to_string())?;
    let Some((user_id, stored_email, old_hash)) = row else {
        let _ = hash_secret("dummy-timing");
        return Err("reset_failed".into());
    };
    if let Some(existing) = stored_email {
        if existing != email {
            return Err("reset_failed".into());
        }
    }
    let default_password = generate_default_password();
    mailer.send_default_password(&email, username.trim(), &default_password)?;
    let hash = hash_secret(&default_password)?;
    conn.execute(
        "UPDATE accounts SET password_hash = ?1, email = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
        params![hash, email, user_id],
    )
    .map_err(|err| {
        let _ = conn.execute(
            "UPDATE accounts SET password_hash = ?1 WHERE id = ?2",
            params![old_hash, user_id],
        );
        err.to_string()
    })?;
    Ok(())
}

pub fn confirm_password_reset(
    runtime: &AuthRuntime,
    username: &str,
    default_password: &str,
    new_password: &str,
) -> Result<SessionDto, String> {
    check_lockout(runtime, username)?;
    let conn = open(&runtime.db_path)?;
    let row = conn
        .query_row(
            "SELECT id, username, password_hash FROM accounts WHERE username = ?1 COLLATE NOCASE",
            params![username.trim()],
            |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?)),
        )
        .optional()
        .map_err(|err| err.to_string())?;
    let Some((user_id, stored_username, hash)) = row else {
        note_failure(runtime, username);
        return Err("default_password_wrong".into());
    };
    if !verify_secret(default_password, &hash) {
        note_failure(runtime, username);
        return Err("default_password_wrong".into());
    }
    if new_password == default_password {
        return Err("password_same_as_default".into());
    }
    validate_password(new_password, &stored_username)?;
    let next = hash_secret(new_password)?;
    conn.execute(
        "UPDATE accounts SET password_hash = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![next, user_id],
    )
    .map_err(|err| err.to_string())?;
    clear_failures(runtime, username);
    set_session(&conn, user_id)?;
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

pub fn update_account_profile(
    runtime: &AuthRuntime,
    display_name: &str,
    email: &str,
) -> Result<SessionDto, String> {
    let conn = open(&runtime.db_path)?;
    let user_id = require_user_id(&conn)?;
    let display_name = validate_display_name(display_name)?;
    let email = validate_email_value(email)?;
    conn.execute(
        "UPDATE accounts SET display_name = ?1, email = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
        params![display_name, email, user_id],
    )
    .map_err(|err| err.to_string())?;
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

pub fn delete_account(runtime: &AuthRuntime, password: &str) -> Result<(), String> {
    let conn = open(&runtime.db_path)?;
    let user_id = require_user_id(&conn)?;
    let hash: String = conn
        .query_row(
            "SELECT password_hash FROM accounts WHERE id = ?1",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;
    if !verify_secret(password, &hash) {
        return Err("auth_failed".into());
    }
    let file: Option<String> = conn
        .query_row(
            "SELECT avatar_file FROM accounts WHERE id = ?1",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;
    conn.execute("DELETE FROM accounts WHERE id = ?1", params![user_id])
        .map_err(|err| err.to_string())?;
    if let Some(name) = file {
        let path = runtime.local_data_dir.join("avatars").join(name);
        let _ = std::fs::remove_file(path);
    }
    Ok(())
}

fn detect_ext(bytes: &[u8]) -> Result<&'static str, String> {
    if bytes.len() >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF {
        return Ok("jpg");
    }
    if bytes.len() >= 8 && bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        return Ok("png");
    }
    if bytes.len() >= 12 && &bytes[0..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Ok("webp");
    }
    Err("invalid_avatar".into())
}

pub fn set_account_avatar_bytes(
    runtime: &AuthRuntime,
    bytes: &[u8],
) -> Result<SessionDto, String> {
    if bytes.len() > 2 * 1024 * 1024 {
        return Err("avatar_too_large".into());
    }
    let ext = detect_ext(bytes)?;
    let conn = open(&runtime.db_path)?;
    let user_id = require_user_id(&conn)?;
    let dir = runtime.local_data_dir.join("avatars");
    std::fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    let name = format!("{user_id}.{ext}");
    std::fs::write(dir.join(&name), bytes).map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE accounts SET avatar_file = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![name, user_id],
    )
    .map_err(|err| err.to_string())?;
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

pub fn set_account_avatar_path(runtime: &AuthRuntime, source_path: &str) -> Result<SessionDto, String> {
    let bytes = std::fs::read(source_path).map_err(|_| "invalid_avatar".to_string())?;
    set_account_avatar_bytes(runtime, &bytes)
}

pub fn clear_account_avatar(runtime: &AuthRuntime) -> Result<SessionDto, String> {
    let conn = open(&runtime.db_path)?;
    let user_id = require_user_id(&conn)?;
    let file: Option<String> = conn
        .query_row(
            "SELECT avatar_file FROM accounts WHERE id = ?1",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|err| err.to_string())?;
    conn.execute(
        "UPDATE accounts SET avatar_file = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
        params![user_id],
    )
    .map_err(|err| err.to_string())?;
    if let Some(name) = file {
        let _ = std::fs::remove_file(runtime.local_data_dir.join("avatars").join(name));
    }
    row_to_session(&conn, &runtime.local_data_dir, user_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::mailer::RecordingMailer;
    use rusqlite::Connection;

    fn setup() -> (AuthRuntime, Connection, PathBuf) {
        let dir = std::env::temp_dir().join(format!("yume-auth-{}", rand::random::<u64>()));
        std::fs::create_dir_all(&dir).unwrap();
        let db_path = dir.join("test.db");
        let conn = Connection::open(&db_path).unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE accounts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL COLLATE NOCASE UNIQUE,
              password_hash TEXT NOT NULL,
              email TEXT COLLATE NOCASE,
              display_name TEXT,
              avatar_file TEXT,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE app_session (
              id INTEGER PRIMARY KEY CHECK (id = 1),
              user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
              logged_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE pet_state (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER);
            CREATE TABLE user_progress (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              total_words_learned INTEGER DEFAULT 0,
              total_phrases_learned INTEGER DEFAULT 0,
              current_streak INTEGER DEFAULT 0,
              longest_streak INTEGER DEFAULT 0,
              progress_by_topic TEXT,
              user_id INTEGER
            );
            CREATE TABLE learning_progress (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER);
            CREATE TABLE study_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER);
            CREATE TABLE daily_missions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER);
            INSERT INTO user_progress (total_words_learned, progress_by_topic) VALUES (0, '{}');
            "#,
        )
        .unwrap();
        drop(conn);
        let runtime = AuthRuntime {
            db_path: db_path.clone(),
            local_data_dir: dir.clone(),
            lockout: Mutex::new(HashMap::new()),
        };
        (runtime, Connection::open(&db_path).unwrap(), dir)
    }

    #[test]
    fn register_is_unique_nocase_and_claims_progress() {
        let (runtime, conn, _) = setup();
        let session = register_account(&runtime, "Minh", "password1").unwrap();
        assert_eq!(session.username, "Minh");
        assert!(session.email.is_none());
        let claimed: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM user_progress WHERE user_id = ?1",
                params![session.user_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(claimed, 1);
        let err = register_account(&runtime, "minh", "password2").unwrap_err();
        assert_eq!(err, "username_taken");
    }

    #[test]
    fn login_wrong_password_is_generic() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        logout_account(&runtime).unwrap();
        assert_eq!(
            login_account(&runtime, "minh.anh", "nope!!!!").unwrap_err(),
            "auth_failed"
        );
        assert_eq!(
            login_account(&runtime, "ghost", "password1").unwrap_err(),
            "auth_failed"
        );
    }

    #[test]
    fn reset_saves_email_and_requires_same_address() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        logout_account(&runtime).unwrap();
        let mailer = RecordingMailer::new();
        request_password_reset(&runtime, &mailer, "minh.anh", "minh@example.com").unwrap();
        assert_eq!(mailer.sent.lock().unwrap().len(), 1);
        let sent_pw = mailer.sent.lock().unwrap()[0].2.clone();
        assert_eq!(
            request_password_reset(&runtime, &mailer, "minh.anh", "other@example.com").unwrap_err(),
            "reset_failed"
        );
        confirm_password_reset(&runtime, "minh.anh", &sent_pw, "newpass12").unwrap();
        login_account(&runtime, "minh.anh", "newpass12").unwrap();
    }

    #[test]
    fn mail_failure_does_not_change_password() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        logout_account(&runtime).unwrap();
        let mailer = RecordingMailer {
            sent: Mutex::new(Vec::new()),
            fail: true,
        };
        assert_eq!(
            request_password_reset(&runtime, &mailer, "minh.anh", "minh@example.com").unwrap_err(),
            "mail_send_failed"
        );
        login_account(&runtime, "minh.anh", "password1").unwrap();
    }

    #[test]
    fn second_user_gets_own_progress_row() {
        let (runtime, conn, _) = setup();
        let first = register_account(&runtime, "one", "password1").unwrap();
        logout_account(&runtime).unwrap();
        let second = register_account(&runtime, "two", "password1").unwrap();
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM user_progress", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count, 2);
        assert_ne!(first.user_id, second.user_id);
    }

    #[test]
    fn profile_update_normalizes_email() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        let session = update_account_profile(&runtime, "Minh Anh", "  A@X.VN ").unwrap();
        assert_eq!(session.display_name.as_deref(), Some("Minh Anh"));
        assert_eq!(session.email.as_deref(), Some("a@x.vn"));
    }

    #[test]
    fn logout_clears_session() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        assert!(current_session(&runtime).unwrap().is_some());
        logout_account(&runtime).unwrap();
        assert!(current_session(&runtime).unwrap().is_none());
    }

    #[test]
    fn reserved_username_is_rejected() {
        let (runtime, _, _) = setup();
        assert_eq!(
            register_account(&runtime, "Admin", "password1").unwrap_err(),
            "reserved_username"
        );
        assert!(!has_accounts(&runtime).unwrap());
    }

    #[test]
    fn confirm_wrong_default_does_not_change_hash() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        logout_account(&runtime).unwrap();
        let mailer = RecordingMailer::new();
        request_password_reset(&runtime, &mailer, "minh.anh", "minh@example.com").unwrap();
        assert_eq!(
            confirm_password_reset(&runtime, "minh.anh", "wrongpass", "newpass12").unwrap_err(),
            "default_password_wrong"
        );
        login_account(&runtime, "minh.anh", &mailer.sent.lock().unwrap()[0].2).unwrap();
    }

    #[test]
    fn empty_profile_email_allows_first_time_reset() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        update_account_profile(&runtime, "Minh", "minh@example.com").unwrap();
        update_account_profile(&runtime, "Minh", "").unwrap();
        logout_account(&runtime).unwrap();
        let mailer = RecordingMailer::new();
        request_password_reset(&runtime, &mailer, "minh.anh", "other@example.com").unwrap();
        assert_eq!(mailer.sent.lock().unwrap()[0].0, "other@example.com");
    }

    #[test]
    fn reset_rejects_old_email_after_profile_change() {
        let (runtime, _, _) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        update_account_profile(&runtime, "", "old@example.com").unwrap();
        update_account_profile(&runtime, "", "new@example.com").unwrap();
        logout_account(&runtime).unwrap();
        let mailer = RecordingMailer::new();
        assert_eq!(
            request_password_reset(&runtime, &mailer, "minh.anh", "old@example.com").unwrap_err(),
            "reset_failed"
        );
        assert!(mailer.sent.lock().unwrap().is_empty());
    }

    #[test]
    fn avatar_rejects_svg_and_oversize() {
        let (runtime, _, dir) = setup();
        register_account(&runtime, "minh.anh", "password1").unwrap();
        assert_eq!(
            set_account_avatar_bytes(&runtime, b"<svg xmlns='http://www.w3.org/2000/svg'></svg>")
                .unwrap_err(),
            "invalid_avatar"
        );
        let mut huge = vec![0xFF, 0xD8, 0xFF];
        huge.resize(2 * 1024 * 1024 + 1, 0);
        assert_eq!(
            set_account_avatar_bytes(&runtime, &huge).unwrap_err(),
            "avatar_too_large"
        );
        let jpeg = [0xFF, 0xD8, 0xFF, 0xD9];
        let session = set_account_avatar_bytes(&runtime, &jpeg).unwrap();
        assert!(session.avatar_url.unwrap().ends_with("/avatars/1.jpg"));
        clear_account_avatar(&runtime).unwrap();
        assert!(!dir.join("avatars").join("1.jpg").exists());
    }

    #[test]
    fn first_register_claims_orphan_pet() {
        let (runtime, conn, _) = setup();
        conn.execute("INSERT INTO pet_state (user_id) VALUES (NULL)", [])
            .unwrap();
        let session = register_account(&runtime, "alice", "password1").unwrap();
        let uid: i64 = conn
            .query_row("SELECT user_id FROM pet_state", [], |row| row.get(0))
            .unwrap();
        assert_eq!(uid, session.user_id);
    }
}
