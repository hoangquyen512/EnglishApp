import { useCallback, useEffect } from "react";
import { UI } from "../../constants/ui";
import { recordFlashcardEvent, speakWord } from "../../features/vocabulary";
import { dismissStudyPopup } from "../../features/scheduler";
import { useAppStore } from "../../stores/app-store";
import { useStudyStore } from "../../stores/study-store";
import type { FlashcardOutcome } from "../../types";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
import { IconButton, IconClose } from "../shared/icon-button";

function remainingLabel(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

export function FlashcardPopup() {
  const pet = useAppStore((state) => state.pet);
  const hydrate = useAppStore((state) => state.hydrate);
  const setPet = useAppStore((state) => state.setPet);
  const contentType = useStudyStore((state) => state.contentType);
  const topic = useStudyStore((state) => state.topic);

  const onAdvance = useCallback(
    async (card: { contentId: number; contentType: typeof contentType; topic: typeof topic }) => {
      const result = await recordFlashcardEvent({
        contentType: card.contentType,
        contentId: card.contentId,
        outcome: "viewed",
        topic: card.topic,
      });
      if (result.pet) {
        setPet(result.pet);
      }
    },
    [setPet],
  );

  const player = useFlashcardPlayer({
    contentType,
    topic: contentType === "phrase" ? topic : null,
    autoSpeak: true,
    onAdvance,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const mark = useCallback(
    async (outcome: FlashcardOutcome) => {
      if (!player.card) {
        return;
      }
      const result = await recordFlashcardEvent({
        contentType: player.card.contentType,
        contentId: player.card.contentId,
        outcome,
        topic: player.card.topic,
      });
      if (result.pet) {
        setPet(result.pet);
      }
      player.next({ silent: true });
    },
    [player, setPet],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        void dismissStudyPopup();
      }
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        player.togglePause();
      }
      if (event.key === "ArrowRight") {
        player.next();
      }
      if (event.key === "ArrowLeft") {
        player.prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  return (
    <div className="flex h-screen flex-col bg-cream text-ink">
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-line bg-paper px-3 py-2"
      >
        <h1 data-tauri-drag-region className="text-base font-semibold">
          {UI.popupTitle}
        </h1>
        <IconButton label="Đóng cửa sổ học" onClick={() => void dismissStudyPopup()}>
          <IconClose />
        </IconButton>
      </header>
      <div className="flex-1 overflow-auto p-4">
        {player.error ? <p className="text-sm text-rose">{player.error}</p> : null}
        {player.loading && !player.card ? <p>{UI.loading}</p> : null}
        {!player.loading && !player.card ? <p>{UI.noCard}</p> : null}
        {player.card ? (
          <FlashcardFace
            card={player.card}
            progress={player.progress}
            paused={player.paused}
            remainingLabel={remainingLabel(player.remaining)}
            pet={pet}
            onPauseToggle={player.togglePause}
            onPrev={player.prev}
            onNext={() => player.next()}
            onSpeak={() => speakWord(player.card!.word)}
            onKnown={() => void mark("known")}
            onUnknown={() => void mark("unknown")}
          />
        ) : null}
      </div>
    </div>
  );
}
