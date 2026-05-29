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

// Local/dev fallback only. Store it on globalThis so Next.js route modules in
// the same dev server process can share state. Vercel production needs durable
// storage such as Vercel KV or Upstash Redis if settings must survive cold starts.
const globalForDeviceConfig = globalThis as typeof globalThis & {
  __marketLightDeviceConfigs?: Map<string, DeviceConfig>;
};

const deviceConfigs = globalForDeviceConfig.__marketLightDeviceConfigs ?? new Map<string, DeviceConfig>();
globalForDeviceConfig.__marketLightDeviceConfigs = deviceConfigs;

export function getDeviceConfig(deviceId: string) {
  const normalizedDeviceId = normalizeDeviceId(deviceId);
  const existing = deviceConfigs.get(normalizedDeviceId);

  if (existing) return cloneConfig(existing);

  const nextConfig: DeviceConfig = {
    deviceId: normalizedDeviceId,
    updatedAt: new Date().toISOString(),
    settings: { ...defaultSettings },
    syncSymbols: [...defaultSyncSymbols],
  };
  deviceConfigs.set(normalizedDeviceId, nextConfig);

  return cloneConfig(nextConfig);
}

export function updateDeviceConfig(deviceId: string, patch: DeviceConfigPatch) {
  const current = getDeviceConfig(deviceId);
  const nextConfig: DeviceConfig = {
    ...current,
    updatedAt: new Date().toISOString(),
    settings: {
      ...current.settings,
      ...(patch.settings ?? {}),
    },
    syncSymbols: patch.syncSymbols ? [...patch.syncSymbols] : [...current.syncSymbols],
  };

  deviceConfigs.set(current.deviceId, nextConfig);
  return cloneConfig(nextConfig);
}

export function updateDeviceSyncSymbols(deviceId: string, syncSymbols: string[]) {
  return updateDeviceConfig(deviceId, { syncSymbols });
}

function normalizeDeviceId(deviceId: string) {
  const trimmed = deviceId.trim();
  return trimmed || defaultDeviceId;
}

function cloneConfig(config: DeviceConfig): DeviceConfig {
  return {
    ...config,
    settings: { ...config.settings },
    syncSymbols: [...config.syncSymbols],
  };
}
