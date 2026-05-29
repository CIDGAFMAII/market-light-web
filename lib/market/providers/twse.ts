import { fetchWithTimeout } from "../../fetch-with-timeout";
import { getMarketStatus } from "../../market-status";
import { roundNumber, statusMessage } from "../message";
import type { MarketData, ProviderResult } from "../types";

type TwseRawItem = {
  c?: string;
  n?: string;
  z?: string;
  y?: string;
  o?: string;
  h?: string;
  l?: string;
  v?: string;
  d?: string;
  t?: string;
};

type TwseResponse = {
  msgArray?: TwseRawItem[];
  rtmessage?: string;
};

type TwseProviderDebug = {
  requestedSymbol: string;
  requestedExchange: string;
  providerUrl: string;
  twseRtMessage?: string;
  rawItem?: TwseRawItem;
  rawZ?: string;
  rawY?: string;
  rawH?: string;
  rawL?: string;
  rawT?: string;
  rawD?: string;
  responseOk?: boolean;
  httpStatus?: number;
};

export async function fetchTwseStock({
  symbol,
  exchange = "tse",
  displayName,
}: {
  symbol: string;
  exchange?: string;
  displayName?: string;
}): Promise<ProviderResult> {
  const normalizedExchange = exchange === "otc" ? "otc" : "tse";
  const timestamp = Date.now();
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${normalizedExchange}_${encodeURIComponent(
    symbol,
  )}.tw&json=1&delay=0&_=${timestamp}`;
  const baseDebug: TwseProviderDebug = {
    requestedSymbol: symbol,
    requestedExchange: normalizedExchange,
    providerUrl: url,
  };

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://mis.twse.com.tw/stock/index.jsp",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        source: "TWSE",
        message: `TWSE HTTP ${response.status}`,
        debug: {
          ...baseDebug,
          responseOk: response.ok,
          httpStatus: response.status,
        },
      };
    }

    const payload = (await response.json()) as TwseResponse;
    const raw = payload.msgArray?.[0];
    const debug: TwseProviderDebug = {
      ...baseDebug,
      twseRtMessage: payload.rtmessage,
      rawItem: raw,
      rawZ: raw?.z,
      rawY: raw?.y,
      rawH: raw?.h,
      rawL: raw?.l,
      rawT: raw?.t,
      rawD: raw?.d,
      responseOk: response.ok,
      httpStatus: response.status,
    };

    if (!raw) {
      return {
        success: false,
        source: "TWSE",
        message: payload.rtmessage || "TWSE response missing msgArray[0]",
        debug,
      };
    }

    if (!raw.z || raw.z === "-") {
      const yesterday = Number(raw.y);
      if (Number.isFinite(yesterday) && yesterday > 0) {
        const partialItem: MarketData = {
          symbol: raw.c || symbol,
          market: "TWSE",
          displayName: displayName || raw.n || symbol,
          price: roundNumber(yesterday, 2),
          yesterday: roundNumber(yesterday, 2),
          change: 0,
          changePercent: 0,
          high: parseTwseNumber(raw.h, roundNumber(yesterday, 2)),
          low: parseTwseNumber(raw.l, roundNumber(yesterday, 2)),
          volume: parseTwseNumber(raw.v, 0),
          tradeTime: raw.t || "Now",
          tradeDate: raw.d,
          source: "TWSE",
          quoteQuality: "partial",
          status: "calm",
          message: "TWSE latest trade price unavailable; partial intraday data",
          stale: true,
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          source: "TWSE",
          data: partialItem,
          warning: "TWSE latest trade price unavailable",
          debug,
        };
      }

      return {
        success: false,
        source: "TWSE",
        message: "TWSE latest trade price unavailable",
        debug,
      };
    }

    const price = Number(raw.z);
    const yesterday = Number(raw.y);

    if (!Number.isFinite(price) || !Number.isFinite(yesterday) || yesterday === 0) {
      return {
        success: false,
        source: "TWSE",
        message: "TWSE price parse failed",
        debug,
      };
    }

    const change = price - yesterday;
    const changePercent = (change / yesterday) * 100;
    const status = getMarketStatus({ changePercent });
    const item: MarketData = {
      symbol: raw.c || symbol,
      market: "TWSE",
      displayName: displayName || raw.n || symbol,
      price: roundNumber(price, 2),
      yesterday: roundNumber(yesterday, 2),
      change: roundNumber(change, 2),
      changePercent: roundNumber(changePercent, 2),
      high: parseTwseNumber(raw.h),
      low: parseTwseNumber(raw.l),
      volume: parseTwseNumber(raw.v, 0),
      tradeTime: raw.t || "Now",
      tradeDate: raw.d,
      source: "TWSE",
      quoteQuality: "latest",
      status,
      message: statusMessage(status),
      stale: false,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      source: "TWSE",
      data: item,
      debug,
    };
  } catch (error) {
    return {
      success: false,
      source: "TWSE",
      message: error instanceof Error ? error.message : "TWSE fetch failed",
      debug: baseDebug,
    };
  }
}

function parseTwseNumber(value: string | undefined, fallback = 0) {
  if (!value || value === "-") return fallback;
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
