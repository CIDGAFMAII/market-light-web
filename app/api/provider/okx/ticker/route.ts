import { NextResponse } from "next/server";
import { findMarketCache, upsertMarketCache } from "@/lib/market/cache";
import { getDemoMarketItemBySymbol } from "@/lib/market/demo-provider";
import { fetchOkxTicker } from "@/lib/market/providers/okx-ticker";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instId = searchParams.get("instId") || "BTC-USDT";

  try {
    const result = await fetchOkxTicker({ instId });

    if (result.success && result.data) {
      upsertMarketCache(result.data);
      return NextResponse.json({
        success: true,
        ...result.data,
      });
    }

    const cached = findMarketCache(instId, "OKX");
    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
        warning: "Real provider failed, using cache",
        providerMessage: result.message,
      });
    }

    const fallback = getDemoMarketItemBySymbol(instId, "OKX");
    return NextResponse.json({
      success: true,
      ...fallback,
      warning: "Real provider failed, using demo fallback",
      providerMessage: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "OKX",
        message: error instanceof Error ? error.message : "OKX ticker route failed",
      },
      { status: 200 },
    );
  }
}
