import { useCallback, useEffect, useState } from "react";
import { UI } from "../../constants/ui";
import { getNextCard, submitAnswer } from "../../features/vocabulary";
import { dismissStudyPopup } from "../../features/scheduler";
import { useAppStore } from "../../stores/app-store";
import { useAuthStore } from "../../stores/auth-store";
import { useStudyStore } from "../../stores/study-store";
import type { QuizCard, QuizChoice } from "../../types";
import { PetAvatar } from "../pet/pet-avatar";
import { PrimaryButton } from "../shared/primary-button";
import { ChoiceButton } from "./choice-button";

export function FlashcardPopup() {
  const session = useAuthStore((state) => state.session);
  const authReady = useAuthStore((state) => state.ready);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const pet = useAppStore((state) => state.pet);
  const hydrate = useAppStore((state) => state.hydrate);
  const setPet = useAppStore((state) => state.setPet);
  const contentType = useStudyStore((state) => state.contentType);
  const topic = useStudyStore((state) => state.topic);
  const [card, setCard] = useState<QuizCard | null>(null);
  const [selected, setSelected] = useState<QuizChoice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCard = useCallback(async () => {
    setBusy(true);
    setError(null);
    setSelected(null);
    setRevealed(false);
    setFeedback(null);
    try {
      const next = await getNextCard(contentType, contentType === "phrase" ? topic : null);
      setCard(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : UI.noCard);
    } finally {
      setBusy(false);
    }
  }, [contentType, topic]);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (!session) {
      return;
    }
    void hydrate();
    void loadCard();
  }, [hydrate, loadCard, session]);

  async function onSubmit() {
    if (!card) {
      return;
    }
    if (!selected) {
      setFeedback(UI.needChoice);
      return;
    }
    setBusy(true);
    try {
      const result = await submitAnswer({
        contentType: card.contentType,
        contentId: card.contentId,
        selectedText: selected.text,
        topic: card.topic,
      });
      setRevealed(true);
      setPet(result.pet);
      setFeedback(result.isCorrect ? UI.correct : `${UI.incorrect}: ${card.correctAnswer}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : UI.noCard);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-stone-25">
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-stone-100 bg-white px-3 py-2"
      >
        <strong data-tauri-drag-region>{UI.popupTitle}</strong>
        <button type="button" onClick={() => void dismissStudyPopup()} className="text-sm text-terracotta-800">
          {UI.close}
        </button>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-auto p-4">
        {!authReady ? <p>{UI.loading}</p> : null}
        {authReady && !session ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-lg font-semibold">{UI.popupNeedLogin}</p>
            <PrimaryButton onClick={() => void dismissStudyPopup()}>{UI.close}</PrimaryButton>
          </div>
        ) : null}
        {session ? (
          <>
            {pet ? <PetAvatar pet={pet} size="md" /> : null}
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            {busy && !card ? <p>{UI.loading}</p> : null}
            {!busy && !card && !error ? <p>{UI.noCard}</p> : null}
            {card ? (
              <>
                <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                  <p className="text-xl font-bold">{card.prompt}</p>
                  {card.example ? <p className="mt-2 text-xs text-stone-500">{card.example}</p> : null}
                </div>
                <div className="grid gap-2">
                  {card.choices.map((choice) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      selected={selected?.id === choice.id}
                      revealed={revealed}
                      onSelect={(item) => {
                        if (!revealed) {
                          setSelected(item);
                        }
                      }}
                    />
                  ))}
                </div>
                {feedback ? <p className="text-center text-sm font-semibold">{feedback}</p> : null}
                {revealed ? (
                  <PrimaryButton onClick={() => void loadCard()}>{UI.nextCard}</PrimaryButton>
                ) : (
                  <PrimaryButton disabled={busy} onClick={() => void onSubmit()}>
                    {UI.submit}
                  </PrimaryButton>
                )}
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
