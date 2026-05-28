import type { MarketTarget } from "./types";

export const defaultMarketList: MarketTarget[] = [
  { symbol: "2330", market: "TWSE", displayName: "TSMC", exchange: "tse", enabled: true },
  { symbol: "2317", market: "TWSE", displayName: "HONHAI", exchange: "tse", enabled: true },
  { symbol: "2454", market: "TWSE", displayName: "MediaTek", exchange: "tse", enabled: true },
  { symbol: "0050", market: "TWSE", displayName: "ETF 0050", exchange: "tse", enabled: true },
  { symbol: "BTC-USDT", market: "OKX", displayName: "BTC", enabled: true },
  { symbol: "ETH-USDT", market: "OKX", displayName: "ETH", enabled: true },
];

export const mockDeviceSettings = {
  demoMode: false,
};

export const mockDeviceStocks = defaultMarketList;
