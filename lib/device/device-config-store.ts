import { prisma } from "@/lib/prisma";
import type { CompanionMode } from "@/lib/companion";
import type { DetailChartRange } from "@/lib/market/providers/okx-candles";

export type DeviceSettings = {
  demoMode: boolean;
  quietMode: boolean;
  companionMode: CompanionMode;
  refreshIntervalSec: number;
  detailChartRange: DetailChartRange;
  brightness: number;
  buzzerEnabled: boolean;
};

export type DeviceConfig = {
  deviceId: string;
  updatedAt: string;
  settings: DeviceSettings;
  syncSymbols: string[];
};

export type DeviceConfigPatch = {
  settings?: Partial<DeviceSettings>;
  syncSymbols?: string[];
};

export const defaultDeviceId = "ML-ESP32-DEMO";

const defaultSettings: DeviceSettings = {
  demoMode: false,
  quietMode: false,
  companionMode: "normal",
  refreshIntervalSec: 30,
  detailChartRange: "15m",
  brightness: 80,
  buzzerEnabled: false,
};

const defaultSyncSymbols = ["TWSE:2330", "OKX:BTC-USDT"];

export async function getDeviceConfig(deviceId: string): Promise<DeviceConfig> {
  const normalizedDeviceId = normalizeDeviceId(deviceId);

  let device = await prisma.device.findUnique({
    where: { deviceCode: normalizedDeviceId },
    include: {
      settings: true,
      stocks: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!device) {
    device = await prisma.device.create({
      data: {
        deviceCode: normalizedDeviceId,
        deviceName: "Market Light Desk",
        isBound: true,
        settings: {
          create: {
            brightness: defaultSettings.brightness,
            quietMode: defaultSettings.quietMode,
            buzzerEnabled: defaultSettings.buzzerEnabled,
            updateInterval: defaultSettings.refreshIntervalSec * 1000,
            rotateInterval: 45000,
            demoMode: defaultSettings.demoMode,
            companionMode: defaultSettings.companionMode,
            refreshIntervalSec: defaultSettings.refreshIntervalSec,
            detailChartRange: defaultSettings.detailChartRange,
          },
        },
        stocks: {
          create: defaultSyncSymbols.map((item, index) => {
            const [market, symbol] = item.split(":");
            return {
              market: market || "TWSE",
              symbol: symbol || "",
              displayName: symbol || "",
              displayOrder: index,
              enabled: true,
            };
          }),
        },
      },
      include: {
        settings: true,
        stocks: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  }

  const settings: DeviceSettings = {
    demoMode: device.settings?.demoMode ?? defaultSettings.demoMode,
    quietMode: device.settings?.quietMode ?? defaultSettings.quietMode,
    companionMode: (device.settings?.companionMode as CompanionMode) ?? defaultSettings.companionMode,
    refreshIntervalSec: device.settings?.refreshIntervalSec ?? defaultSettings.refreshIntervalSec,
    detailChartRange: (device.settings?.detailChartRange as DetailChartRange) ?? defaultSettings.detailChartRange,
    brightness: device.settings?.brightness ?? defaultSettings.brightness,
    buzzerEnabled: device.settings?.buzzerEnabled ?? defaultSettings.buzzerEnabled,
  };

  const syncSymbols = device.stocks.map((stock) => `${stock.market}:${stock.symbol}`);

  return {
    deviceId: device.deviceCode,
    updatedAt: device.updatedAt.toISOString(),
    settings,
    syncSymbols,
  };
}

export async function updateDeviceConfig(deviceId: string, patch: DeviceConfigPatch): Promise<DeviceConfig> {
  const normalizedDeviceId = normalizeDeviceId(deviceId);

  let device = await prisma.device.findUnique({
    where: { deviceCode: normalizedDeviceId },
    include: { settings: true },
  });

  if (!device) {
    await getDeviceConfig(normalizedDeviceId);
    device = await prisma.device.findUnique({
      where: { deviceCode: normalizedDeviceId },
      include: { settings: true },
    });
  }

  if (!device) {
    throw new Error(`Device ${normalizedDeviceId} could not be created or found`);
  }

  if (patch.settings) {
    const updateData: Record<string, unknown> = {};
    if (patch.settings.brightness !== undefined) updateData.brightness = patch.settings.brightness;
    if (patch.settings.quietMode !== undefined) updateData.quietMode = patch.settings.quietMode;
    if (patch.settings.buzzerEnabled !== undefined) updateData.buzzerEnabled = patch.settings.buzzerEnabled;
    if (patch.settings.demoMode !== undefined) updateData.demoMode = patch.settings.demoMode;
    if (patch.settings.companionMode !== undefined) updateData.companionMode = patch.settings.companionMode;
    if (patch.settings.refreshIntervalSec !== undefined) {
      updateData.refreshIntervalSec = patch.settings.refreshIntervalSec;
      updateData.updateInterval = patch.settings.refreshIntervalSec * 1000;
    }
    if (patch.settings.detailChartRange !== undefined) updateData.detailChartRange = patch.settings.detailChartRange;

    await prisma.deviceSettings.update({
      where: { deviceId: device.id },
      data: updateData,
    });
  }

  if (patch.syncSymbols) {
    await prisma.deviceStock.deleteMany({
      where: { deviceId: device.id },
    });

    await prisma.deviceStock.createMany({
      data: patch.syncSymbols.map((item, index) => {
        const [market, symbol] = item.split(":");
        return {
          deviceId: device!.id,
          market: market || "TWSE",
          symbol: symbol || "",
          displayName: symbol || "",
          displayOrder: index,
          enabled: true,
        };
      }),
    });
  }

  return getDeviceConfig(normalizedDeviceId);
}

export async function updateDeviceSyncSymbols(deviceId: string, syncSymbols: string[]): Promise<DeviceConfig> {
  return updateDeviceConfig(deviceId, { syncSymbols });
}

function normalizeDeviceId(deviceId: string) {
  const trimmed = deviceId.trim();
  return trimmed || defaultDeviceId;
}
