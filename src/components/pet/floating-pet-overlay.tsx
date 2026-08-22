import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UI } from "../../constants/ui";
import { recordFlashcardEvent, speakWord } from "../../features/vocabulary";
import { studyModeFromStored } from "../../features/vocabulary/study-mode";
import { useAppStore } from "../../stores/app-store";
import { useStudyStore } from "../../stores/study-store";
import type { PetState } from "../../types";
import { FlashcardFace } from "../flashcard/flashcard-face";
import { useFlashcardPlayer } from "../flashcard/use-flashcard-player";
import { IconButton, IconChat, IconClose, IconSearch, IconVocab } from "../shared/icon-button";
import { FloatingLookupPanel } from "../quick-lookup/floating-lookup-panel";
import { PetAvatar } from "../pet/pet-avatar";

interface FloatingPetOverlayProps {
  pet: PetState;
  onDismiss: () => void;
}

const STORAGE_KEY = "yume-float-pet-pos";
const CARD_HEIGHT = 150;
const LOOKUP_HEIGHT = 190;
const CARD_SHIFT_X = 360;
const LOOKUP_SHIFT_X = 320;

function StudyModeFab({
  label,
  active,
  onSelect,
  children,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={
        active
          ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-clay text-white shadow-card ring-2 ring-paper hover:bg-clay-dark"
          : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink shadow-sm ring-1 ring-line hover:bg-paper"
      }
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </button>
  );
}

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
  const [lookupOpen, setLookupOpen] = useState(false);
  const [pos, setPos] = useState(loadPos);
  const drag = useRef<{ ox: number; oy: number; moved: boolean } | null>(null);
  const setPet = useAppStore((state) => state.setPet);
  const contentType = useStudyStore((state) => state.contentType);
  const setContentType = useStudyStore((state) => state.setContentType);
  const panelOpen = expanded || lookupOpen;
  const panelHeight = lookupOpen ? LOOKUP_HEIGHT : CARD_HEIGHT;
  const phraseMode = studyModeFromStored(contentType) === "phrase";
  const panelShift = lookupOpen ? LOOKUP_SHIFT_X : CARD_SHIFT_X;

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
        setLookupOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

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
      setLookupOpen(false);
      setExpanded((value) => !value);
    }
  };

  const node = (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-live="polite">
      <div
        className="pointer-events-auto absolute flex items-end gap-2"
        style={{
          left: panelOpen ? Math.max(8, pos.x - panelShift) : pos.x,
          top: Math.max(8, pos.y - (panelOpen ? panelHeight : 0)),
        }}
      >
        {lookupOpen ? <FloatingLookupPanel onClose={() => setLookupOpen(false)} /> : null}
        {expanded ? (
          <section className="yume-panel relative box-border h-[150px] w-[min(300px,calc(100vw-128px))] overflow-hidden p-2.5">
            <div className="absolute right-1.5 top-1.5 z-10">
              <IconButton label={UI.close} onClick={onDismiss} className="h-5 w-5">
                <IconClose />
              </IconButton>
            </div>
            <div className="h-full pr-5">
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

        {expanded ? (
          <div className="flex shrink-0 flex-col items-center gap-1.5 pb-1">
            <StudyModeFab
              label={UI.vocabulary}
              active={!phraseMode}
              onSelect={() => setContentType("vocabulary")}
            >
              <IconVocab className="text-inherit" />
            </StudyModeFab>
            <StudyModeFab
              label={UI.phrases}
              active={phraseMode}
              onSelect={() => setContentType("phrase")}
            >
              <IconChat className="text-inherit" />
            </StudyModeFab>
          </div>
        ) : null}

        <div className="relative flex shrink-0 flex-col items-center gap-1 pb-0.5 pt-8">
          <button
            type="button"
            aria-label={UI.quickLookupTitle}
            title={UI.quickLookupTitle}
            className="absolute left-1/2 top-0 z-20 inline-flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-clay text-white shadow-card ring-2 ring-paper hover:bg-clay-dark"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(false);
              setLookupOpen((open) => !open);
            }}
          >
            <IconSearch className="text-white" />
          </button>
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
          {!panelOpen ? (
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
