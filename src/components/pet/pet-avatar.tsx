import { MOOD_EMOJI, SPRITE_EMOJI } from "../../constants/pet";
import type { PetState } from "../../types";

interface PetAvatarProps {
  pet: PetState;
  size?: "md" | "lg";
}

export function PetAvatar({ pet, size = "lg" }: PetAvatarProps) {
  const sprite = pet.spriteKey ? SPRITE_EMOJI[pet.spriteKey] : "🥚";
  const box = size === "lg" ? "h-32 w-32 text-6xl" : "h-16 w-16 text-3xl";
  return (
    <div className={`relative mx-auto flex ${box} items-center justify-center rounded-full bg-orange-100`}>
      <span aria-hidden>{sprite ?? "🐾"}</span>
      <span className="absolute -bottom-1 -right-1 text-xl" title={pet.mood}>
        {MOOD_EMOJI[pet.mood]}
      </span>
    </div>
  );
}
