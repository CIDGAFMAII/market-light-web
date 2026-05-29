"use client";

import { getDirectionTextClass } from "@/lib/market/color";
import { PriceColorModeToggle, usePriceColorMode } from "./price-color-mode-toggle";

type MarketDetailPricePanelProps = {
  price: number;
  change: number;
  changePercent: number;
};

export function MarketDetailPricePanel({ price, change, changePercent }: MarketDetailPricePanelProps) {
  const { priceColorMode, setPriceColorMode } = usePriceColorMode();
  const priceColor = getDirectionTextClass(changePercent, priceColorMode);
  const sign = changePercent > 0 ? "+" : "";

  return (
    <div className="sm:col-span-2">
      <div className="mb-3 flex justify-end">
        <PriceColorModeToggle mode={priceColorMode} onChange={setPriceColorMode} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <ColoredDataLine label="price" value={price.toLocaleString()} valueClassName={priceColor} />
        <ColoredDataLine label="change" value={`${sign}${change.toFixed(2)}`} valueClassName={priceColor} />
        <ColoredDataLine label="changePercent" value={`${sign}${changePercent.toFixed(2)}%`} valueClassName={priceColor} />
      </div>
    </div>
  );
}

function ColoredDataLine({ label, value, valueClassName }: { label: string; value: string; valueClassName: string }) {
  return (
    <div className="rounded border border-cyan/10 bg-black/25 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      <div className={`mt-2 font-mono ${valueClassName}`}>{value}</div>
    </div>
  );
}
