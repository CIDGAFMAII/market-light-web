import { NextResponse } from "next/server";
import { findMarketCache, upsertMarketCache } from "@/lib/market/cache";
import { getDemoMarketItemBySymbol } from "@/lib/market/demo-provider";
import { fetchTwseStock } from "@/lib/market/providers/twse";

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
  const symbol = searchParams.get("symbol") || "2330";
  const exchange = searchParams.get("exchange") || "tse";
  const includeDebug = searchParams.get("debug") === "true";

  try {
    const result = await fetchTwseStock({ symbol, exchange });

    if (result.success && result.data) {
      upsertMarketCache(result.data);
      return NextResponse.json({
        success: true,
        ...result.data,
        updatedAt: new Date().toISOString(),
        ...(includeDebug ? { debug: result.debug } : {}),
      }, noStoreResponse);
    }

    const cached = findMarketCache(symbol, "TWSE");
    if (cached) {
      const isNoLatestPrice = result.message === "TWSE latest trade price unavailable";
      return NextResponse.json({
        success: true,
        ...cached,
        source: "CACHE",
        quoteQuality: "fallback",
        stale: true,
        message: isNoLatestPrice ? "TWSE latest trade price unavailable, using cache" : cached.message,
        warning: isNoLatestPrice ? "TWSE 暫無最新成交價，已使用 fallback" : "Real provider failed, using cache",
        providerMessage: result.message,
        updatedAt: new Date().toISOString(),
        ...(includeDebug ? { debug: result.debug } : {}),
      }, noStoreResponse);
    }

    const fallback = getDemoMarketItemBySymbol(symbol, "TWSE");
    const isNoLatestPrice = result.message === "TWSE latest trade price unavailable";
    return NextResponse.json({
      success: true,
      ...fallback,
      source: "DEMO",
      quoteQuality: "fallback",
      stale: true,
      message: isNoLatestPrice ? "TWSE latest trade price unavailable, using demo fallback" : fallback.message,
      warning: isNoLatestPrice ? "TWSE 暫無最新成交價，已使用 fallback" : "Real provider failed, using demo fallback",
      providerMessage: result.message,
      updatedAt: new Date().toISOString(),
      ...(includeDebug ? { debug: result.debug } : {}),
    }, noStoreResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "TWSE",
        message: error instanceof Error ? error.message : "TWSE route failed",
      },
      { status: 200, ...noStoreResponse },
    );
  }
}
