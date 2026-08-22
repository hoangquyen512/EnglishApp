import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "text";
}

export function PrimaryButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: PrimaryButtonProps) {
  const styles = {
    primary:
      "border-0 bg-gradient-to-br from-cosmic-primary-2 via-clay to-cosmic-pink text-white shadow-glow hover:brightness-110",
    ghost: "bg-paper/80 text-ink border border-line hover:bg-cosmic-surface/80 backdrop-blur-sm",
    danger: "bg-transparent text-rose hover:bg-rose/10 border border-rose/35",
    text: "bg-transparent text-cosmic-sub hover:text-cosmic-warm hover:underline px-1 min-h-8",
  }[variant];
  return (
    <button
      className={`min-h-10 rounded-xl px-4 py-2 text-base font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
