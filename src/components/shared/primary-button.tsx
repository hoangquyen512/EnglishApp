import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

export function PrimaryButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: PrimaryButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-clay text-white hover:bg-clay-dark"
      : "bg-paper text-ink border border-line hover:bg-cream";
  return (
    <button
      className={`min-h-10 rounded-xl px-4 py-2 text-base font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
