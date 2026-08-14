import { PetAvatar } from "../pet/pet-avatar";
import type { PetState } from "../../types";

export function CompanionPetButton(props: {
  pet: PetState;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="relative flex items-center justify-center p-2" data-tauri-drag-region>
      <button
        type="button"
        aria-label={props.label}
        onClick={props.onToggle}
        className="relative border-0 bg-transparent p-0"
      >
        <PetAvatar pet={props.pet} size="lg" />
      </button>
    </div>
  );
}
