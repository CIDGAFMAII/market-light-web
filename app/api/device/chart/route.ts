import { NextResponse } from "next/server";
import {
  buildDemoChart,
  fetchOkxCandlesChart,
  isDetailChartRange,
  type DetailChartRange,
} from "@/lib/market/providers/okx-candles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreResponse = {
  headers: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get("symbol") ?? "OKX:BTC-USDT";
  const rangeParam = searchParams.get("range");
  const range: DetailChartRange = isDetailChartRange(rangeParam) ? rangeParam : "15m";
  const parsed = parseChartSymbol(symbolParam);

  if (parsed.market === "OKX") {
    const chart = await fetchOkxCandlesChart({ symbol: parsed.symbol, range });
    return NextResponse.json({ success: true, ...chart }, noStoreResponse);
  }

  const chart = buildDemoChart({
    symbol: parsed.symbol,
    market: "TWSE",
    range,
  });

  return NextResponse.json({ success: true, ...chart }, noStoreResponse);
}

function parseChartSymbol(value: string) {
  const normalized = value.trim().toUpperCase();
  const [market, symbol] = normalized.includes(":") ? normalized.split(":") : ["OKX", normalized];

  if (market === "OKX" && /^[A-Z0-9]+-[A-Z0-9]+$/.test(symbol)) {
    return { market: "OKX" as const, symbol };
  }

  if (market === "TWSE" && /^\d+$/.test(symbol)) {
    return { market: "TWSE" as const, symbol };
  }

  return { market: "TWSE" as const, symbol: symbol || "2330" };
}
