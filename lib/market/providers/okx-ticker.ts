import { fetchWithTimeout } from "../../fetch-with-timeout";
import { getMarketStatus } from "../../market-status";
import { roundNumber, statusMessage } from "../message";
import type { MarketData, ProviderResult } from "../types";

type OkxTickerRaw = {
  instId?: string;
  last?: string;
  open24h?: string;
  high24h?: string;
  low24h?: string;
  vol24h?: string;
  ts?: string;
};

type OkxTickerResponse = {
  code?: string;
  msg?: string;
  data?: OkxTickerRaw[];
};

export async function fetchOkxTicker({
  instId,
  displayName,
}: {
  instId: string;
  displayName?: string;
}): Promise<ProviderResult> {
  if (!instId) {
    return {
      success: false,
      source: "OKX",
      message: "instId is required",
    };
  }

  const url = `https://www.okx.com/api/v5/market/ticker?instId=${encodeURIComponent(instId)}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return {
        success: false,
        source: "OKX",
        message: `OKX ticker HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as OkxTickerResponse;

    if (payload.code !== "0") {
      return {
        success: false,
        source: "OKX",
        message: payload.msg || `OKX ticker code ${payload.code}`,
      };
    }

    const raw = payload.data?.[0];
    if (!raw) {
      return {
        success: false,
        source: "OKX",
        message: "OKX ticker response missing data[0]",
      };
    }

    const price = Number(raw.last);
    const yesterday = Number(raw.open24h);

    if (!Number.isFinite(price) || !Number.isFinite(yesterday) || yesterday === 0) {
      return {
        success: false,
        source: "OKX",
        message: "OKX ticker price parse failed",
      };
    }

    const change = price - yesterday;
    const changePercent = (change / yesterday) * 100;
    const status = getMarketStatus({ changePercent });
    const symbol = raw.instId || instId;
    const item: MarketData = {
      symbol,
      market: "OKX",
      displayName: displayName || symbol.split("-")[0],
      price: roundNumber(price, 4),
      yesterday: roundNumber(yesterday, 4),
      change: roundNumber(change, 4),
      changePercent: roundNumber(changePercent, 2),
      high: parseOkxNumber(raw.high24h),
      low: parseOkxNumber(raw.low24h),
      volume: parseOkxNumber(raw.vol24h),
      tradeTime: formatOkxTime(raw.ts),
      source: "OKX",
      quoteQuality: "latest",
      status,
      message: statusMessage(status),
      stale: false,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      source: "OKX",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      source: "OKX",
      message: error instanceof Error ? error.message : "OKX ticker fetch failed",
    };
  }
}

function parseOkxNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatOkxTime(ts: string | undefined) {
  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp)) return "Now";

  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }).format(new Date(timestamp));
}
