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
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${normalizedExchange}_${encodeURIComponent(
    symbol,
  )}.tw&json=1&delay=0`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://mis.twse.com.tw/stock/index.jsp",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        source: "TWSE",
        message: `TWSE HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as TwseResponse;
    const raw = payload.msgArray?.[0];

    if (!raw) {
      return {
        success: false,
        source: "TWSE",
        message: payload.rtmessage || "TWSE response missing msgArray[0]",
      };
    }

    if (!raw.z || raw.z === "-") {
      return {
        success: false,
        source: "TWSE",
        message: "No latest trade price",
      };
    }

    const price = Number(raw.z);
    const yesterday = Number(raw.y);

    if (!Number.isFinite(price) || !Number.isFinite(yesterday) || yesterday === 0) {
      return {
        success: false,
        source: "TWSE",
        message: "TWSE price parse failed",
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
      source: "TWSE",
      status,
      message: statusMessage(status),
      stale: false,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      source: "TWSE",
      data: item,
    };
  } catch (error) {
    return {
      success: false,
      source: "TWSE",
      message: error instanceof Error ? error.message : "TWSE fetch failed",
    };
  }
}

function parseTwseNumber(value: string | undefined, fallback = 0) {
  if (!value || value === "-") return fallback;
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}
