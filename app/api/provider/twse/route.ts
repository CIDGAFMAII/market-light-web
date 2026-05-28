import { NextResponse } from "next/server";
import { findMarketCache, upsertMarketCache } from "@/lib/market/cache";
import { getDemoMarketItemBySymbol } from "@/lib/market/demo-provider";
import { fetchTwseStock } from "@/lib/market/providers/twse";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "2330";
  const exchange = searchParams.get("exchange") || "tse";

  try {
    const result = await fetchTwseStock({ symbol, exchange });

    if (result.success && result.data) {
      upsertMarketCache(result.data);
      return NextResponse.json({
        success: true,
        ...result.data,
      });
    }

    const cached = findMarketCache(symbol, "TWSE");
    if (cached) {
      const data =
        result.message === "No latest trade price"
          ? { ...cached, status: "closed" as const, message: "Market closed" }
          : cached;
      return NextResponse.json({
        success: true,
        ...data,
        warning: "Real provider failed, using cache",
        providerMessage: result.message,
      });
    }

    const fallback = getDemoMarketItemBySymbol(symbol, "TWSE");
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
        source: "TWSE",
        message: error instanceof Error ? error.message : "TWSE route failed",
      },
      { status: 200 },
    );
  }
}
