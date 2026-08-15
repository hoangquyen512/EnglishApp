import { useCallback, useEffect, useState } from "react";
import { UI } from "../../constants/ui";
import { recordFlashcardEvent, speakWord } from "../../features/vocabulary";
import { dismissStudyPopup } from "../../features/scheduler";
import { setCompanionWindowBounds } from "../../lib/companion-window";
import { showMainWindow } from "../../lib/tauri";
import { useAppStore } from "../../stores/app-store";
import { useAuthStore } from "../../stores/auth-store";
import { useStudyStore } from "../../stores/study-store";
import type { FlashcardOutcome, PetState } from "../../types";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
import { IconButton, IconClose } from "../shared/icon-button";
import { CompanionPetButton } from "./companion-pet-button";

export function FlashcardPopup() {
  const [expanded, setExpanded] = useState(false);
  const session = useAuthStore((state) => state.session);
  const authReady = useAuthStore((state) => state.ready);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const pet = useAppStore((state) => state.pet);
  const hydrate = useAppStore((state) => state.hydrate);
  const ready = useAppStore((state) => state.ready);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (session) {
      void hydrate();
    }
  }, [hydrate, session]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.background;
    const prevBody = body.style.background;
    html.style.background = "transparent";
    body.style.background = "transparent";
    html.classList.add("companion-window");
    body.classList.add("companion-window");
    return () => {
      html.style.background = prevHtml;
      body.style.background = prevBody;
      html.classList.remove("companion-window");
      body.classList.remove("companion-window");
    };
  }, []);

  const canStudy = Boolean(session && pet);

  const openMainForSetup = useCallback(async () => {
    await showMainWindow();
    await dismissStudyPopup();
  }, []);

  const toggleExpanded = useCallback(async () => {
    if (!authReady) {
      return;
    }
    if (!session) {
      await openMainForSetup();
      return;
    }
    if (ready && !pet) {
      await openMainForSetup();
      return;
    }
    if (!pet) {
      return;
    }
    const next = !expanded;
    setExpanded(next);
    await setCompanionWindowBounds(next);
  }, [authReady, expanded, openMainForSetup, pet, ready, session]);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-transparent text-ink ${
        expanded ? "items-stretch justify-end p-2" : "items-center justify-center"
      }`}
    >
      {canStudy ? (
        <CompanionStudyShell
          pet={pet!}
          expanded={expanded}
          onToggle={() => void toggleExpanded()}
        />
      ) : !session && authReady ? (
        <button
          type="button"
          className="rounded-full bg-cream/95 px-4 py-3 text-sm font-semibold text-ink shadow-card ring-1 ring-line"
          onClick={() => void openMainForSetup()}
        >
          {UI.popupNeedLogin}
        </button>
      ) : (
        <p className="rounded-full bg-cream/90 px-3 py-2 text-sm text-ink shadow-card">{UI.loading}</p>
      )}
    </div>
  );
}

function CompanionStudyShell({
  pet,
  expanded,
  onToggle,
}: {
  pet: PetState;
  expanded: boolean;
  onToggle: () => void;
}) {
  const setPet = useAppStore((state) => state.setPet);
  const contentType = useStudyStore((state) => state.contentType);

  const onAdvance = useCallback(
    async (card: { contentId: number; contentType: typeof contentType; topic: string | null }) => {
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
    autoSpeak: true,
    active: expanded,
    onAdvance,
  });

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
    if (!expanded) {
      return;
    }
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
  }, [expanded, player]);

  if (!expanded) {
    return <CompanionPetButton pet={pet} onToggle={onToggle} label="Mở thẻ học" />;
  }

  return (
    <div className="flex h-full min-h-0 w-full items-end gap-2 bg-transparent">
      <section className="relative min-h-0 min-w-0 flex-1 overflow-auto rounded-[20px] bg-cream p-3 shadow-card ring-1 ring-line">
        <div className="absolute right-2 top-2 z-10">
          <IconButton label="Đóng cửa sổ học" onClick={() => void dismissStudyPopup()}>
            <IconClose />
          </IconButton>
        </div>
        <div className="pr-8">
          {player.error ? <p className="text-sm text-rose">{player.error}</p> : null}
          {player.loading && !player.card ? <p>{UI.loading}</p> : null}
          {!player.loading && !player.card ? <p>{UI.noCard}</p> : null}
          {player.card ? (
            <FlashcardFace
              card={player.card}
              paused={player.paused}
              onPauseToggle={player.togglePause}
              onPrev={player.prev}
              onNext={() => player.next()}
              onSpeak={() => speakWord(player.card!.word)}
              onKnown={() => void mark("known")}
              onUnknown={() => void mark("unknown")}
            />
          ) : null}
        </div>
      </section>
      <aside className="flex w-[120px] shrink-0 flex-col items-center gap-1 pb-1">
        <CompanionPetButton pet={pet} onToggle={onToggle} label="Thu pet" />
        <p className="text-center text-[11px] font-semibold text-ink drop-shadow-sm">
          {UI.level} {pet.level} · {UI.xp} {pet.xp}
        </p>
      </aside>
    </div>
  );
}
