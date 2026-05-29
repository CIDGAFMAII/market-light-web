import { petFaces, statusTone, type MarketStatus } from "@/lib/market-status";
import { getDirectionRgbColor, type PriceColorMode } from "@/lib/market/color";

type PetFaceProps = {
  status: MarketStatus;
  name?: string;
  size?: "sm" | "md" | "lg";
  colorMode?: PriceColorMode;
};

const colorMap = {
  red: "text-red-300 border-red-500/40 shadow-[0_0_28px_rgba(239,68,68,0.18)]",
  green: "text-green-300 border-green-500/40 shadow-[0_0_28px_rgba(34,197,94,0.18)]",
  yellow: "text-yellow border-yellow-400/40 shadow-yellow",
  muted: "text-muted border-gray-500/35",
  cyan: "text-cyan border-cyan/40 shadow-cyan",
};

const sizeMap = {
  sm: "text-xl px-3 py-2",
  md: "text-3xl px-5 py-4",
  lg: "text-5xl px-7 py-6",
};

export function PetFace({ status, name = "PET", size = "md", colorMode }: PetFaceProps) {
  const tone = colorMode ? getDirectionRgbColor(status, colorMode) : statusTone(status);

  return (
    <div className={`rounded-lg border bg-black/45 text-center ${colorMap[tone]} ${sizeMap[size]}`}>
      <div className="font-mono leading-none">{petFaces[status]}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">{name}</div>
    </div>
  );
}
