import type { QuizChoice } from "../../types";

interface ChoiceButtonProps {
  choice: QuizChoice;
  selected: boolean;
  revealed: boolean;
  onSelect: (choice: QuizChoice) => void;
}

export function ChoiceButton({ choice, selected, revealed, onSelect }: ChoiceButtonProps) {
  let ring = "ring-orange-100";
  if (revealed && choice.isCorrect) {
    ring = "ring-2 ring-green-500 bg-green-50";
  } else if (revealed && selected) {
    ring = "ring-2 ring-red-400 bg-red-50";
  } else if (selected) {
    ring = "ring-2 ring-orange-500";
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(choice)}
      className={`w-full rounded-xl bg-white px-3 py-3 text-left text-sm ring-1 ${ring}`}
    >
      {choice.text}
    </button>
  );
}
