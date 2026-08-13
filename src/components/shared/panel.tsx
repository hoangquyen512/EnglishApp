import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100 ${className}`}>
      {children}
    </section>
  );
}
