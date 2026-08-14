import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_POPUP_INTERVAL_MINUTES } from "../constants/study";
import { userSettingsStorage } from "../lib/user-storage";

interface SettingsState {
  intervalMinutes: number;
  setIntervalMinutes: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      intervalMinutes: DEFAULT_POPUP_INTERVAL_MINUTES,
      setIntervalMinutes: (minutes) =>
        set({
          intervalMinutes: Math.max(1, Math.min(180, Math.round(minutes))),
        }),
    }),
    {
      name: "yume-settings",
      storage: createJSONStorage(() => userSettingsStorage),
    },
  ),
);
