import { getMarketStatus, type MarketStatus } from "../market-status";
import { findMarketCache, upsertMarketCache } from "./cache";
import { getDemoMarketItem } from "./demo-provider";
import { fetchOkxTicker } from "./providers/okx-ticker";
import { createOkxErrorMarketData, getOkxSymbolValidation } from "./validation";
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
    const warnings: string[] = [];
    const items = await Promise.all(enabledTargets.map(async (target) => {
      if (target.market === "TWSE") return getDemoMarketItem(target);

      const validation = await getOkxSymbolValidation(target.symbol);
      if (!validation.valid) {
        warnings.push(`OKX ${target.symbol} invalid; skipped demo fallback`);
        return createOkxErrorMarketData({
          symbol: target.symbol,
          displayName: target.displayName,
          message: validation.message,
        });
      }

      return getDemoMarketItem(target);
    }));
    return {
      success: true,
      updatedAt: new Date().toISOString(),
      marketMood: computeMarketMood(items),
      sourceMode: warnings.length > 0 ? "REAL_WITH_FALLBACK" : "DEMO",
      items,
      warnings,
    };
  }

  const warnings: string[] = [];
  const items = await Promise.all(
    enabledTargets.map(async (target) => {
      if (target.market === "TWSE") {
        warnings.push("台股即時行情需正式授權資料源，目前以 Demo 資料展示流程。");
        return {
          ...getDemoMarketItem(target),
          source: "DEMO" as const,
          quoteQuality: "fallback" as const,
          stale: true,
          message: "Taiwan stock demo data for competition flow",
        };
      }

      const validation = await getOkxSymbolValidation(target.symbol);
      if (!validation.valid) {
        warnings.push(`OKX ${target.symbol} invalid`);
        return createOkxErrorMarketData({
          symbol: target.symbol,
          displayName: target.displayName,
          message: validation.message,
        });
      }

      const result = await fetchOkxTicker({
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
        return {
          ...cached,
          source: "CACHE" as const,
          quoteQuality: "fallback" as const,
          stale: true,
        };
      }

      warnings.push(`${target.market} ${target.symbol} failed, no cache available`);
      return createOkxErrorMarketData({
        symbol: target.symbol,
        displayName: target.displayName,
        message: result.message || "OKX ticker failed",
      });
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
