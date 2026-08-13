import { useState } from "react";
import { UI } from "../../constants/ui";
import { Field } from "./field";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string | null;
  autoComplete?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      type={visible ? "text" : "password"}
      value={value}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      trailing={
        <button
          type="button"
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-stone-800 hover:bg-stone-50"
          aria-label={visible ? UI.hidePassword : UI.showPassword}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.9 5.1A10 10 0 0121 12c-.6 1-1.3 1.9-2.1 2.7" />
              <path d="M6.1 6.1C4.2 7.6 2.8 9.6 2 12c1.7 4.5 6 7.5 10 7.5 1.4 0 2.8-.3 4-.9" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      }
    />
  );
}
