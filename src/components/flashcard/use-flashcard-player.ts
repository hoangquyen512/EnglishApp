import { useCallback, useEffect, useRef, useState } from "react";
import {
  CARD_INTERVAL_MS,
  cancelSpeech,
  cardProgress,
  cardRemainingMs,
  getStudyDeck,
  nextDeckIndex,
  previousDeckIndex,
  shouldAdvanceCard,
  speakWord,
} from "../../features/vocabulary";
import type { ContentType, PhraseTopic, StudyFlashcard } from "../../types";

export function useFlashcardPlayer(input: {
  contentType: ContentType;
  topic: PhraseTopic | null;
  autoSpeak: boolean;
  onAdvance?: (card: StudyFlashcard) => void;
}) {
  const [deck, setDeck] = useState<StudyFlashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState(CARD_INTERVAL_MS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startedAt = useRef(Date.now());
  const pausedMs = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const onAdvanceRef = useRef(input.onAdvance);
  onAdvanceRef.current = input.onAdvance;

  const card = deck[index] ?? null;

  const resetTimer = useCallback(() => {
    startedAt.current = Date.now();
    pausedMs.current = 0;
    pausedAt.current = paused ? Date.now() : null;
    setProgress(0);
    setRemaining(CARD_INTERVAL_MS);
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getStudyDeck(input.contentType, input.contentType === "phrase" ? input.topic : null)
      .then((next) => {
        if (!cancelled) {
          setDeck(next);
          setIndex(0);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "error");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [input.contentType, input.topic]);

  useEffect(() => {
    resetTimer();
    if (card && input.autoSpeak) {
      speakWord(card.word);
    }
    return () => cancelSpeech();
  }, [card?.contentId, card?.word, input.autoSpeak, resetTimer]);

  const goTo = useCallback(
    (nextIndex: number, announce = false) => {
      const current = deck[index];
      if (announce && current) {
        onAdvanceRef.current?.(current);
      }
      setIndex(nextIndex);
    },
    [deck, index],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = cardRemainingMs({
        startedAt: startedAt.current,
        now: Date.now(),
        pausedMs: pausedMs.current,
        pausedAt: pausedAt.current,
      });
      setRemaining(left);
      setProgress(cardProgress(left));
      if (shouldAdvanceCard(left) && !pausedAt.current && deck.length > 0) {
        startedAt.current = Date.now();
        pausedMs.current = 0;
        const current = deck[index];
        if (current) {
          onAdvanceRef.current?.(current);
        }
        setIndex((value) => nextDeckIndex(value, deck.length));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [deck, index]);

  const togglePause = useCallback(() => {
    setPaused((wasPaused) => {
      if (wasPaused) {
        if (pausedAt.current) {
          pausedMs.current += Date.now() - pausedAt.current;
        }
        pausedAt.current = null;
        return false;
      }
      pausedAt.current = Date.now();
      return true;
    });
  }, []);

  return {
    card,
    deck,
    index,
    paused,
    progress,
    remaining,
    loading,
    error,
    togglePause,
    next: (options?: { silent?: boolean }) =>
      goTo(nextDeckIndex(index, deck.length), options?.silent !== true),
    prev: () => goTo(previousDeckIndex(index, deck.length), false),
    speak: () => {
      if (card) {
        speakWord(card.word);
      }
    },
  };
}
