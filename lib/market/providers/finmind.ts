import { fetchWithTimeout } from "../../fetch-with-timeout";
import { getMarketStatus } from "../../market-status";
import { roundNumber } from "../message";
import type { MarketData, ProviderResult } from "../types";

type FinMindResponse<T> = {
  status?: number;
  msg?: string;
  data?: T[];
};

type FinMindDailyRow = {
  date?: string;
  stock_id?: string;
  Trading_Volume?: number;
  Trading_money?: number;
  open?: number;
  max?: number;
  min?: number;
  close?: number;
  spread?: number;
  Trading_turnover?: number;
};

type FinMindCacheEntry = {
  item: MarketData;
  fetchedAt: number;
  debug: FinMindDebug;
};

type FinMindDebug = {
  requestUrl: string;
  status?: number;
  httpStatus?: number;
  rowCount?: number;
  latest?: FinMindDailyRow;
  previous?: FinMindDailyRow;
  tokenUsed: boolean;
  cacheHit: boolean;
  cacheExpired?: boolean;
  responseOk?: boolean;
  payloadMessage?: string;
};

type FinMindFiveSecondRow = {
  date?: string;
  Time?: string;
  TotalOrderBuy?: number;
  TotalOrderSell?: number;
  TotalDealBuy?: number;
  TotalDealSell?: number;
  TotalDealMoney?: number;
  TotalDealVolume?: number;
};

const defaultFinMindCacheTtlMs = 60_000;
const globalForFinMindCache = globalThis as typeof globalThis & {
  __marketLightFinMindCache?: Map<string, FinMindCacheEntry>;
};
const finMindCache = globalForFinMindCache.__marketLightFinMindCache ?? new Map<string, FinMindCacheEntry>();
globalForFinMindCache.__marketLightFinMindCache = finMindCache;

