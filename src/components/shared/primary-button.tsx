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
    primary: "bg-terracotta-700 text-white hover:bg-terracotta-800",
    ghost: "bg-transparent text-stone-950 border border-stone-100 hover:border-stone-800",
    danger: "bg-transparent text-rose-700 hover:bg-rose-50 border border-transparent",
    text: "bg-transparent text-terracotta-800 hover:underline px-1 min-h-8",
  }[variant];
  return (
    <button
      className={`inline-flex min-h-10 min-w-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
