import { MOOD_EMOJI, SPRITE_EMOJI } from "../../constants/pet";
import { MOOD_LABELS } from "../../constants/ui";
import type { PetState } from "../../types";

interface PetAvatarProps {
  pet: PetState;
  size?: "md" | "lg";
}

export function PetAvatar({ pet, size = "lg" }: PetAvatarProps) {
  const sprite = pet.spriteKey ? SPRITE_EMOJI[pet.spriteKey] : "🥚";
  const box = size === "lg" ? "h-32 w-32 text-6xl" : "h-14 w-14 text-3xl";
  return (
    <div
      className={`relative mx-auto flex ${box} items-center justify-center rounded-full bg-cream ring-1 ring-line pet-bob`}
      title={`${pet.petName} · ${MOOD_LABELS[pet.mood]}`}
    >
      <span aria-hidden>{sprite ?? "🐾"}</span>
      <span className="sr-only">{MOOD_LABELS[pet.mood]}</span>
      <span className="absolute -bottom-1 -right-1 text-lg" aria-hidden>
        {MOOD_EMOJI[pet.mood]}
      </span>
    </div>
  );
}
