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
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-700/65 pb-3">
        <h2 className="text-base font-bold tracking-tight text-slate-50">
          {title}
        </h2>
        <span className="rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-200">
          {label}
        </span>
      </div>
      {children}
    </CyberCard>
  );
}
