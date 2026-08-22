import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`yume-panel rounded-[20px] p-4 ${className}`}>{children}</section>
  );
}
