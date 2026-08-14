import { useEffect, useState } from "react";
import { UI } from "./constants/ui";
import { FlashcardPopup } from "./components/popup/flashcard-popup";
import { HomeScreen } from "./components/shared/home-screen";
import { OnboardingScreen } from "./components/shared/onboarding-screen";
import { preloadVocabArts } from "./components/flashcard/vocab-illustration";
import { TOEIC_ART_KEYS } from "./data/toeic-cards";
import { openStudyPopup, startScheduler } from "./features/scheduler";
import { getWindowLabel, showMainWindow } from "./lib/tauri";
import { useAppStore } from "./stores/app-store";
import { useSettingsStore } from "./stores/settings-store";
import { useStudyStore } from "./stores/study-store";

export default function App() {
  const [windowKind, setWindowKind] = useState<"main" | "popup" | null>(null);
  const ready = useAppStore((state) => state.ready);
  const error = useAppStore((state) => state.error);
  const pet = useAppStore((state) => state.pet);
  const species = useAppStore((state) => state.species);
  const missions = useAppStore((state) => state.missions);
  const hydrate = useAppStore((state) => state.hydrate);
  const chooseSpecies = useAppStore((state) => state.chooseSpecies);
  const contentType = useStudyStore((state) => state.contentType);
  const topic = useStudyStore((state) => state.topic);
  const setContentType = useStudyStore((state) => state.setContentType);
  const setTopic = useStudyStore((state) => state.setTopic);
  const intervalMinutes = useSettingsStore((state) => state.intervalMinutes);
  const setIntervalMinutes = useSettingsStore((state) => state.setIntervalMinutes);

  useEffect(() => {
    void getWindowLabel().then(setWindowKind);
  }, []);

  useEffect(() => {
    preloadVocabArts(TOEIC_ART_KEYS);
  }, []);

  useEffect(() => {
    if (windowKind !== "main") {
      return;
    }
    void hydrate();
  }, [hydrate, windowKind]);

  useEffect(() => {
    if (windowKind === "main" && ready && !pet) {
      void showMainWindow();
    }
  }, [pet, ready, windowKind]);

  useEffect(() => {
    if (windowKind !== "main" || !pet) {
      return;
    }
    const handle = startScheduler({ intervalMinutes });
    return () => handle.stop();
  }, [intervalMinutes, pet, windowKind]);

  if (windowKind === null) {
    return <p className="p-6">{UI.loading}</p>;
  }

  if (windowKind === "popup") {
    return <FlashcardPopup />;
  }

  if (!ready) {
    return <p className="p-6">{UI.loading}</p>;
  }

  if (error && !pet) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">{UI.dbUnavailable}</h1>
        <p className="mt-2 text-sm">{error}</p>
      </main>
    );
  }

  if (!pet) {
    return (
      <OnboardingScreen
        species={species}
        onChoose={(item, petName) => void chooseSpecies(item, petName)}
      />
    );
  }

  return (
    <HomeScreen
      pet={pet}
      missions={missions}
      contentType={contentType}
      topic={topic}
      intervalMinutes={intervalMinutes}
      onContentType={setContentType}
      onTopic={setTopic}
      onInterval={setIntervalMinutes}
      onStudyNow={() => void openStudyPopup()}
    />
  );
}
