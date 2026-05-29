import { statusLabels, statusTone, type MarketStatus } from "@/lib/market-status";
import { getDirectionRgbColor, type PriceColorMode } from "@/lib/market/color";

type StatusBadgeProps = {
  status: MarketStatus;
  className?: string;
  colorMode?: PriceColorMode;
};

const classes = {
  red: "border-red-500/30 bg-red-500/10 text-red-200",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  yellow: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  muted: "border-slate-600/70 bg-slate-800/75 text-slate-200",
  cyan: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
};

export function StatusBadge({ status, className = "", colorMode }: StatusBadgeProps) {
  const tone = colorMode ? getDirectionRgbColor(status, colorMode) : statusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[tone]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
