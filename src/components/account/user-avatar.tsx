import type { SessionDto } from "../../features/auth";

interface UserAvatarProps {
  session: Pick<SessionDto, "username" | "displayName" | "avatarUrl">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function initial(session: UserAvatarProps["session"]): string {
  const source = session.displayName?.trim() || session.username;
  return source.charAt(0).toUpperCase();
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-base",
  lg: "h-24 w-24 text-[32px]",
};

export function UserAvatar({ session, size = "sm", className = "" }: UserAvatarProps) {
  const label = session.displayName?.trim() || session.username;
  const photo = session.avatarUrl && session.avatarUrl !== "memory:avatar" ? session.avatarUrl : null;
  return (
    <span
      className={`grid flex-none place-items-center overflow-hidden rounded-full border border-stone-100 bg-terracotta-700 font-bold text-white ${SIZES[size]} ${className}`}
      aria-label={label}
    >
      {photo ? (
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        initial(session)
      )}
    </span>
  );
}
