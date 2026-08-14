use lettre::message::{Mailbox, Message};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{SmtpTransport, Transport};

pub trait Mailer: Send + Sync {
    fn send_default_password(
        &self,
        to: &str,
        username: &str,
        default_password: &str,
    ) -> Result<(), String>;
}

pub struct SmtpMailer;

fn env_first(keys: &[&str]) -> Result<String, String> {
    for key in keys {
        if let Ok(value) = std::env::var(key) {
            if !value.is_empty() {
                return Ok(value);
            }
        }
    }
    Err("mail_not_configured".to_string())
}

impl Mailer for SmtpMailer {
    fn send_default_password(
        &self,
        to: &str,
        username: &str,
        default_password: &str,
    ) -> Result<(), String> {
        let host = env_first(&["YUME_SMTP_HOST", "VOCABPET_SMTP_HOST"])?;
        let user = env_first(&["YUME_SMTP_USER", "VOCABPET_SMTP_USER"])?;
        let pass = env_first(&["YUME_SMTP_PASS", "VOCABPET_SMTP_PASS"])?;
        let from = env_first(&["YUME_SMTP_FROM", "VOCABPET_SMTP_FROM"])
            .unwrap_or_else(|_| format!("Yume <{user}>"));
        let port: u16 = env_first(&["YUME_SMTP_PORT", "VOCABPET_SMTP_PORT"])
            .ok()
            .and_then(|value| value.parse().ok())
            .unwrap_or(587);

        let email = Message::builder()
            .from(from.parse::<Mailbox>().map_err(|err| err.to_string())?)
            .to(to.parse::<Mailbox>().map_err(|_| "invalid_email".to_string())?)
            .subject("Mật khẩu mặc định Yume")
            .body(format!(
                "Xin chào {username},\n\nMật khẩu mặc định của bạn là: {default_password}\n\nMở Yume → Quên mật khẩu (bước 2) hoặc đăng nhập bằng mật khẩu này, rồi đổi mật khẩu mới.\n"
            ))
            .map_err(|err| err.to_string())?;

        let mailer = SmtpTransport::starttls_relay(&host)
            .map_err(|err| err.to_string())?
            .port(port)
            .credentials(Credentials::new(user, pass))
            .build();
        mailer.send(&email).map_err(|_| "mail_send_failed".to_string())?;
        Ok(())
    }
}

#[cfg(test)]
pub struct RecordingMailer {
    pub sent: std::sync::Mutex<Vec<(String, String, String)>>,
    pub fail: bool,
}

#[cfg(test)]
impl RecordingMailer {
    pub fn new() -> Self {
        Self {
            sent: std::sync::Mutex::new(Vec::new()),
            fail: false,
        }
    }
}

#[cfg(test)]
impl Mailer for RecordingMailer {
    fn send_default_password(
        &self,
        to: &str,
        username: &str,
        default_password: &str,
    ) -> Result<(), String> {
        if self.fail {
            return Err("mail_send_failed".into());
        }
        self.sent.lock().unwrap().push((
            to.to_string(),
            username.to_string(),
            default_password.to_string(),
        ));
        Ok(())
    }
}
