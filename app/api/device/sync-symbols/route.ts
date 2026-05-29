import { NextResponse } from "next/server";
import { defaultDeviceId, updateDeviceConfig } from "@/lib/device/device-config-store";
import { isDetailChartRange } from "@/lib/market/providers/okx-candles";
import { normalizeSyncSymbols } from "@/lib/market/symbols";
import { validateOkxSymbol } from "@/lib/market/validation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isObject(body)) {
      return NextResponse.json({ success: false, message: "JSON body is required" }, { status: 200 });
    }

    const deviceId = typeof body.deviceId === "string" ? body.deviceId : defaultDeviceId;
    const { syncSymbols, invalidSymbols } = normalizeSyncSymbols(body.syncSymbols);
    const invalidOkxSymbols: string[] = [];

    for (const token of syncSymbols) {
      if (!token.startsWith("OKX:")) continue;
      const symbol = token.slice("OKX:".length);
      const valid = await validateOkxSymbol(symbol);
      if (!valid) invalidOkxSymbols.push(token);
    }

    if (invalidSymbols.length > 0 || invalidOkxSymbols.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "syncSymbols only accepts TWSE:number or valid OKX instruments",
          invalidSymbols: [...invalidSymbols, ...invalidOkxSymbols],
        },
        { status: 200 },
      );
    }

    const settings = isObject(body.settings) && typeof body.settings.detailChartRange === "string" && isDetailChartRange(body.settings.detailChartRange)
      ? { detailChartRange: body.settings.detailChartRange }
      : undefined;
    const config = updateDeviceConfig(deviceId, { syncSymbols, settings });

    return NextResponse.json({
      success: true,
      deviceId: config.deviceId,
      updatedAt: config.updatedAt,
      settings: config.settings,
      syncSymbols: config.syncSymbols,
      warning: syncSymbols.length === 0 ? "syncSymbols is empty; ESP32 market response will contain no configured items." : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Device sync symbols update failed",
      },
      { status: 200 },
    );
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
