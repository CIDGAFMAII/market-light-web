import type { ReactNode } from "react";

type CyberCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "cyan" | "pink" | "yellow";
};

const toneMap = {
  cyan: "hover:border-indigo-400/35",
  pink: "hover:border-violet-400/35",
  yellow: "hover:border-amber-300/35",
};

export function CyberCard({ children, className = "", tone = "cyan" }: CyberCardProps) {
  return (
    <section
      className={`surface-card transition duration-200 ${toneMap[tone]} ${className}`}
    >
      {children}
    </section>
  );
}
