import { create } from "zustand";
import { getDb } from "../db/client";
import { setCurrentUserId } from "../db/current-user";
import { isTauri } from "../lib/tauri";
import { useAppStore } from "./app-store";
import {
  changePassword as changePasswordApi,
  clearAccountAvatar,
  confirmPasswordReset,
  currentSession,
  deleteAccount,
  hasAccounts,
  loginAccount,
  logoutAccount,
  registerAccount,
  requestPasswordReset,
  setAccountAvatarBytes,
  updateAccountProfile,
} from "../features/auth";
import type { SessionDto } from "../features/auth";

interface AuthState {
  ready: boolean;
  session: SessionDto | null;
  hasAccounts: boolean;
  hydrate: () => Promise<void>;
  applySession: (session: SessionDto | null) => void;
  register: (username: string, password: string) => Promise<SessionDto>;
  login: (username: string, password: string) => Promise<SessionDto>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestReset: (username: string, email: string) => Promise<void>;
  confirmReset: (
    username: string,
    defaultPassword: string,
    newPassword: string,
  ) => Promise<SessionDto>;
  updateProfile: (displayName: string, email: string) => Promise<SessionDto>;
  setAvatarBytes: (bytes: number[]) => Promise<SessionDto>;
  clearAvatar: () => Promise<SessionDto>;
  removeAccount: (password: string) => Promise<void>;
}

function apply(session: SessionDto | null): void {
  setCurrentUserId(session?.userId ?? null);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  hasAccounts: false,
  applySession: (session) => {
    apply(session);
    set({ session, hasAccounts: get().hasAccounts || session !== null });
  },
  hydrate: async () => {
    try {
      // Packaged apps must run SQL migrations before auth queries `accounts`.
      if (isTauri()) {
        await getDb();
      }
      const [session, accountsExist] = await Promise.all([currentSession(), hasAccounts()]);
      apply(session);
      set({ ready: true, session, hasAccounts: accountsExist });
    } catch (error) {
      console.error("auth hydrate failed", error);
      apply(null);
      set({ ready: true, session: null, hasAccounts: false });
    }
  },
  register: async (username, password) => {
    const session = await registerAccount(username, password);
    apply(session);
    set({ session, hasAccounts: true });
    return session;
  },
  login: async (username, password) => {
    const session = await loginAccount(username, password);
    apply(session);
    set({ session, hasAccounts: true });
    return session;
  },
  logout: async () => {
    await logoutAccount();
    apply(null);
    useAppStore.getState().reset();
    const accountsExist = await hasAccounts();
    set({ session: null, hasAccounts: accountsExist });
  },
  changePassword: async (currentPassword, newPassword) => {
    await changePasswordApi(currentPassword, newPassword);
  },
  requestReset: async (username, email) => {
    await requestPasswordReset(username, email);
  },
  confirmReset: async (username, defaultPassword, newPassword) => {
    const session = await confirmPasswordReset(username, defaultPassword, newPassword);
    apply(session);
    set({ session, hasAccounts: true });
    return session;
  },
  updateProfile: async (displayName, email) => {
    const session = await updateAccountProfile(displayName, email);
    apply(session);
    set({ session });
    return session;
  },
  setAvatarBytes: async (bytes) => {
    const session = await setAccountAvatarBytes(bytes);
    apply(session);
    set({ session });
    return session;
  },
  clearAvatar: async () => {
    const session = await clearAccountAvatar();
    apply(session);
    set({ session });
    return session;
  },
  removeAccount: async (password) => {
    await deleteAccount(password);
    apply(null);
    useAppStore.getState().reset();
    const accountsExist = await hasAccounts();
    set({ session: null, hasAccounts: accountsExist });
  },
}));
