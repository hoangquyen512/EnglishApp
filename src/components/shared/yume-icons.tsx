import type { ReactNode, SVGProps } from "react";

/** Shared outline icon set — stroke 1.75, round caps, no fills (Yume cosmic UI). */
const STROKE = 1.75;

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function YumeIcon({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </YumeIcon>
  );
}

export function IconPet(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="13" r="5" />
      <circle cx="7" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </YumeIcon>
  );
}

export function IconMissions(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M8 4h8v3H8z" />
      <path d="M6 7h12v13H6z" />
      <path d="M9 11h6M9 15h4" />
    </YumeIcon>
  );
}

export function IconCommunity(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="10" r="2.5" />
      <path d="M3.5 19c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4" />
      <path d="M13.5 19c.5-1.8 1.8-3 3.8-3 1.5 0 2.7.7 3.4 1.9" />
    </YumeIcon>
  );
}

export function IconProfile(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5" />
    </YumeIcon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </YumeIcon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M6 16h12l-1-2V10a5 5 0 0 0-10 0v4l-1 2z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </YumeIcon>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2.9-1.2 1.8V14" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </YumeIcon>
  );
}

export function IconBook(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </YumeIcon>
  );
}

export function IconChat(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6z" />
    </YumeIcon>
  );
}

export function IconStory(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M5 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z" />
      <path d="M17 6h2a2 2 0 0 1 2 2v12l-4-1.7" />
    </YumeIcon>
  );
}

export function IconPerson(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5" />
    </YumeIcon>
  );
}

export function IconMail(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </YumeIcon>
  );
}

export function IconAt(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M16 12v1.2a2.3 2.3 0 0 0 4.2 1.2A7.5 7.5 0 1 1 18.5 7" />
      <circle cx="12" cy="12" r="2.8" />
    </YumeIcon>
  );
}

export function IconStudy(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5z" />
      <path d="M7 12.2v3.3c0 .9 2.2 2.5 5 2.5s5-1.6 5-2.5v-3.3" />
      <path d="M21 10v5" />
    </YumeIcon>
  );
}

export function IconEdit(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </YumeIcon>
  );
}

export function IconLock(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </YumeIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H4" />
      <path d="M14 19h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
    </YumeIcon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <YumeIcon size={props.size ?? 16} {...props}>
      <path d="m9 6 6 6-6 6" />
    </YumeIcon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <YumeIcon size={props.size ?? 12} {...props}>
      <path d="M5 12.5 10 17.5 19 7" />
    </YumeIcon>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M13 2 4 14h7l-1 8 10-14h-7l1-6z" />
    </YumeIcon>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <YumeIcon {...props}>
      <path d="M12 2.5 13.8 9 20.5 10.8 13.8 12.6 12 19.5 10.2 12.6 3.5 10.8 10.2 9 12 2.5z" />
    </YumeIcon>
  );
}

export function IconHeart(props: IconProps & { filled?: boolean }) {
  const { filled = false, ...rest } = props;
  return (
    <YumeIcon {...rest} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.4 10.4 19C5.4 14.6 2 11.5 2 7.8A4.6 4.6 0 0 1 6.7 3.2 5 5 0 0 1 12 5.5a5 5 0 0 1 5.3-2.3A4.6 4.6 0 0 1 22 7.8c0 3.7-3.4 6.8-8.4 11.2L12 20.4z" />
    </YumeIcon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <YumeIcon size={props.size ?? 15} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </YumeIcon>
  );
}

export function IconShare(props: IconProps) {
  return (
    <YumeIcon size={props.size ?? 15} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
    </YumeIcon>
  );
}

export function IconSpeaker(props: IconProps) {
  return (
    <YumeIcon size={props.size ?? 14} {...props}>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" />
    </YumeIcon>
  );
}
