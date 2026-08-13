import { create } from "zustand";
import {
  getPopupIntervalMs,
  showStudyPopup,
  startPopupScheduler,
  stopPopupScheduler,
} from "../features/scheduler";

interface SchedulerStore {
  isRunning: boolean;
  intervalMs: number;
  nextTickAt: number | null;
  start: () => void;
  stop: () => void;
  triggerNow: () => Promise<void>;
}

export const useSchedulerStore = create<SchedulerStore>((set, get) => ({
  isRunning: false,
  intervalMs: getPopupIntervalMs(),
  nextTickAt: null,

  start: () => {
    if (get().isRunning) {
      return;
    }

    startPopupScheduler(() => {
      set({ nextTickAt: Date.now() + get().intervalMs });
    });

    set({
      isRunning: true,
      nextTickAt: Date.now() + get().intervalMs,
    });
  },

  stop: () => {
    stopPopupScheduler();
    set({ isRunning: false, nextTickAt: null });
  },

  triggerNow: async () => {
    await showStudyPopup();
    if (get().isRunning) {
      set({ nextTickAt: Date.now() + get().intervalMs });
    }
  },
}));
