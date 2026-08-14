import { useEffect, useState } from "react";
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
    img.src = artSrc(card.imageKey);
    if (img.complete && img.naturalWidth > 0) {
      apply();
    }
    return () => {
      cancelled = true;
    };
  }, [card]);

  if (compact) {
    const posLabel = partOfSpeechLabel(visible.partOfSpeech);
    return (
      <article className="flex w-full flex-col gap-1.5">
        <div className="grid w-full grid-cols-[minmax(160px,42%)_1fr] items-center gap-2.5">
          <VocabIllustration
            imageKey={visible.imageKey}
            className="rounded-lg bg-transparent ring-0 [&_img]:mx-auto [&_img]:h-auto [&_img]:max-h-[160px] [&_img]:w-full [&_img]:object-contain [&_img]:object-center"
          />
          <div className="relative flex min-w-0 flex-col justify-center">
            {posLabel ? (
              <p className="text-[9px] font-semibold tracking-[0.02em] text-muted">{posLabel}</p>
            ) : null}
            <div className="mt-0.5 flex items-start justify-between gap-1">
              <h2 lang="en" className="font-specimen text-lg font-semibold leading-tight text-ink">
                {visible.word}
              </h2>
              <IconButton label={UI.listen} onClick={onSpeak} className="h-7 w-7 shrink-0 bg-cream">
                <IconSpeaker />
              </IconButton>
            </div>
            {visible.phonetic ? (
              <p lang="en" className="mt-0.5 text-[11px] text-muted">
                {visible.phonetic}
              </p>
            ) : null}
            <p className="mt-1 text-sm font-semibold text-clay-dark">
              <span className="sr-only">{UI.meaningLabel}: </span>
              {visible.meaning}
            </p>
            {visible.example ? (
              <blockquote
                lang="en"
                className="mt-1 line-clamp-2 border-l-2 border-clay pl-1.5 text-[10px] leading-snug text-ink"
              >
                <span className="sr-only">{UI.exampleLabel}: </span>
                {visible.example}
              </blockquote>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          <IconButton label={UI.prevCard} onClick={onPrev} className="h-7 w-7">
            <IconPrev />
          </IconButton>
          <IconButton
            label={paused ? UI.resume : UI.pause}
            onClick={onPauseToggle}
            className="h-7 w-7"
          >
            {paused ? <IconPlay /> : <IconPause />}
          </IconButton>
          <IconButton label={UI.nextCard} onClick={onNext} className="h-7 w-7">
            <IconSkip />
          </IconButton>
        </div>

        {showActions && onKnown && onUnknown ? (
          <div className="grid grid-cols-2 gap-1.5">
            <PrimaryButton variant="ghost" className="min-h-7 px-2 py-1 text-xs" onClick={onUnknown}>
              {UI.unknown}
            </PrimaryButton>
            <PrimaryButton className="min-h-7 px-2 py-1 text-xs" onClick={onKnown}>
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

      <VocabIllustration imageKey={visible.imageKey} className="shadow-card" />

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
