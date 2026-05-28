import type { ReactNode } from "react";
import { CyberCard } from "./cyber-card";

type TerminalPanelProps = {
  title: string;
  label?: string;
  children: ReactNode;
  className?: string;
};

export function TerminalPanel({ title, label = "SYS", children, className = "" }: TerminalPanelProps) {
  return (
    <CyberCard className={`p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-[rgba(0,255,255,0.16)] pb-3">
        <h2 className="font-orbitron text-sm font-bold uppercase tracking-[0.22em] text-cyan">
          {title}
        </h2>
        <span className="rounded border border-[var(--border-pink)] px-2 py-1 text-xs uppercase text-pink">
          {label}
        </span>
      </div>
      {children}
    </CyberCard>
  );
}
