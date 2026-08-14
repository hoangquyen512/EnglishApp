import { useEffect, useState } from "react";
import { AccountScreen } from "./components/account/account-screen";
import { EditAccountScreen } from "./components/account/edit-account-screen";
import { AuthGate } from "./components/auth/auth-gate";
import { preloadVocabArts } from "./components/flashcard/vocab-illustration";
import { FlashcardPopup } from "./components/popup/flashcard-popup";
import { HomeScreen } from "./components/shared/home-screen";
import { OnboardingScreen } from "./components/shared/onboarding-screen";
import { UI } from "./constants/ui";
import { TOEIC_ART_KEYS } from "./data/toeic-cards";
import { openStudyPopup, startScheduler } from "./features/scheduler";
import { getWindowLabel, showMainWindow } from "./lib/tauri";
import { useAppStore } from "./stores/app-store";
import { useAuthStore } from "./stores/auth-store";
import { useSettingsStore } from "./stores/settings-store";
import { useStudyStore } from "./stores/study-store";

type MainView = "home" | "account" | "edit";

export default function App() {
  const [windowKind, setWindowKind] = useState<"main" | "popup" | null>(null);
  const [view, setView] = useState<MainView>("home");
  const [accountToast, setAccountToast] = useState<string | null>(null);
  const authReady = useAuthStore((state) => state.ready);
  const session = useAuthStore((state) => state.session);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const ready = useAppStore((state) => state.ready);
  const error = useAppStore((state) => state.error);
  const pet = useAppStore((state) => state.pet);
  const species = useAppStore((state) => state.species);
  const missions = useAppStore((state) => state.missions);
  const hydrate = useAppStore((state) => state.hydrate);
  const chooseSpecies = useAppStore((state) => state.chooseSpecies);
  const contentType = useStudyStore((state) => state.contentType);
  const topic = useStudyStore((state) => state.topic);
  const conversationTopic = useStudyStore((state) => state.conversationTopic);
  const setContentType = useStudyStore((state) => state.setContentType);
  const setTopic = useStudyStore((state) => state.setTopic);
  const setConversationTopic = useStudyStore((state) => state.setConversationTopic);
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
    void hydrateAuth();
  }, [hydrateAuth, windowKind]);

  useEffect(() => {
    if (windowKind !== "main" || !session) {
      return;
    }
    void hydrate();
  }, [hydrate, session, windowKind]);

  useEffect(() => {
    if (windowKind === "main" && ready && session && !pet) {
      void showMainWindow();
    }
  }, [pet, ready, session, windowKind]);

  useEffect(() => {
    if (windowKind !== "main" || !pet || !session) {
      return;
    }
    const handle = startScheduler({ intervalMinutes });
    return () => handle.stop();
  }, [intervalMinutes, pet, session, windowKind]);

  useEffect(() => {
    if (!session) {
      setView("home");
      setAccountToast(null);
    }
  }, [session]);

  if (windowKind === null) {
    return <p className="p-6">{UI.loading}</p>;
  }

  if (windowKind === "popup") {
    return <FlashcardPopup />;
  }

  if (!authReady) {
    return <p className="p-6">{UI.loading}</p>;
  }

  if (!session) {
    return <AuthGate />;
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

  if (view === "edit") {
    return (
      <EditAccountScreen
        session={session}
        onCancel={() => setView("account")}
        onSaved={() => {
          setAccountToast(UI.savedProfile);
          setView("account");
        }}
      />
    );
  }

  if (view === "account") {
    return (
      <AccountScreen
        session={session}
        toast={accountToast}
        onBack={() => {
          setAccountToast(null);
          setView("home");
        }}
        onEdit={() => {
          setAccountToast(null);
          setView("edit");
        }}
      />
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
      conversationTopic={conversationTopic ?? "greetings"}
      intervalMinutes={intervalMinutes}
      onContentType={setContentType}
      onTopic={setTopic}
      onConversationTopic={setConversationTopic}
      onInterval={setIntervalMinutes}
      onStudyNow={() => void openStudyPopup()}
      session={session}
      onOpenAccount={() => setView("account")}
    />
  );
}
