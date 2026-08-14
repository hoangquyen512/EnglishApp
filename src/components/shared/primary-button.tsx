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
    primary: "bg-clay text-white hover:bg-clay-dark",
    ghost: "bg-paper text-ink border border-line hover:bg-cream",
    danger: "bg-transparent text-rose hover:bg-rose/10 border border-transparent",
    text: "bg-transparent text-clay hover:underline px-1 min-h-8",
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
