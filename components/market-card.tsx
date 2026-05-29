import type { MarketItem } from "@/lib/demo-data";
import {
  defaultPriceColorMode,
  getDirectionTextClass,
  type PriceColorMode,
} from "@/lib/market/color";
import { StatusBadge } from "./status-badge";

type MarketCardProps = {
  item: MarketItem;
  colorMode?: PriceColorMode;
};

export function MarketCard({ item, colorMode = defaultPriceColorMode }: MarketCardProps) {
  const priceColor = getDirectionTextClass(item.changePercent, colorMode);
  const sign = item.changePercent > 0 ? "+" : "";

  return (
    <div className="grid gap-3 border-b border-cyan/10 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr_0.9fr] md:items-center">
      <div>
        <div className="font-orbitron text-base font-bold text-white">{item.symbol}</div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted">{item.name}</div>
      </div>
      <div className={`font-mono text-lg ${priceColor}`}>{item.price.toLocaleString()}</div>
      <div className={priceColor}>
        {sign}
        {item.change.toFixed(2)} / {sign}
        {item.changePercent.toFixed(2)}%
      </div>
      <div className="text-muted">
        成交 {item.tradedAt}
        <br />
        更新 {item.updatedAt}
      </div>
      <div className="text-cyan">{item.mood}</div>
      <div className="flex items-center gap-2 md:justify-end">
        <span className="rounded border border-white/10 px-2 py-1 text-xs text-muted">{item.source}</span>
        <StatusBadge status={item.status} colorMode={colorMode} />
      </div>
    </div>
  );
}
