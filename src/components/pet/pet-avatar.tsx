import { SPRITE_ART_SRC } from "../../assets/pet-art";
import { MOOD_EMOJI, SPRITE_EMOJI } from "../../constants/pet";
import { MOOD_LABELS } from "../../constants/ui";
import type { PetState } from "../../types";

interface PetAvatarProps {
  pet: PetState;
  size?: "md" | "lg";
}

export function PetAvatar({ pet, size = "lg" }: PetAvatarProps) {
  const src = pet.spriteKey ? SPRITE_ART_SRC[pet.spriteKey] : undefined;
  const emoji = pet.spriteKey ? SPRITE_EMOJI[pet.spriteKey] : "🥚";
  const box = size === "lg" ? "h-32 w-32" : "h-14 w-14";
  const emojiSize = size === "lg" ? "text-6xl" : "text-3xl";
  const moodSize = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div
      className={`relative mx-auto flex ${box} items-center justify-center overflow-hidden rounded-full bg-cream p-2 ring-1 ring-line pet-bob`}
      title={`${pet.petName} · ${MOOD_LABELS[pet.mood]}`}
    >
      {src ? (
        <img src={src} alt="" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className={emojiSize} aria-hidden>
          {emoji ?? "🐾"}
        </span>
      )}
      <span className="sr-only">{MOOD_LABELS[pet.mood]}</span>
      <span className={`absolute -bottom-1 -right-1 ${moodSize}`} aria-hidden>
        {MOOD_EMOJI[pet.mood]}
      </span>
    </div>
  );
}
