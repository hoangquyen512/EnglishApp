import { MOOD_LABELS, UI } from "../../constants/ui";
import { xpProgressPercent } from "../../features/pet-state";
import type { PetState } from "../../types";
import { PetAvatar } from "./pet-avatar";

interface PetStatusProps {
  pet: PetState;
}

export function PetStatus({ pet }: PetStatusProps) {
  const percent = xpProgressPercent(pet.xp);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <PetAvatar pet={pet} />
      <div>
        <h2 className="text-xl font-bold">{pet.petName}</h2>
        <p className="text-sm text-orange-800/80">
          {pet.speciesName ?? ""} · {MOOD_LABELS[pet.mood]}
        </p>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-orange-50 p-2">
          <div className="text-xs text-orange-700">{UI.level}</div>
          <div className="font-bold">{pet.level}</div>
        </div>
        <div className="rounded-xl bg-orange-50 p-2">
          <div className="text-xs text-orange-700">{UI.xp}</div>
          <div className="font-bold">{pet.xp}</div>
        </div>
        <div className="rounded-xl bg-orange-50 p-2">
          <div className="text-xs text-orange-700">{UI.streak}</div>
          <div className="font-bold">{pet.streakDays}</div>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-orange-100">
        <div className="h-full bg-orange-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