export async function fetchFinMindDailyStock({
  symbol,
  displayName,
}: {
  symbol: string;
  displayName?: string;
}): Promise<ProviderResult> {
  const today = formatDate(new Date());
  const startDate = formatDate(addDays(new Date(), -7));
  const tokenUsed = Boolean(process.env.FINMIND_TOKEN);
  const cacheKey = `FINMIND:${symbol}`.toUpperCase();
  const now = Date.now();
  const cacheTtlMs = getFinMindCacheTtlMs();
  const cached = finMindCache.get(cacheKey);
  const cacheExpired = cached ? now - cached.fetchedAt >= cacheTtlMs : undefined;
  const url = buildFinMindUrl({
    dataset: "TaiwanStockPrice",
    data_id: symbol,
    start_date: startDate,
    end_date: today,
  });

  if (cached && !cacheExpired) {
    return {
      success: true,
      source: "FINMIND",
      data: {
        ...cached.item,
        updatedAt: cached.item.updatedAt,
      },
      warning: "FinMind daily quote served from cache",
      debug: {
        ...cached.debug,
        requestUrl: url,
        tokenUsed,
        cacheHit: true,
        cacheExpired: false,
      },
    };
  }

  try {
    const response = await fetchWithTimeout(url, {
      headers: buildFinMindHeaders(),
      cache: "no-store",
    });
    const payload = (await response.json()) as FinMindResponse<FinMindDailyRow>;
    const rows = (payload.data ?? []).filter((row) => Number.isFinite(Number(row.close)));
    const latest = rows.at(-1);
    const previous = rows.length >= 2 ? rows.at(-2) : undefined;
    const debug: FinMindDebug = {
      requestUrl: url,
      status: payload.status,
      httpStatus: response.status,
      rowCount: rows.length,
      latest,
      previous,
      tokenUsed,
      cacheHit: false,
      cacheExpired,
      responseOk: response.ok,
      payloadMessage: payload.msg,
    };

    if (!response.ok || payload.status === 402 || (payload.status && payload.status >= 400)) {
      const message =
        payload.status === 402
          ? "FinMind API limit reached or payment required (status 402)"
          : payload.msg || `FinMind HTTP ${response.status}`;
      if (cached) {
        return {
          success: true,
          source: "FINMIND",
          data: {
            ...cached.item,
            stale: true,
            updatedAt: cached.item.updatedAt,
          },
          warning: `${message}; using stale FinMind cache`,
          debug: {
            ...debug,
            cacheHit: true,
            cacheExpired: true,
          },
        };
      }

      return {
        success: false,
        source: "FINMIND",
        message,
        debug,
      };
    }

    if (!latest) {
      if (cached) {
        return {
          success: true,
          source: "FINMIND",
          data: {
            ...cached.item,
            stale: true,
            updatedAt: cached.item.updatedAt,
          },
          warning: "FinMind daily response missing data; using stale FinMind cache",
          debug: {
            ...debug,
            cacheHit: true,
            cacheExpired: true,
          },
        };
      }

      return {
        success: false,
        source: "FINMIND",
        message: payload.msg || "FinMind daily response missing data",
        debug,
      };
    }

    const close = Number(latest.close);
    const previousClose = Number(previous?.close);
    const change = Number.isFinite(previousClose) && previousClose > 0
      ? close - previousClose
      : 0;
    const yesterday = Number.isFinite(previousClose) && previousClose > 0 ? previousClose : close;
    const changePercent = yesterday ? (change / yesterday) * 100 : 0;
    const status = getMarketStatus({ changePercent });
    const item: MarketData = {
      symbol,
      market: "TWSE",
      displayName: displayName || symbol,
      price: roundNumber(close, 2),
      yesterday: roundNumber(yesterday, 2),
      change: roundNumber(change, 2),
      changePercent: roundNumber(changePercent, 2),
      high: roundNumber(Number(latest.max) || close, 2),
      low: roundNumber(Number(latest.min) || close, 2),
      volume: Number(latest.Trading_Volume) || 0,
      tradeTime: "Daily",
      tradeDate: latest.date,
      source: "FINMIND",
      quoteQuality: "daily",
      status,
      message: "FinMind daily quote",
      stale: true,
      updatedAt: new Date().toISOString(),
    };
    finMindCache.set(cacheKey, {
      item,
      fetchedAt: now,
      debug,
    });

    return {
      success: true,
      source: "FINMIND",
      data: item,
      warning: "FinMind daily quote is not tick-level realtime",
      debug,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "FinMind daily fetch failed";
    if (cached) {
      return {
        success: true,
        source: "FINMIND",
        data: {
          ...cached.item,
          stale: true,
          updatedAt: cached.item.updatedAt,
        },
        warning: `${message}; using stale FinMind cache`,
        debug: {
          requestUrl: url,
          tokenUsed,
          cacheHit: true,
          cacheExpired: true,
          payloadMessage: message,
        },
      };
    }

    return {
      success: false,
      source: "FINMIND",
      message,
      debug: {
        requestUrl: url,
        tokenUsed,
        cacheHit: false,
        payloadMessage: message,
      },
    };
  }
}

export async function fetchFinMindFiveSecondStats({ date }: { date: string }) {
  const url = buildFinMindUrl({
    dataset: "TaiwanStockStatisticsOfOrderBookAndTrade",
    start_date: date,
  });

  try {
    const response = await fetchWithTimeout(url, {
      headers: buildFinMindHeaders(),
      cache: "no-store",
    });
    const payload = (await response.json()) as FinMindResponse<FinMindFiveSecondRow>;
    const latest = payload.data?.at(-1);

    return {
      success: response.ok && payload.status !== 402,
      source: "FINMIND",
      updatedAt: new Date().toISOString(),
      latestTime: latest?.Time,
      latest,
      data: payload.data ?? [],
      message: payload.msg,
      debug: { requestUrl: url, responseOk: response.ok, httpStatus: response.status, tokenUsed: Boolean(process.env.FINMIND_TOKEN) },
    };
  } catch (error) {
    return {
      success: false,
      source: "FINMIND",
      updatedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "FinMind five second stats fetch failed",
      debug: { requestUrl: url, tokenUsed: Boolean(process.env.FINMIND_TOKEN) },
    };
  }
}

function getFinMindCacheTtlMs() {
  const value = Number(process.env.FINMIND_CACHE_TTL_MS);
  return Number.isFinite(value) && value > 0 ? value : defaultFinMindCacheTtlMs;
}

function buildFinMindUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  return `https://api.finmindtrade.com/api/v4/data?${searchParams.toString()}`;
}

function buildFinMindHeaders() {
  const token = process.env.FINMIND_TOKEN;
  return {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
