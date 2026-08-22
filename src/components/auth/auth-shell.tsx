import type { ReactNode } from "react";
import { publicUrl } from "../../lib/public-url";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="yume-shell relative flex min-h-screen flex-col items-center justify-center px-8 py-8">
      <div className="yume-shell__noise" aria-hidden />
      <div className="relative z-[1] mb-5 flex flex-col items-center text-center">
        <div className="mb-3 grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[20px] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-solid)] shadow-[var(--shadow-glow-soft)]">
          <img src={publicUrl("/yume-icon.png")} alt="" width={72} height={72} />
        </div>
        <h1 className="font-display text-[30px] font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 max-w-sm text-muted">{subtitle}</p>
      </div>
      <div className="yume-panel relative z-[1] w-full max-w-[400px] p-6">{children}</div>
    </main>
  );
}
