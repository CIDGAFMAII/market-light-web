import type { MarketStatus } from "../market-status";

export type MarketSource = "TWSE" | "OKX" | "DEMO" | "CACHE";
export type MarketName = "TWSE" | "OKX";

export type MarketData = {
  symbol: string;
  market: MarketName;
  displayName: string;
  price: number;
  yesterday: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  tradeTime: string;
  source: MarketSource;
  status: MarketStatus;
  message: string;
  stale?: boolean;
  updatedAt?: string;
};

export type ProviderResult<T = MarketData> = {
  success: boolean;
  source: MarketSource;
  data?: T;
  message?: string;
  warning?: string;
};

export type MarketTarget = {
  symbol: string;
  market: MarketName;
  displayName: string;
  exchange?: "tse" | "otc";
  enabled?: boolean;
};
