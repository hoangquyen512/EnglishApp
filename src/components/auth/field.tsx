import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  trailing?: ReactNode;
}

export function Field({ label, hint, error, trailing, id, className = "", ...props }: FieldProps) {
  const inputId = id ?? label;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-sm font-semibold text-cosmic-sub">{label}</span>
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
      <span className="relative">
        <input
          id={inputId}
          className={`h-10 w-full rounded-xl border bg-[color:var(--color-bg)]/70 px-3 text-base text-ink backdrop-blur-sm transition focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-muted ${
            error ? "border-rose" : "border-line"
          } ${trailing ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {trailing}
      </span>
    </label>
  );
}
