import { defaultMarketList } from "./default-list";
import type { MarketName, MarketTarget } from "./types";

export function parseSymbolsParam(value: string | null): MarketTarget[] {
  if (!value) return defaultMarketList;

  const targets = value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token): MarketTarget | undefined => {
      const [rawMarket, rawSymbol] = token.split(":");
      const market = rawMarket?.toUpperCase() as MarketName;
      const symbol = rawSymbol?.trim();

      if (!symbol || (market !== "TWSE" && market !== "OKX")) return undefined;

      const known = defaultMarketList.find(
        (item) => item.market === market && item.symbol.toUpperCase() === symbol.toUpperCase(),
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

  return targets.length > 0 ? targets : defaultMarketList;
}
