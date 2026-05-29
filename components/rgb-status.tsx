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
  red: "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.34)]",
  green: "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.34)]",
  cyan: "bg-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.32)]",
  yellow: "bg-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.28)]",
  muted: "bg-slate-600 shadow-[0_0_20px_rgba(148,163,184,0.16)]",
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6">
      <div className="relative grid h-36 w-36 place-items-center rounded-full border border-slate-600/70 bg-slate-950">
        <div className={`rgb-pulse h-20 w-20 rounded-full ${rgbMap[activeColor]}`} />
        <div className="absolute inset-4 rounded-full border border-slate-700/60" />
      </div>
      <div className="mt-5 text-center">
        <div className="text-sm font-semibold text-slate-100">{label}</div>
        <div className="mt-2 text-xs font-medium text-slate-300">
          {colorLabels[activeColor]} / {statusLabels[status]}
        </div>
      </div>
    </div>
  );
}
