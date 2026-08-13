import { MOOD_LABELS, UI } from "../../constants/ui";
import { xpProgressPercent } from "../../features/pet-state";
import type { PetState } from "../../types";
import { PetAvatar } from "./pet-avatar";

interface PetStatusProps {
  pet: PetState;
}

export function PetStatus({ pet }: PetStatusProps) {
  const percent = xpProgressPercent(pet.xp);
  const hint = pet.mood === "hungry" ? UI.hungryHint : pet.mood === "sad" ? UI.sadHint : null;
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-full rounded-[20px] bg-cream p-4 ring-1 ring-line">
        <PetAvatar pet={pet} />
      </div>
      <div>
        <h2 className="text-xl font-bold">{pet.petName}</h2>
        <p className="text-sm text-muted">
          {pet.speciesName ?? ""} · {MOOD_LABELS[pet.mood]}
        </p>
        {hint ? <p className="mt-2 text-sm text-clay-dark">{hint}</p> : null}
      </div>
      <div className="grid w-full grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-cream p-2">
          <div className="text-xs text-muted">{UI.level}</div>
          <div className="font-bold tabular">{pet.level}</div>
        </div>
        <div className="rounded-xl bg-cream p-2">
          <div className="text-xs text-muted">{UI.streak}</div>
          <div className="font-bold tabular">{pet.streakDays}</div>
        </div>
      </div>
      <div className="w-full">
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>{UI.xp}</span>
          <span className="tabular">{pet.xp}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
          <div className="h-full bg-clay" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
