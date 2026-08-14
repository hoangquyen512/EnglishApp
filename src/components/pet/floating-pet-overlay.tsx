import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UI } from "../../constants/ui";
import { recordFlashcardEvent, speakWord } from "../../features/vocabulary";
import { useAppStore } from "../../stores/app-store";
import { useStudyStore } from "../../stores/study-store";
import type { FlashcardOutcome, PetState } from "../../types";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
import { IconButton, IconClose } from "../shared/icon-button";
import { PetAvatar } from "../pet/pet-avatar";

interface FloatingPetOverlayProps {
  pet: PetState;
  onDismiss: () => void;
}

const STORAGE_KEY = "yume-float-pet-pos";

function loadPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { x: window.innerWidth - 88, y: window.innerHeight - 100 };
    }
    const parsed = JSON.parse(raw) as { x?: number; y?: number };
    return {
      x: typeof parsed.x === "number" ? parsed.x : window.innerWidth - 88,
      y: typeof parsed.y === "number" ? parsed.y : window.innerHeight - 100,
    };
  } catch {
    return { x: window.innerWidth - 88, y: window.innerHeight - 100 };
  }
}

export function FloatingPetOverlay({ pet, onDismiss }: FloatingPetOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(loadPos);
  const drag = useRef<{ ox: number; oy: number; moved: boolean } | null>(null);
  const setPet = useAppStore((state) => state.setPet);
  const contentType = useStudyStore((state) => state.contentType);
  const topic = useStudyStore((state) => state.topic);
  const conversationTopic = useStudyStore((state) => state.conversationTopic);

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
    conversationTopic: contentType === "conversation" ? conversationTopic : null,
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const onPointerDown = (event: React.PointerEvent) => {
    drag.current = { ox: event.clientX - pos.x, oy: event.clientY - pos.y, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current) {
      return;
    }
    const nextX = event.clientX - drag.current.ox;
    const nextY = event.clientY - drag.current.oy;
    if (Math.abs(nextX - pos.x) > 3 || Math.abs(nextY - pos.y) > 3) {
      drag.current.moved = true;
    }
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 120, nextX)),
      y: Math.max(8, Math.min(window.innerHeight - 120, nextY)),
    });
  };

  const onPointerUp = () => {
    const wasDrag = drag.current?.moved ?? false;
    drag.current = null;
    if (!wasDrag) {
      setExpanded((value) => !value);
    }
  };

  const node = (
    <div
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto absolute flex items-end gap-2"
        style={{
          left: expanded ? Math.max(8, pos.x - 270) : pos.x,
          top: Math.max(8, pos.y - (expanded ? 120 : 0)),
        }}
      >
        {expanded ? (
          <section className="relative w-[min(250px,calc(100vw-88px))] rounded-xl bg-cream p-1.5 pt-2 shadow-card ring-1 ring-line">
            <div className="absolute right-1 top-1 z-10">
              <IconButton label={UI.close} onClick={onDismiss} className="h-5 w-5">
                <IconClose />
              </IconButton>
            </div>
            <div className="pr-5">
              {player.error ? <p className="text-sm text-rose">{player.error}</p> : null}
              {player.loading && !player.card ? <p className="text-xs">{UI.loading}</p> : null}
              {!player.loading && !player.card ? <p className="text-xs">{UI.noCard}</p> : null}
              {player.card ? (
                <FlashcardFace
                  compact
                  showActions={false}
                  card={player.card}
                  paused={player.paused}
                  onPauseToggle={player.togglePause}
                  onPrev={player.prev}
                  onNext={() => player.next()}
                  onSpeak={() => speakWord(player.card!.word)}
                />
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="flex shrink-0 flex-col items-center gap-1 pb-0.5">
          <button
            type="button"
            aria-label={expanded ? "Thu pet" : "Mở thẻ học"}
            className="cursor-grab border-0 bg-transparent p-0 active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <PetAvatar pet={pet} size="sm" variant="float" />
          </button>
          {!expanded ? (
            <button
              type="button"
              className="rounded-full bg-cream/95 px-1.5 py-0.5 text-[9px] font-semibold text-muted shadow-sm ring-1 ring-line"
              onClick={onDismiss}
            >
              {UI.close}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
