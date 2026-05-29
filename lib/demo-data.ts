import { getMarketStatus, type MarketStatus } from "./market-status";

export type MarketItem = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  tradedAt: string;
  updatedAt: string;
  source: "TWSE" | "OKX" | "DEMO";
  mood: string;
  status: MarketStatus;
};

export const marketItems: MarketItem[] = [
  {
    symbol: "2330",
    name: "TSMC",
    price: 1075,
    change: 19,
    changePercent: 1.8,
    tradedAt: "13:30",
    updatedAt: "8s ago",
    source: "TWSE",
    mood: "突破壓力",
    status: getMarketStatus({ changePercent: 1.8 }),
  },
  {
    symbol: "2317",
    name: "HONHAI",
    price: 183.5,
    change: 0.4,
    changePercent: 0.22,
    tradedAt: "13:30",
    updatedAt: "12s ago",
    source: "TWSE",
    mood: "平穩震盪",
    status: getMarketStatus({ changePercent: 0.22 }),
  },
  {
    symbol: "2454",
    name: "MediaTek",
    price: 1320,
    change: -28,
    changePercent: -2.08,
    tradedAt: "13:30",
    updatedAt: "10s ago",
    source: "TWSE",
    mood: "賣壓提醒",
    status: getMarketStatus({ changePercent: -2.08 }),
  },
  {
    symbol: "0050",
    name: "ETF",
    price: 192.85,
    change: 1.05,
    changePercent: 0.55,
    tradedAt: "13:30",
    updatedAt: "14s ago",
    source: "TWSE",
    mood: "指數走強",
    status: getMarketStatus({ changePercent: 0.55 }),
  },
  {
    symbol: "BTC-USDT",
    name: "Bitcoin",
    price: 68240.5,
    change: 316.2,
    changePercent: 0.47,
    tradedAt: "24H",
    updatedAt: "5s ago",
    source: "OKX",
    mood: "買盤平穩",
    status: getMarketStatus({ changePercent: 0.47 }),
  },
  {
    symbol: "ETH-USDT",
    name: "Ethereum",
    price: 3728.18,
    change: -42.5,
    changePercent: -1.13,
    tradedAt: "24H",
    updatedAt: "6s ago",
    source: "OKX",
    mood: "動能降溫",
    status: getMarketStatus({ changePercent: -1.13 }),
  },
];

export const demoStates: Record<
  MarketStatus,
  {
    label: string;
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    rgb: string;
    note: string;
  }
> = {
  calm: {
    label: "calm",
    line1: "2317 HONHAI",
    line2: "183.50 +0.22%",
    line3: "(-_-) 成交 13:30",
    line4: "更新 12s",
    rgb: "cyan",
    note: "市場平穩，只保留低干擾顯示。",
  },
  up: {
    label: "up",
    line1: "0050 ETF",
    line2: "192.85 +0.55%",
    line3: "(^_^) 成交 13:30",
    line4: "更新 14s",
    rgb: "red",
    note: "上漲顏色會依使用者偏好切換。",
  },
  up_alert: {
    label: "up_alert",
    line1: "2330 TSMC",
    line2: "1075.00 +1.80%",
    line3: "(^o^) 成交 13:30",
    line4: "更新 8s",
    rgb: "red",
    note: "漲幅超過門檻，啟用 RGB pulse 與小助手提醒。",
  },
  down: {
    label: "down",
    line1: "ETH-USDT",
    line2: "3728.18 -1.13%",
    line3: "(._.) 成交 24H",
    line4: "更新 6s",
    rgb: "green",
    note: "下跌顏色會依使用者偏好切換。",
  },
  down_alert: {
    label: "down_alert",
    line1: "2454 MTK",
    line2: "1320.00 -2.08%",
    line3: "(T_T) 成交 13:30",
    line4: "更新 10s",
    rgb: "green",
    note: "跌幅超過門檻，LED 亮度提高作為提醒。",
  },
  error: {
    label: "error",
    line1: "API 異常",
    line2: "TWSE 逾時",
    line3: "(?) 30s 後重試",
    line4: "上次正常 2m",
    rgb: "yellow",
    note: "模擬資料來源異常，不串接外部 API。",
  },
  closed: {
    label: "closed",
    line1: "TWSE 休市",
    line2: "2330 1075.00",
    line3: "(-_-)zZ 13:30",
    line4: "下次 09:00",
    rgb: "muted",
    note: "休市狀態讓桌面提醒保持安靜。",
  },
  quiet: {
    label: "quiet",
    line1: "安靜模式",
    line2: "提醒已靜音",
    line3: "(-_-) RGB 關閉",
    line4: "按鈕仍可用",
    rgb: "muted",
    note: "安靜模式會暫停主動提醒。",
  },
};

export const dashboardMock = {
  deviceName: "Market Light MK-01",
  bindStatus: "已綁定",
  deviceCode: "ML-ESP32-8F2A",
  lastSeenAt: "2026-05-29 07:12:08",
  stockCount: marketItems.length,
  quietMode: false,
  demoMode: false,
  petName: "Miko",
  apiStatus: "DEMO 模擬資料在線",
};
