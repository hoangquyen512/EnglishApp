const USERNAME_RE = /^[A-Za-z0-9._]{3,24}$/;
const RESERVED = new Set(["admin", "root", "system", "guest"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsername(raw: string): string {
  return raw.trim();
}

export function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.length === 0 ? null : trimmed;
}

export function normalizeDisplayName(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!USERNAME_RE.test(username)) {
    return "invalid_username";
  }
  if (RESERVED.has(username.toLowerCase())) {
    return "reserved_username";
  }
  return null;
}

export function validatePassword(raw: string, username?: string): string | null {
  if (raw.length < 8 || raw.length > 128) {
    return "invalid_password";
  }
  if (username && raw.toLowerCase() === normalizeUsername(username).toLowerCase()) {
    return "password_matches_username";
  }
  return null;
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (email === null) {
    return null;
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return "invalid_email";
  }
  return null;
}

export function validateDisplayName(raw: string): string | null {
  const name = normalizeDisplayName(raw);
  if (name === null) {
    return null;
  }
  if (name.length > 40 || /[\n\r\t\u0000-\u001f]/.test(name)) {
    return "invalid_display_name";
  }
  return null;
}
