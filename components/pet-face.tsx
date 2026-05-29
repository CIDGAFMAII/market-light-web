import { petFaces, statusTone, type MarketStatus } from "@/lib/market-status";
import { getDirectionRgbColor, type PriceColorMode } from "@/lib/market/color";

type PetFaceProps = {
  status: MarketStatus;
  name?: string;
  size?: "sm" | "md" | "lg";
  colorMode?: PriceColorMode;
};

const colorMap = {
  red: "text-red-200 border-red-500/25 bg-red-500/10",
  green: "text-emerald-200 border-emerald-500/25 bg-emerald-500/10",
  yellow: "text-amber-200 border-amber-400/25 bg-amber-400/10",
  muted: "text-slate-300 border-slate-600/70 bg-slate-900/70",
  cyan: "text-indigo-200 border-indigo-400/25 bg-indigo-500/10",
};

const sizeMap = {
  sm: "text-xl px-3 py-2",
  md: "text-3xl px-5 py-4",
  lg: "text-5xl px-7 py-6",
};

export function PetFace({ status, name = "PET", size = "md", colorMode }: PetFaceProps) {
  const tone = colorMode ? getDirectionRgbColor(status, colorMode) : statusTone(status);

  return (
    <div className={`rounded-2xl border text-center ${colorMap[tone]} ${sizeMap[size]}`}>
      <div className="font-mono leading-none">{petFaces[status]}</div>
      <div className="mt-2 text-xs font-semibold text-slate-300">{name}</div>
    </div>
  );
}
