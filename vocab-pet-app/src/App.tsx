import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MainDashboard } from "./components/shared/main-dashboard";
import { FlashcardPopup } from "./components/popup/flashcard-popup";
import { FlashcardModal } from "./components/popup/flashcard-modal";

function DesktopApp() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  useEffect(() => {
    setWindowLabel(getCurrentWindow().label);
  }, []);

  if (!windowLabel) {
    return null;
  }

  if (windowLabel === "popup") {
    return <FlashcardPopup />;
  }

  return <MainDashboard />;
}

function WebApp() {
  return (
    <>
      <MainDashboard />
      <FlashcardModal />
    </>
  );
}

function App() {
  if (!isTauri()) {
    return <WebApp />;
  }
  return <DesktopApp />;
}

export default App;
