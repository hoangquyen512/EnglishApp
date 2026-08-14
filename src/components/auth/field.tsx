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
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      {hint ? <span className="text-xs font-normal text-stone-500">{hint}</span> : null}
      <span className="relative">
        <input
          id={inputId}
          className={`h-10 w-full rounded-xl border bg-white px-3 text-base text-stone-950 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500 ${
            error ? "border-rose-700" : "border-stone-100"
          } ${trailing ? "pr-11" : ""} ${className}`}
          {...props}
        />
        {trailing}
      </span>
    </label>
  );
}
