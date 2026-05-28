import { getMarketStatus, type MarketStatus } from "../market-status";
import { findMarketCache, upsertMarketCache } from "./cache";
import { getDemoMarketItem, getDemoMarketItems } from "./demo-provider";
import { fetchOkxTicker } from "./providers/okx-ticker";
import { fetchTwseStock } from "./providers/twse";
import type { MarketData, MarketTarget } from "./types";

export type MarketCollectionResult = {
  success: true;
  updatedAt: string;
  marketMood: MarketStatus;
  sourceMode: "DEMO" | "REAL" | "REAL_WITH_FALLBACK";
  items: MarketData[];
  warnings: string[];
};

export async function getMarketCollection({
  targets,
  demoMode = false,
}: {
  targets: MarketTarget[];
  demoMode?: boolean;
}): Promise<MarketCollectionResult> {
  const enabledTargets = targets.filter((target) => target.enabled !== false);

  if (demoMode) {
    const items = getDemoMarketItems(enabledTargets);
    return {
      success: true,
      updatedAt: new Date().toISOString(),
      marketMood: computeMarketMood(items),
      sourceMode: "DEMO",
      items,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  const items = await Promise.all(
    enabledTargets.map(async (target) => {
      const result =
        target.market === "TWSE"
          ? await fetchTwseStock({
              symbol: target.symbol,
              exchange: target.exchange,
              displayName: target.displayName,
            })
          : await fetchOkxTicker({
              instId: target.symbol,
              displayName: target.displayName,
            });

      if (result.success && result.data) {
        upsertMarketCache(result.data);
        return result.data;
      }

      const cached = findMarketCache(target.symbol, target.market);
      if (cached) {
        warnings.push(`${target.market} ${target.symbol} failed, using cache`);
        if (target.market === "TWSE" && result.message === "No latest trade price") {
          return {
            ...cached,
            status: "closed" as const,
            message: "Market closed",
          };
        }
        return cached;
      }

      warnings.push(`${target.market} ${target.symbol} failed, using demo fallback`);
      return getDemoMarketItem(target);
    }),
  );

  return {
    success: true,
    updatedAt: new Date().toISOString(),
    marketMood: computeMarketMood(items),
    sourceMode: warnings.length > 0 ? "REAL_WITH_FALLBACK" : "REAL",
    items,
    warnings,
  };
}

function computeMarketMood(items: MarketData[]): MarketStatus {
  if (items.some((item) => item.status === "error")) return "error";
  if (items.some((item) => item.status === "up_alert")) return "up_alert";
  if (items.some((item) => item.status === "down_alert")) return "down_alert";

  const average =
    items.reduce((sum, item) => sum + item.changePercent, 0) / Math.max(items.length, 1);
  return getMarketStatus({ changePercent: average });
}
