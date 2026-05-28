import type { MarketStatus } from "@/lib/market-status";
import { statusTone } from "@/lib/market-status";

export type OLEDPreviewProps = {
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  status?: MarketStatus;
};

const toneClass = {
  red: "text-red-300 shadow-[0_0_32px_rgba(239,68,68,0.2)]",
  green: "text-green-300 shadow-[0_0_32px_rgba(34,197,94,0.2)]",
  yellow: "text-yellow shadow-yellow",
  muted: "text-muted",
  cyan: "text-cyan shadow-cyan",
};

export function OLEDPreview({ line1, line2, line3, line4, status = "calm" }: OLEDPreviewProps) {
  const tone = statusTone(status);
  const lines = [line1, line2, line3, line4];

  return (
    <div className="rounded-xl border border-slate-700 bg-[#050608] p-3 shadow-[inset_0_0_16px_rgba(255,255,255,0.04)]">
      <div
        className={`oled-scanline aspect-[2/1] rounded-md border border-cyan/25 bg-black px-5 py-4 font-mono ${toneClass[tone]}`}
      >
        <div className="flex h-full flex-col justify-between text-[clamp(0.82rem,2vw,1.12rem)] leading-none">
          {lines.map((line) => (
            <div key={line} className="truncate">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>128x64 OLED</span>
        <span>I2C 模擬</span>
      </div>
    </div>
  );
}
