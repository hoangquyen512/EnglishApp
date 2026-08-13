import { UI } from "../../constants/ui";
import { SPRITE_EMOJI } from "../../constants/pet";
import type { PetSpecies } from "../../types";
import { PrimaryButton } from "../shared/primary-button";

const PREVIEW_SPRITES = ["cat_egg", "fox_egg", "dragon_egg"] as const;

interface OnboardingScreenProps {
  species: PetSpecies[];
  onChoose: (species: PetSpecies) => void;
}

export function OnboardingScreen({ species, onChoose }: OnboardingScreenProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-black">{UI.onboardingTitle}</h1>
        <p className="mt-1 text-orange-800/80">{UI.onboardingSubtitle}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {species.map((item, index) => (
          <article key={item.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
            <div className="flex h-24 items-center justify-center rounded-2xl bg-orange-50 text-5xl">
              {SPRITE_EMOJI[PREVIEW_SPRITES[index] ?? "cat_egg"]}
            </div>
            <h2 className="text-lg font-bold">{item.speciesName}</h2>
            <p className="flex-1 text-sm text-orange-800/80">{item.description}</p>
            <PrimaryButton onClick={() => onChoose(item)}>{UI.choosePet}</PrimaryButton>
          </article>
        ))}
      </div>
    </main>
  );
}
