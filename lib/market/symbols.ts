import { defaultMarketList } from "./default-list";
import type { MarketName, MarketTarget } from "./types";

export function parseSymbolsParam(value: string | null): MarketTarget[] {
  if (!value) return defaultMarketList;

  const targets = parseSymbolTokens(value.split(","));

  return targets.length > 0 ? targets : defaultMarketList;
}

export function parseSymbolTokens(tokens: string[]): MarketTarget[] {
  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token): MarketTarget | undefined => {
      const [rawMarket, rawSymbol] = token.split(":");
      const market = rawMarket?.toUpperCase() as MarketName;
      const symbol = rawSymbol?.trim().toUpperCase();

      if (!symbol || !isValidSyncSymbolToken(`${market}:${symbol}`)) return undefined;

      const known = defaultMarketList.find(
        (item) => item.market === market && item.symbol.toUpperCase() === symbol,
      );

      return {
        symbol,
        market,
        displayName: known?.displayName ?? (market === "OKX" ? symbol.split("-")[0] : symbol),
        exchange: market === "TWSE" ? known?.exchange ?? "tse" : undefined,
        enabled: true,
      };
    })
    .filter((target): target is MarketTarget => Boolean(target));
}

export function normalizeSyncSymbols(tokens: unknown): { syncSymbols: string[]; invalidSymbols: string[] } {
  if (!Array.isArray(tokens)) {
    return { syncSymbols: [], invalidSymbols: ["syncSymbols must be an array"] };
  }

  const invalidSymbols: string[] = [];
  const seen = new Set<string>();
  const syncSymbols: string[] = [];

  for (const token of tokens) {
    if (typeof token !== "string") {
      invalidSymbols.push(String(token));
      continue;
    }

    const normalized = normalizeSyncSymbolToken(token);
    if (!normalized) {
      invalidSymbols.push(token);
      continue;
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      syncSymbols.push(normalized);
    }
  }

  return { syncSymbols, invalidSymbols };
}

export function isValidSyncSymbolToken(token: string) {
  return /^TWSE:\d+$/.test(token) || /^OKX:[A-Z0-9]+-[A-Z0-9]+$/.test(token);
}

function normalizeSyncSymbolToken(token: string) {
  const normalized = token.trim().toUpperCase();
  return isValidSyncSymbolToken(normalized) ? normalized : "";
}
