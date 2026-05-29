import { statusLabels, type MarketStatus } from "@/lib/market-status";
import {
  defaultPriceColorMode,
  getDirectionRgbColor,
  type DirectionRgbColor,
  type PriceColorMode,
} from "@/lib/market/color";

type RGBStatusProps = {
  status: MarketStatus;
  color?: DirectionRgbColor;
  colorMode?: PriceColorMode;
  label?: string;
};

const rgbMap: Record<DirectionRgbColor, string> = {
  red: "bg-red-500 shadow-[0_0_48px_rgba(239,68,68,0.75)]",
  green: "bg-green-500 shadow-[0_0_48px_rgba(34,197,94,0.75)]",
  cyan: "bg-cyan shadow-[0_0_48px_rgba(0,255,255,0.72)]",
  yellow: "bg-yellow shadow-[0_0_48px_rgba(250,204,21,0.7)]",
  muted: "bg-slate-600 shadow-[0_0_24px_rgba(148,163,184,0.25)]",
};

const colorLabels: Record<DirectionRgbColor, string> = {
  red: "紅色",
  green: "綠色",
  cyan: "青色",
  yellow: "黃色",
  muted: "低亮度",
};

export function RGBStatus({ status, color, colorMode = defaultPriceColorMode, label = "RGB 燈號" }: RGBStatusProps) {
  const activeColor = color ?? getDirectionRgbColor(status, colorMode);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-cyan)] bg-black/35 p-6">
      <div className="relative grid h-36 w-36 place-items-center rounded-full border border-white/10 bg-slate-950">
        <div className={`rgb-pulse h-20 w-20 rounded-full ${rgbMap[activeColor]}`} />
        <div className="absolute inset-4 rounded-full border border-white/10" />
      </div>
      <div className="mt-5 text-center">
        <div className="font-orbitron text-sm uppercase tracking-[0.24em] text-cyan">{label}</div>
        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
          {colorLabels[activeColor]} / {statusLabels[status]}
        </div>
      </div>
    </div>
  );
}
