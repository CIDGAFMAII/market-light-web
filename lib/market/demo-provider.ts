import { marketItems } from "../demo-data";
import type { MarketData, MarketName, MarketTarget } from "./types";

export function getDemoMarketItem(target: MarketTarget): MarketData {
  const demo =
    marketItems.find((item) => item.symbol.toUpperCase() === target.symbol.toUpperCase()) ??
    marketItems[0];
  const yesterday = demo.price - demo.change;

  return {
    symbol: target.symbol,
    market: target.market,
    displayName: target.displayName,
    price: demo.price,
    yesterday,
    change: demo.change,
    changePercent: demo.changePercent,
    high: Math.max(demo.price, yesterday),
    low: Math.min(demo.price, yesterday),
    volume: 0,
    tradeTime: demo.tradedAt,
    source: "DEMO",
    status: demo.status,
    message: demo.mood,
    stale: true,
    updatedAt: new Date().toISOString(),
  };
}

export function getDemoMarketItems(targets: MarketTarget[]) {
  return targets.map(getDemoMarketItem);
}

export function getDemoMarketItemBySymbol(symbol: string, market: MarketName) {
  return getDemoMarketItem({
    symbol,
    market,
    displayName: symbol,
    exchange: market === "TWSE" ? "tse" : undefined,
  });
}
