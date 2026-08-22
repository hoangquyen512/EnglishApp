import { useState } from "react";
import { SPECIES_PREVIEW_SRC } from "../../assets/pet-art";
import { SPRITE_EMOJI } from "../../constants/pet";
import { DEFAULT_PET_NAME, UI } from "../../constants/ui";
import type { PetSpecies } from "../../types";

interface OnboardingScreenProps {
  species: PetSpecies[];
  onChoose: (species: PetSpecies, petName: string) => void;
}

function previewSrc(speciesId: number, index: number): string | undefined {
  return SPECIES_PREVIEW_SRC[speciesId] ?? SPECIES_PREVIEW_SRC[index + 1];
}

function previewEmoji(index: number): string {
  const keys = ["cat_adult", "fox_adult", "dragon_adult"] as const;
  return SPRITE_EMOJI[keys[index] ?? "cat_adult"] ?? "🐾";
}

export function OnboardingScreen({ species, onChoose }: OnboardingScreenProps) {
  const [petName, setPetName] = useState(DEFAULT_PET_NAME);
  const trimmed = petName.trim() || DEFAULT_PET_NAME;

  return (
    <main className="yume-shell yume-onboarding">
      <div className="yume-shell__noise" aria-hidden />

      <div className="yume-onboarding__stage">
        <header className="yume-onboarding__header">
          <h1>{UI.onboardingTitle}</h1>
          <p>{UI.onboardingSubtitle}</p>
        </header>

        <label className="yume-onboarding__name" htmlFor="onboarding-pet-name">
          <span>{UI.petNameLabel}</span>
          <input
            id="onboarding-pet-name"
            type="text"
            value={petName}
            placeholder={UI.petNamePlaceholder}
            onChange={(event) => setPetName(event.target.value)}
            autoComplete="off"
          />
        </label>

        <div className="yume-onboarding__grid">
          {species.map((item, index) => {
            const src = previewSrc(item.id, index);
            return (
              <article key={item.id} className="yume-panel yume-onboarding__card">
                <div className="yume-onboarding__art" aria-hidden>
                  {src ? (
                    <img src={src} alt="" draggable={false} />
                  ) : (
                    <span className="yume-onboarding__emoji">{previewEmoji(index)}</span>
                  )}
                </div>
                <h2>{item.speciesName}</h2>
                <p>{item.description}</p>
                <button
                  type="button"
                  className="yume-btn yume-btn--primary yume-onboarding__choose"
                  onClick={() => onChoose(item, trimmed)}
                >
                  {UI.choosePet}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
