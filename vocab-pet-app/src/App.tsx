import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MainDashboard } from "./components/shared/main-dashboard";
import { FlashcardPopup } from "./components/popup/flashcard-popup";

function App() {
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

export default App;
