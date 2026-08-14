import { isTauri } from "../../lib/tauri";
import type { SessionDto } from "./types";
import * as memory from "./memory";

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    return memory.invoke(command, args) as T;
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(command, args);
}

async function withAvatarUrl(session: SessionDto): Promise<SessionDto> {
  if (!session.avatarUrl || !isTauri()) {
    return session;
  }
  if (
    session.avatarUrl.startsWith("asset:") ||
    session.avatarUrl.startsWith("http") ||
    session.avatarUrl.startsWith("data:") ||
    session.avatarUrl.startsWith("blob:") ||
    session.avatarUrl.startsWith("memory:")
  ) {
    return session;
  }
  const { convertFileSrc } = await import("@tauri-apps/api/core");
  return { ...session, avatarUrl: convertFileSrc(session.avatarUrl) };
}

async function mapSession(session: SessionDto | null): Promise<SessionDto | null> {
  return session ? withAvatarUrl(session) : null;
}

export async function currentSession(): Promise<SessionDto | null> {
  return mapSession(await invoke<SessionDto | null>("current_session"));
}

export async function hasAccounts(): Promise<boolean> {
  return invoke<boolean>("has_accounts");
}

export async function registerAccount(username: string, password: string): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("register_account", { username, password }));
}

export async function loginAccount(username: string, password: string): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("login_account", { username, password }));
}

export function logoutAccount(): Promise<void> {
  return invoke("logout_account");
}

export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return invoke("change_password", { currentPassword, newPassword });
}

export function requestPasswordReset(username: string, email: string): Promise<{ ok: true }> {
  return invoke("request_password_reset", { username, email });
}

export async function confirmPasswordReset(
  username: string,
  defaultPassword: string,
  newPassword: string,
): Promise<SessionDto> {
  return withAvatarUrl(
    await invoke<SessionDto>("confirm_password_reset", { username, defaultPassword, newPassword }),
  );
}

export async function updateAccountProfile(displayName: string, email: string): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("update_account_profile", { displayName, email }));
}

export async function setAccountAvatar(sourcePath: string): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("set_account_avatar", { sourcePath }));
}

export async function setAccountAvatarBytes(bytes: number[]): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("set_account_avatar_bytes", { bytes }));
}

export async function clearAccountAvatar(): Promise<SessionDto> {
  return withAvatarUrl(await invoke<SessionDto>("clear_account_avatar"));
}

export function deleteAccount(password: string): Promise<void> {
  return invoke("delete_account", { password });
}
