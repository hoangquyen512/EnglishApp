import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { UI } from "../../constants/ui";
import { partOfSpeechLabel } from "../../features/vocabulary";
import type { PetState, StudyFlashcard } from "../../types";
import { PetAvatar } from "../pet/pet-avatar";
import { artSrc, VocabIllustration } from "./vocab-illustration";
import {
  IconButton,
  IconPause,
  IconPlay,
  IconPrev,
  IconSkip,
  IconSpeaker,
} from "../shared/icon-button";
import { PrimaryButton } from "../shared/primary-button";

interface FlashcardFaceProps {
  card: StudyFlashcard;
  paused: boolean;
  pet?: PetState | null;
  showActions?: boolean;
  /** Compact horizontal layout for floating overlay (no tall scroll). */
  compact?: boolean;
  onPauseToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSpeak: () => void;
  onKnown?: () => void;
  onUnknown?: () => void;
}

/** Shrinks font until children fit the fixed compact card frame. */
function CompactFitText({
  contentKey,
  children,
  className = "",
}: {
  contentKey: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const MIN = 7;
    const MAX = 13;

    const fit = () => {
      let lo = MIN;
      let hi = MAX;
      el.style.fontSize = `${MAX}px`;
      if (el.scrollHeight <= el.clientHeight + 1) {
        return;
      }
      for (let i = 0; i < 12; i += 1) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollHeight <= el.clientHeight + 1) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      el.style.fontSize = `${lo}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [contentKey]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function FlashcardFace({
  card,
  paused,
  pet,
  showActions = true,
  compact = false,
  onPauseToggle,
  onNext,
  onPrev,
  onSpeak,
  onKnown,
  onUnknown,
}: FlashcardFaceProps) {
  const [visible, setVisible] = useState(card);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    const apply = () => {
      if (!cancelled) {
        setVisible(card);
      }
    };
    img.onload = apply;
    img.onerror = apply;
    img.src = artSrc(card.imageKey, card.topic);
    if (img.complete && img.naturalWidth > 0) {
      apply();
    }
    return () => {
      cancelled = true;
    };
  }, [card]);

  if (compact) {
    const posLabel = partOfSpeechLabel(visible.partOfSpeech);
    const fitKey = `${visible.contentType}-${visible.contentId}-${visible.word}-${visible.meaning}`;
    return (
      <article className="flex h-full w-full min-h-0 flex-col gap-2 overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-[104px_1fr] items-stretch gap-2.5 overflow-hidden">
          <VocabIllustration
            imageKey={visible.imageKey}
            topic={visible.topic}
            className="h-full min-h-0 overflow-hidden rounded-md bg-transparent ring-0 [&_img]:mx-auto [&_img]:h-full [&_img]:max-h-full [&_img]:w-full [&_img]:object-contain [&_img]:object-center"
          />
          <div className="flex h-full min-h-0 min-w-0 gap-1 overflow-hidden">
            <CompactFitText
              contentKey={fitKey}
              className="h-full min-h-0 min-w-0 flex-1 leading-snug [&>*+*]:mt-[0.35em]"
            >
              {posLabel ? (
                <p className="text-[0.65em] font-semibold tracking-[0.02em] text-muted">{posLabel}</p>
              ) : null}
              <h2 lang="en" className="font-specimen text-[1.05em] font-semibold leading-[1.15] text-ink">
                {visible.word}
              </h2>
              {visible.phonetic ? (
                <p lang="en" className="text-[0.7em] leading-snug text-muted">
                  {visible.phonetic}
                </p>
              ) : null}
              <p className="text-[0.9em] font-semibold leading-snug text-clay-dark">
                <span className="sr-only">{UI.meaningLabel}: </span>
                {visible.meaning}
              </p>
              {visible.example ? (
                <blockquote
                  lang="en"
                  className="line-clamp-2 border-l-2 border-clay pl-[0.4em] text-[0.65em] leading-snug text-ink"
                >
                  <span className="sr-only">{UI.exampleLabel}: </span>
                  {visible.example}
                </blockquote>
              ) : null}
            </CompactFitText>
            <IconButton label={UI.listen} onClick={onSpeak} className="h-6 w-6 shrink-0 self-start bg-cream">
              <IconSpeaker />
            </IconButton>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-1">
          <IconButton label={UI.prevCard} onClick={onPrev} className="h-6 w-6">
            <IconPrev />
          </IconButton>
          <IconButton
            label={paused ? UI.resume : UI.pause}
            onClick={onPauseToggle}
            className="h-6 w-6"
          >
            {paused ? <IconPlay /> : <IconPause />}
          </IconButton>
          <IconButton label={UI.nextCard} onClick={onNext} className="h-6 w-6">
            <IconSkip />
          </IconButton>
        </div>

        {showActions && onKnown && onUnknown ? (
          <div className="grid grid-cols-2 gap-1">
            <PrimaryButton variant="ghost" className="min-h-6 px-1.5 py-0.5 text-[10px]" onClick={onUnknown}>
              {UI.unknown}
            </PrimaryButton>
            <PrimaryButton className="min-h-6 px-1.5 py-0.5 text-[10px]" onClick={onKnown}>
              {UI.known}
            </PrimaryButton>
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{UI.cardIntervalHint}</p>

      <VocabIllustration imageKey={visible.imageKey} topic={visible.topic} className="shadow-card" />

      <div className="rounded-[20px] bg-paper p-4 shadow-card ring-1 ring-line">
        {partOfSpeechLabel(visible.partOfSpeech) ? (
          <p className="text-xs font-semibold tracking-[0.02em] text-muted">
            {partOfSpeechLabel(visible.partOfSpeech)}
          </p>
        ) : null}
        <div className="mt-1 flex items-start justify-between gap-2">
          <h2 lang="en" className="font-specimen text-3xl font-semibold leading-tight text-ink">
            {visible.word}
          </h2>
          <IconButton label={UI.listen} onClick={onSpeak} className="shrink-0 bg-cream">
            <IconSpeaker />
          </IconButton>
        </div>
        {visible.phonetic ? (
          <p lang="en" className="mt-1 text-base text-muted">
            {visible.phonetic}
          </p>
        ) : null}
        <p className="mt-3 text-lg font-semibold text-clay-dark">
          <span className="sr-only">{UI.meaningLabel}: </span>
          {visible.meaning}
        </p>
        {visible.example ? (
          <blockquote lang="en" className="mt-3 border-l-2 border-clay pl-3 text-sm leading-relaxed text-ink">
            <span className="sr-only">{UI.exampleLabel}: </span>
            {visible.example}
          </blockquote>
        ) : null}
        {visible.exampleVi ? <p className="mt-1 pl-3 text-xs text-muted">{visible.exampleVi}</p> : null}
      </div>

      {pet ? (
        <div className="flex items-center gap-2">
          <PetAvatar pet={pet} size="md" />
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-2 pt-2">
        <IconButton label={UI.prevCard} onClick={onPrev}>
          <IconPrev />
        </IconButton>
        <IconButton label={paused ? UI.resume : UI.pause} onClick={onPauseToggle}>
          {paused ? <IconPlay /> : <IconPause />}
        </IconButton>
        <IconButton label={UI.nextCard} onClick={onNext}>
          <IconSkip />
        </IconButton>
      </div>

      {showActions && onKnown && onUnknown ? (
        <div className="grid grid-cols-2 gap-2">
          <PrimaryButton variant="ghost" onClick={onUnknown}>
            {UI.unknown}
          </PrimaryButton>
          <PrimaryButton onClick={onKnown}>{UI.known}</PrimaryButton>
        </div>
      ) : null}
    </article>
  );
}
