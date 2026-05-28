import type { ReactNode } from "react";

type CyberCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "cyan" | "pink" | "yellow";
};

const toneMap = {
  cyan: "border-[var(--border-cyan)] shadow-cyan",
  pink: "border-[var(--border-pink)] shadow-pink",
  yellow: "border-[var(--border-yellow)] shadow-yellow",
};

export function CyberCard({ children, className = "", tone = "cyan" }: CyberCardProps) {
  return (
    <section
      className={`rounded-lg border bg-[rgba(12,15,20,0.82)] backdrop-blur-sm ${toneMap[tone]} ${className}`}
    >
      {children}
    </section>
  );
}
