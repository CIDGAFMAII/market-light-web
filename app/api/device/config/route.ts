import { NextResponse } from "next/server";
import { defaultDeviceId, getDeviceConfig, updateDeviceConfig } from "@/lib/device/device-config-store";
import { isCompanionMode } from "@/lib/companion";
import { isDetailChartRange } from "@/lib/market/providers/okx-candles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId") || defaultDeviceId;
  const config = getDeviceConfig(deviceId);

  return NextResponse.json({
    success: true,
    deviceId: config.deviceId,
    updatedAt: config.updatedAt,
    settings: config.settings,
    display: {
      oledWidth: 128,
      oledHeight: 64,
      lines: 4,
    },
    syncSymbols: config.syncSymbols,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isObject(body)) {
      return NextResponse.json({ success: false, message: "JSON body is required" }, { status: 200 });
    }

    const deviceId = typeof body.deviceId === "string" ? body.deviceId : defaultDeviceId;
    const settings = isObject(body.settings) ? normalizeSettings(body.settings) : {};
    const config = updateDeviceConfig(deviceId, { settings });

    return NextResponse.json({
      success: true,
      deviceId: config.deviceId,
      updatedAt: config.updatedAt,
      settings: config.settings,
      display: {
        oledWidth: 128,
        oledHeight: 64,
        lines: 4,
      },
      syncSymbols: config.syncSymbols,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Device config update failed",
      },
      { status: 200 },
    );
  }
}

function normalizeSettings(settings: Record<string, unknown>) {
  return {
    ...(typeof settings.demoMode === "boolean" ? { demoMode: settings.demoMode } : {}),
    ...(typeof settings.quietMode === "boolean" ? { quietMode: settings.quietMode } : {}),
    ...(typeof settings.companionMode === "string" && isCompanionMode(settings.companionMode)
      ? { companionMode: settings.companionMode }
      : {}),
    ...(typeof settings.refreshIntervalSec === "number" && Number.isFinite(settings.refreshIntervalSec)
      ? { refreshIntervalSec: settings.refreshIntervalSec }
      : {}),
    ...(typeof settings.detailChartRange === "string" && isDetailChartRange(settings.detailChartRange)
      ? { detailChartRange: settings.detailChartRange }
      : {}),
    ...(typeof settings.brightness === "number" && Number.isFinite(settings.brightness)
      ? { brightness: settings.brightness }
      : {}),
    ...(typeof settings.buzzerEnabled === "boolean" ? { buzzerEnabled: settings.buzzerEnabled } : {}),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
