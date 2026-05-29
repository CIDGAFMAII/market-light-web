import { statusLabels, statusTone, type MarketStatus } from "@/lib/market-status";
import { getDirectionRgbColor, type PriceColorMode } from "@/lib/market/color";

type StatusBadgeProps = {
  status: MarketStatus;
  className?: string;
  colorMode?: PriceColorMode;
};

const classes = {
  red: "border-red-500/45 bg-red-500/10 text-red-300",
  green: "border-green-500/45 bg-green-500/10 text-green-300",
  yellow: "border-yellow-400/45 bg-yellow-400/10 text-yellow",
  muted: "border-gray-500/45 bg-gray-500/10 text-muted",
  cyan: "border-cyan/45 bg-cyan/10 text-cyan",
};

export function StatusBadge({ status, className = "", colorMode }: StatusBadgeProps) {
  const tone = colorMode ? getDirectionRgbColor(status, colorMode) : statusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-xs uppercase tracking-[0.18em] ${classes[tone]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
