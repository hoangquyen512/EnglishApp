import { useUiStore } from "../../stores/ui-store";
import { FlashcardPopup } from "./flashcard-popup";

/** Full-screen modal flashcard for web/mobile (no separate window). */
export function FlashcardModal() {
  const { flashcardOpen, closeFlashcard } = useUiStore();

  if (!flashcardOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-h-[85dvh] sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Flashcard study"
      >
        <FlashcardPopup onClose={closeFlashcard} variant="modal" />
      </div>
    </div>
  );
}
