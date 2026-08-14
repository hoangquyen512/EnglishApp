import { SPECIES_PREVIEW_SRC, SPRITE_ART_SRC } from "../../assets/pet-art";
import { MOOD_EMOJI, SPRITE_EMOJI } from "../../constants/pet";
import { MOOD_LABELS } from "../../constants/ui";
import type { PetState } from "../../types";

interface PetAvatarProps {
  pet: PetState;
  size?: "md" | "lg";
  /** `float` = ChatGPT-style mascot (no cream disc / ring). */
  variant?: "desk" | "float";
}

function adultArtSrc(pet: PetState): string | undefined {
  if (pet.speciesId != null && SPECIES_PREVIEW_SRC[pet.speciesId]) {
    return SPECIES_PREVIEW_SRC[pet.speciesId];
  }
  if (pet.spriteKey) {
    const adultKey = pet.spriteKey.replace(/_(egg|young)$/, "_adult");
    return SPRITE_ART_SRC[adultKey] ?? SPRITE_ART_SRC[pet.spriteKey];
  }
  return undefined;
}

export function PetAvatar({ pet, size = "lg", variant = "desk" }: PetAvatarProps) {
  const src = adultArtSrc(pet);
  const emoji = pet.spriteKey ? SPRITE_EMOJI[pet.spriteKey] : "🐾";
  const box = size === "lg" ? "h-32 w-32" : "h-14 w-14";
  const emojiSize = size === "lg" ? "text-6xl" : "text-3xl";
  const moodSize = size === "lg" ? "text-lg" : "text-sm";
  const shell =
    variant === "float"
      ? `relative mx-auto flex ${box} items-center justify-center overflow-visible bg-transparent p-0 pet-bob pet-float-shadow`
      : `relative mx-auto flex ${box} items-center justify-center overflow-hidden rounded-full bg-cream p-2 ring-1 ring-line pet-bob`;

  return (
    <div className={shell} title={`${pet.petName} · ${MOOD_LABELS[pet.mood]}`}>
      {src ? (
        <img src={src} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
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
