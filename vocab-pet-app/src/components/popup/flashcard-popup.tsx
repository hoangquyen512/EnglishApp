import { useEffect } from "react";
import { useQuizStore } from "../../stores/quiz-store";
import { usePetStore } from "../../stores/pet-store";
import { hidePopupWindow } from "../../features/scheduler";
import { UI_STRINGS, PET_CONFIG } from "../../constants/ui-strings";
import { LoadingSpinner } from "../shared/loading-spinner";
import { PetAvatar } from "../pet/pet-avatar";

export function FlashcardPopup() {
  const {
    question,
    selectedIndex,
    result,
    isLoading,
    error,
    loadQuestion,
    selectOption,
    submit,
    reset,
  } = useQuizStore();
  const refreshPet = usePetStore((s) => s.refresh);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (result) {
      void refreshPet();
    }
  }, [result, refreshPet]);

  const handleNext = async () => {
    reset();
    await loadQuestion();
  };

  const handleClose = async () => {
    await hidePopupWindow();
  };

  if (isLoading && !question) {
    return <LoadingSpinner label={UI_STRINGS.app.loading} />;
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-600">{UI_STRINGS.popup.noWords}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white p-4">
      <header className="mb-4 flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold text-indigo-700">
          {UI_STRINGS.popup.title}
        </h1>
        <button
          type="button"
          onClick={() => void handleClose()}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          {UI_STRINGS.popup.close}
        </button>
      </header>

      <div className="mb-4 flex justify-center">
        <PetAvatar mood="happy" level={1} size="sm" />
      </div>

      <p className="mb-2 text-center text-sm text-gray-500">
        {UI_STRINGS.popup.prompt}
      </p>
      <p className="mb-6 text-center text-3xl font-bold text-gray-900">
        {question.vocabulary.word}
      </p>

      <div className="flex flex-1 flex-col gap-2">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === question.correctIndex;
          let optionClass =
            "rounded-lg border px-4 py-3 text-left text-sm transition-colors ";

          if (result) {
            if (isCorrectOption) {
              optionClass += "border-green-500 bg-green-50 text-green-800";
            } else if (isSelected) {
              optionClass += "border-red-400 bg-red-50 text-red-800";
            } else {
              optionClass += "border-gray-200 text-gray-500";
            }
          } else if (isSelected) {
            optionClass += "border-indigo-500 bg-indigo-50 text-indigo-900";
          } else {
            optionClass += "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50";
          }

          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(result)}
              onClick={() => selectOption(index)}
              className={optionClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {result ? (
          <>
            <p
              className={`text-center text-sm font-medium ${
                result.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.isCorrect
                ? UI_STRINGS.popup.correct.replace(
                    "{xp}",
                    String(PET_CONFIG.xpPerCorrect),
                  )
                : UI_STRINGS.popup.incorrect}
              {result.leveledUp ? ` Level up! Lv.${result.newLevel}` : ""}
            </p>
            <button
              type="button"
              onClick={() => void handleNext()}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Next word
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={selectedIndex === null || isLoading}
            onClick={() => void submit()}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {UI_STRINGS.popup.submit}
          </button>
        )}
      </div>
    </div>
  );
}
