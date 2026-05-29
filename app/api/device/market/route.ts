import { NextResponse } from "next/server";
import { getDeviceConfig } from "@/lib/device/device-config-store";
import { mockDeviceSettings, mockDeviceStocks } from "@/lib/market/default-list";
import { getMarketCollection } from "@/lib/market/service";
import { parseSymbolsParam, parseSymbolTokens } from "@/lib/market/symbols";

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
  const forcedDemoMode = searchParams.get("demoMode");
  const symbols = searchParams.get("symbols");
  const deviceId = searchParams.get("deviceId");
  const deviceConfig = deviceId ? getDeviceConfig(deviceId) : null;
  const demoMode =
    forcedDemoMode === "true"
      ? true
      : forcedDemoMode === "false"
        ? false
        : deviceConfig?.settings.demoMode ?? mockDeviceSettings.demoMode;
  const targets = symbols
    ? parseSymbolsParam(symbols)
    : deviceConfig
      ? parseSymbolTokens(deviceConfig.syncSymbols)
      : mockDeviceStocks;

  try {
    const result = await getMarketCollection({
      targets: targets.filter((stock) => stock.enabled !== false),
      demoMode,
    });

    return NextResponse.json({
      ...result,
      deviceId: deviceConfig?.deviceId,
      syncSymbols: deviceConfig?.syncSymbols,
      items: result.items.map((item) => ({
        symbol: item.symbol,
        market: item.market,
        displayName: item.displayName,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        tradeTime: item.tradeTime,
        tradeDate: item.tradeDate,
        source: item.source,
        quoteQuality: item.quoteQuality,
        status: item.status,
        stale: item.stale,
        message: item.message,
      })),
    }, noStoreResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        updatedAt: new Date().toISOString(),
        sourceMode: demoMode ? "DEMO" : "REAL_WITH_FALLBACK",
        items: [],
        warnings: [error instanceof Error ? error.message : "Device market route failed"],
      },
      { status: 200, ...noStoreResponse },
    );
  }
}
