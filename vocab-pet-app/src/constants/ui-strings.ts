export const UI_STRINGS = {
  app: {
    title: "Vocab Pet",
    loading: "Loading...",
    error: "Something went wrong",
  },
  tray: {
    openApp: "Open App",
    studyNow: "Study Now",
    quit: "Quit",
  },
  main: {
    subtitle: "Your daily vocabulary companion",
    petStatus: "Pet Status",
    level: "Level",
    xp: "XP",
    mood: "Mood",
    streak: "Day streak",
    nextPopup: "Next study popup in",
    studyNow: "Study Now",
  },
  popup: {
    title: "Flashcard",
    prompt: "What does this word mean?",
    submit: "Submit",
    correct: "Correct! +{xp} XP",
    incorrect: "Incorrect. Keep practicing!",
    noWords: "No vocabulary available. Add words first.",
    close: "Close",
  },
  mood: {
    happy: "Happy",
    neutral: "Neutral",
    sad: "Sad",
    hungry: "Hungry",
  },
} as const;

export const PET_CONFIG = {
  xpPerCorrect: 10,
  xpForLevel: (level: number) => level * 100,
} as const;

/** Demo interval: popup every 5 minutes (adjust for testing). */
export const SCHEDULER_CONFIG = {
  popupIntervalMs: 5 * 60 * 1000,
} as const;

export const DB_URL = "sqlite:vocab_pet.db";
