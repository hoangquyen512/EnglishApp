import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-cream disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconSpeaker() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 10v4h4l5 4V6L8 10H4z" />
      <path d="M16 9c1.2 1 1.8 2.2 1.8 3s-.6 2-1.8 3" />
      <path d="M18.5 7c1.8 1.6 2.7 3.4 2.7 5s-.9 3.4-2.7 5" />
    </svg>
  );
}

export function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="7" y="6" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="13.5" y="6" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 6v12l10-6-10-6z" />
    </svg>
  );
}

export function IconSkip() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6l8 6-8 6V6z" fill="currentColor" />
      <path d="M18 6v12" />
    </svg>
  );
}

export function IconPrev() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 6l-8 6 8 6V6z" fill="currentColor" />
      <path d="M6 6v12" />
    </svg>
  );
}
