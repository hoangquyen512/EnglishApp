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
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : "bg-white text-orange-800 border border-orange-200 hover:bg-orange-50";
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
