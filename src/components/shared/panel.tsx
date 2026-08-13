import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-[20px] bg-paper p-4 shadow-card ring-1 ring-line ${className}`}>
      {children}
    </section>
  );
}
