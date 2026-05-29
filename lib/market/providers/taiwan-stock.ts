import { fetchFinMindDailyStock } from "./finmind";
import { fetchTwseStock } from "./twse";
import type { ProviderResult } from "../types";

export async function fetchTaiwanStockQuote({
  symbol,
  exchange,
  displayName,
}: {
  symbol: string;
  exchange?: string;
  displayName?: string;
}): Promise<ProviderResult> {
  const twseResult = await fetchTwseStock({ symbol, exchange, displayName });
  if (twseResult.success && twseResult.data?.quoteQuality === "latest") {
    return twseResult;
  }

  if (twseResult.success && twseResult.data?.quoteQuality === "partial") {
    return twseResult;
  }

  const finMindResult = await fetchFinMindDailyStock({ symbol, displayName });
  if (finMindResult.success && finMindResult.data) {
    return finMindResult;
  }

  return {
    success: false,
    source: "TWSE",
    message: twseResult.message || finMindResult.message || "Taiwan stock providers failed",
    warning: [twseResult.message, finMindResult.message].filter(Boolean).join("；"),
    debug: {
      twse: twseResult.debug,
      finmind: finMindResult.debug,
    },
  };
}
