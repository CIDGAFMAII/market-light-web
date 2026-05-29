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
    <div className="grid gap-3 border-b border-slate-700/60 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr_0.9fr] md:items-center">
      <div>
        <div className="font-mono text-base font-bold text-slate-50">{item.symbol}</div>
        <div className="text-xs font-medium text-slate-300">{item.name}</div>
      </div>
      <div className={`font-mono text-lg ${priceColor}`}>{item.price.toLocaleString()}</div>
      <div className={priceColor}>
        {sign}
        {item.change.toFixed(2)} / {sign}
        {item.changePercent.toFixed(2)}%
      </div>
      <div className="text-slate-400">
        成交 {item.tradedAt}
        <br />
        更新 {item.updatedAt}
      </div>
      <div className="text-indigo-200">{item.mood}</div>
      <div className="flex items-center gap-2 md:justify-end">
        <span className="badge border-slate-700/60 bg-slate-950/60 text-slate-300">{item.source}</span>
        <StatusBadge status={item.status} colorMode={colorMode} />
      </div>
    </div>
  );
}
