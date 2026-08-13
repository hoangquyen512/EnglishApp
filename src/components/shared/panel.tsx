import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-stone-100 ${className}`}>
      {children}
    </section>
  );
}
