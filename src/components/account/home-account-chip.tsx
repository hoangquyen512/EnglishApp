import type { SessionDto } from "../../features/auth";
import { UserAvatar } from "./user-avatar";

interface HomeAccountChipProps {
  session: SessionDto;
  onOpen: () => void;
}

export function HomeAccountChip({ session, onOpen }: HomeAccountChipProps) {
  const named = Boolean(session.displayName?.trim());
  const label = named ? session.displayName!.trim() : session.username;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-2 rounded-full border border-stone-100 bg-white py-1 pl-1 pr-3 hover:border-stone-800"
      aria-label={label}
    >
      <UserAvatar session={session} size="sm" />
      <span className={`text-sm ${named ? "text-stone-800" : "text-stone-500"}`}>{label}</span>
    </button>
  );
}
