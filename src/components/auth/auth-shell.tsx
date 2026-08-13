import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-25 px-8 py-8">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-3 grid h-[72px] w-[72px] place-items-center rounded-[20px] bg-stone-50 text-3xl">
          🐾
        </div>
        <h1 className="font-display text-[30px] font-bold tracking-tight text-stone-950">{title}</h1>
        <p className="mt-1 text-stone-500">{subtitle}</p>
      </div>
      <div className="w-full max-w-[400px] rounded-[20px] border border-stone-100 bg-white p-6">
        {children}
      </div>
    </main>
  );
}
