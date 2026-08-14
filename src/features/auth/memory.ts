import type { SessionDto } from "./types";
import { readBrowserJson, removeBrowserJson, writeBrowserJson } from "../../lib/browser-persist";
import {
  normalizeDisplayName,
  normalizeEmail,
  normalizeUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
} from "./validate";

interface Account {
  id: number;
  username: string;
  password: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

const AUTH_KEY = "yume-demo-auth";

const accounts: Account[] = [];
let nextId = 1;
let sessionUserId: number | null = null;
const failures = new Map<string, { count: number; until: number }>();

function persist(): void {
  writeBrowserJson(AUTH_KEY, { accounts, nextId, sessionUserId });
}

function hydrateFromStorage(): void {
  const saved = readBrowserJson<{
    accounts?: Account[];
    nextId?: number;
    sessionUserId?: number | null;
  }>(AUTH_KEY);
  if (!saved?.accounts) {
    return;
  }
  accounts.splice(0, accounts.length, ...saved.accounts);
  nextId = saved.nextId ?? accounts.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  sessionUserId = saved.sessionUserId ?? null;
}

hydrateFromStorage();

function fail(code: string): never {
  throw new Error(code);
}

function findByUsername(username: string): Account | undefined {
  const key = username.toLowerCase();
  return accounts.find((row) => row.username.toLowerCase() === key);
}

function sessionDto(account: Account): SessionDto {
  return {
    userId: account.id,
    username: account.username,
    email: account.email,
    displayName: account.displayName,
    avatarUrl: account.avatarUrl,
  };
}

function requireAccount(): Account {
  const account = accounts.find((row) => row.id === sessionUserId);
  if (!account) {
    fail("not_logged_in");
  }
  return account;
}

function checkLockout(username: string): void {
  const key = username.toLowerCase();
  const row = failures.get(key);
  if (row && row.until > Date.now()) {
    fail("lockout");
  }
}

function noteFailure(username: string): void {
  const key = username.toLowerCase();
  const row = failures.get(key) ?? { count: 0, until: 0 };
  row.count += 1;
  if (row.count >= 5) {
    row.until = Date.now() + 30_000;
    row.count = 0;
  }
  failures.set(key, row);
}

export function invoke(command: string, args: Record<string, unknown> = {}): Promise<unknown> {
  try {
    return Promise.resolve(dispatch(command, args));
  } catch (err) {
    return Promise.reject(err);
  }
}

function dispatch(command: string, args: Record<string, unknown> = {}): unknown {
  switch (command) {
    case "current_session": {
      if (sessionUserId === null) {
        return Promise.resolve(null);
      }
      const account = accounts.find((row) => row.id === sessionUserId);
      return Promise.resolve(account ? sessionDto(account) : null);
    }
    case "has_accounts": {
      return Promise.resolve(accounts.length > 0);
    }
    case "register_account": {
      const username = String(args.username ?? "");
      const password = String(args.password ?? "");
      const usernameError = validateUsername(username);
      if (usernameError) fail(usernameError);
      const passwordError = validatePassword(password, username);
      if (passwordError) fail(passwordError);
      if (findByUsername(username)) fail("username_taken");
      const account: Account = {
        id: nextId++,
        username: normalizeUsername(username),
        password,
        email: null,
        displayName: null,
        avatarUrl: null,
      };
      accounts.push(account);
      sessionUserId = account.id;
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "login_account": {
      const username = String(args.username ?? "");
      const password = String(args.password ?? "");
      checkLockout(username);
      const account = findByUsername(username);
      if (!account || account.password !== password) {
        noteFailure(username);
        fail("auth_failed");
      }
      failures.delete(username.toLowerCase());
      sessionUserId = account.id;
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "logout_account": {
      sessionUserId = null;
      persist();
      return Promise.resolve();
    }
    case "change_password": {
      const account = requireAccount();
      const currentPassword = String(args.currentPassword ?? "");
      const newPassword = String(args.newPassword ?? "");
      if (account.password !== currentPassword) fail("auth_failed");
      const passwordError = validatePassword(newPassword, account.username);
      if (passwordError) fail(passwordError);
      account.password = newPassword;
      persist();
      return Promise.resolve();
    }
    case "request_password_reset": {
      const username = String(args.username ?? "");
      const email = normalizeEmail(String(args.email ?? ""));
      if (!email || validateEmail(email)) fail("reset_failed");
      const account = findByUsername(username);
      if (!account) fail("reset_failed");
      if (account.email && account.email !== email) fail("reset_failed");
      account.email = email;
      account.password = "default12";
      persist();
      return Promise.resolve({ ok: true });
    }
    case "confirm_password_reset": {
      const username = String(args.username ?? "");
      const defaultPassword = String(args.defaultPassword ?? "");
      const newPassword = String(args.newPassword ?? "");
      checkLockout(username);
      const account = findByUsername(username);
      if (!account || account.password !== defaultPassword) {
        noteFailure(username);
        fail("default_password_wrong");
      }
      if (newPassword === defaultPassword) fail("password_same_as_default");
      const passwordError = validatePassword(newPassword, account.username);
      if (passwordError) fail(passwordError);
      account.password = newPassword;
      sessionUserId = account.id;
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "update_account_profile": {
      const account = requireAccount();
      const displayName = String(args.displayName ?? "");
      const email = String(args.email ?? "");
      const nameError = validateDisplayName(displayName);
      if (nameError) fail(nameError);
      const emailError = validateEmail(email);
      if (emailError) fail(emailError);
      account.displayName = normalizeDisplayName(displayName);
      account.email = normalizeEmail(email);
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "set_account_avatar":
    case "set_account_avatar_bytes": {
      const account = requireAccount();
      const bytes = Array.isArray(args.bytes) ? (args.bytes as number[]) : [];
      if (bytes.length > 2 * 1024 * 1024) {
        fail("avatar_too_large");
      }
      if (bytes.length >= 4 && bytes[0] === 0x3c && bytes[1] === 0x73) {
        fail("invalid_avatar");
      }
      account.avatarUrl = "memory:avatar";
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "clear_account_avatar": {
      const account = requireAccount();
      account.avatarUrl = null;
      persist();
      return Promise.resolve(sessionDto(account));
    }
    case "delete_account": {
      const account = requireAccount();
      const password = String(args.password ?? "");
      if (account.password !== password) fail("auth_failed");
      const index = accounts.findIndex((row) => row.id === account.id);
      if (index >= 0) {
        accounts.splice(index, 1);
      }
      sessionUserId = null;
      persist();
      return Promise.resolve();
    }
    default:
      fail("unknown_command");
  }
}

export function resetMemoryAuth(): void {
  accounts.length = 0;
  nextId = 1;
  sessionUserId = null;
  failures.clear();
  removeBrowserJson(AUTH_KEY);
}
