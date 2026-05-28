import type { MarketData, MarketName } from "./types";

const marketCache = new Map<string, MarketData>();

function cacheKey(symbol: string, market: MarketName) {
  return `${market}:${symbol}`.toUpperCase();
}

export function upsertMarketCache(item: MarketData) {
  marketCache.set(cacheKey(item.symbol, item.market), {
    ...item,
    source: item.market,
    stale: false,
    updatedAt: new Date().toISOString(),
  });
}

export function findMarketCache(symbol: string, market: MarketName): MarketData | undefined {
  const cached = marketCache.get(cacheKey(symbol, market));

  if (!cached) return undefined;

  return {
    ...cached,
    source: "CACHE",
    stale: true,
  };
}
