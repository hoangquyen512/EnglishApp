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
      className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 py-1 pl-1 pr-3 backdrop-blur-sm hover:border-clay hover:shadow-glow"
      aria-label={label}
    >
      <UserAvatar session={session} size="sm" />
      <span className={`text-sm ${named ? "text-ink" : "text-muted"}`}>{label}</span>
    </button>
  );
}
