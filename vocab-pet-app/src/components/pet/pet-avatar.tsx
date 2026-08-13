import type { PetMood } from "../../types";
import { UI_STRINGS } from "../../constants/ui-strings";

const MOOD_EMOJI: Record<PetMood, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  hungry: "🍽️",
};

interface PetAvatarProps {
  mood: PetMood;
  level: number;
  size?: "sm" | "lg";
}

export function PetAvatar({ mood, level, size = "lg" }: PetAvatarProps) {
  const emojiSize = size === "lg" ? "text-6xl" : "text-3xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${emojiSize} flex h-24 w-24 items-center justify-center rounded-full bg-amber-100`}
        aria-label={`Pet mood: ${UI_STRINGS.mood[mood]}`}
      >
        {MOOD_EMOJI[mood]}
      </div>
      <span className="text-sm font-medium text-gray-600">Lv.{level}</span>
    </div>
  );
}
