import { NextResponse } from "next/server";
import { findMarketCache, upsertMarketCache } from "@/lib/market/cache";
import { fetchOkxTicker } from "@/lib/market/providers/okx-ticker";
import { createOkxErrorMarketData, getOkxSymbolValidation } from "@/lib/market/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instId = searchParams.get("instId") || "BTC-USDT";

  try {
    const validation = await getOkxSymbolValidation(instId);
    if (!validation.valid) {
      return NextResponse.json({
        success: true,
        ...createOkxErrorMarketData({
          symbol: instId,
          message: validation.message,
        }),
        warning: validation.message,
      });
    }

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

    return NextResponse.json({
      success: true,
      ...createOkxErrorMarketData({
        symbol: instId,
        message: result.message || "OKX ticker failed",
      }),
      warning: "Real provider failed, no cache available",
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
