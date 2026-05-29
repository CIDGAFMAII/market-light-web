import type { MarketStatus } from "@/lib/market-status";
import { statusTone } from "@/lib/market-status";
import { getDirectionRgbColor, type PriceColorMode } from "@/lib/market/color";

export type OLEDPreviewProps = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  status?: MarketStatus;
  colorMode?: PriceColorMode;
};

const toneClass = {
  red: "text-red-200",
  green: "text-emerald-200",
  yellow: "text-amber-200",
  muted: "text-slate-300",
  cyan: "text-indigo-200",
};

export function OLEDPreview({ line1, line2, line3, line4, status = "calm", colorMode }: OLEDPreviewProps) {
  const tone = colorMode ? getDirectionRgbColor(status, colorMode) : statusTone(status);
  const lines = [line1, line2, line3, line4];

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-950 p-3 shadow-[inset_0_0_20px_rgba(15,23,42,0.7)]">
      <div
        className={`oled-scanline aspect-[2/1] rounded-xl border border-indigo-400/20 bg-[#030712] px-5 py-4 font-mono ${toneClass[tone]}`}
      >
        <div className="flex h-full flex-col justify-between text-[clamp(0.82rem,2vw,1.12rem)] leading-none">
          {lines.map((line) => (
            <div key={line} className="truncate">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-300">
        <span>128x64 OLED</span>
        <span>I2C 模擬</span>
      </div>
    </div>
  );
}
