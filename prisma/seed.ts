/**
 * @module seed
 * @description 初始化資料庫，建立兩組 demo 使用者、裝置、設定、股票、自選清單、桌寵
 * 使用方式: node --experimental-strip-types prisma/seed.ts
 */
import prismaClientPkg from "../node_modules/.prisma/client/index.js";
const { PrismaClient } = prismaClientPkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 開始 seed...");

  // ── 1. Demo 使用者 1 ──────────────────────────────────────
  const user1 = await prisma.user.upsert({
    where: { email: "demo@marketlight.local" },
    update: { displayName: "Demo User 1" },
    create: {
      email: "demo@marketlight.local",
      passwordHash: "demo1234",
      displayName: "Demo User 1",
      role: "user",
    },
  });
  console.log("✅ User 1:", user1.email);

  // ── 2. Demo 使用者 2 ──────────────────────────────────────
  const user2 = await prisma.user.upsert({
    where: { email: "user2@marketlight.local" },
    update: { displayName: "Demo User 2" },
    create: {
      email: "user2@marketlight.local",
      passwordHash: "demo1234",
      displayName: "Demo User 2",
      role: "user",
    },
  });
  console.log("✅ User 2:", user2.email);

  // ── 3. 裝置 1 & 2 ──────────────────────────────────────────
  const device1 = await prisma.device.upsert({
    where: { deviceCode: "ML-8F3A2C" },
    update: {},
    create: {
      deviceCode: "ML-8F3A2C",
      deviceName: "Market Light Desk 1",
      isBound: true,
      userId: user1.id,
    },
  });
  console.log("✅ Device 1:", device1.deviceCode);

  const device2 = await prisma.device.upsert({
    where: { deviceCode: "ML-8F3A2D" },
    update: {},
    create: {
      deviceCode: "ML-8F3A2D",
      deviceName: "Market Light Desk 2",
      isBound: true,
      userId: user2.id,
    },
  });
  console.log("✅ Device 2:", device2.deviceCode);

  // ── 4. 裝置設定 ──────────────────────────────────────────
  await prisma.deviceSettings.upsert({
    where: { deviceId: device1.id },
    update: {},
    create: {
      deviceId: device1.id,
      brightness: 80,
      quietMode: false,
      buzzerEnabled: true,
      updateInterval: 30000,
      rotateInterval: 45000,
      demoMode: false,
      companionMode: "normal",
      refreshIntervalSec: 30,
      detailChartRange: "15m",
    },
  });

  await prisma.deviceSettings.upsert({
    where: { deviceId: device2.id },
    update: {},
    create: {
      deviceId: device2.id,
      brightness: 60,
      quietMode: true,
      buzzerEnabled: false,
      updateInterval: 60000,
      rotateInterval: 60000,
      demoMode: false,
      companionMode: "flirt",
      refreshIntervalSec: 60,
      detailChartRange: "1h",
    },
  });
  console.log("✅ DeviceSettings created");

  // ── 5. 桌寵設定 ──────────────────────────────────────────
  await prisma.petSettings.upsert({
    where: { deviceId: device1.id },
    update: {},
    create: {
      deviceId: device1.id,
      petName: "小韭菜",
      petEnabled: true,
      level: 1,
      exp: 0,
      mood: "calm",
      animationStyle: "simple",
      interactionEnabled: true,
    },
  });

  await prisma.petSettings.upsert({
    where: { deviceId: device2.id },
    update: {},
    create: {
      deviceId: device2.id,
      petName: "大蒜頭",
      petEnabled: true,
      level: 2,
      exp: 150,
      mood: "up",
      animationStyle: "simple",
      interactionEnabled: true,
    },
  });
  console.log("✅ PetSettings created");

  // ── 6. 裝置股票清單 (ESP32 輪播) ─────────────────────────
  const stockSeeds1 = [
    { symbol: "2330", market: "TWSE", displayName: "TSMC", displayOrder: 0 },
    { symbol: "2317", market: "TWSE", displayName: "HONHAI", displayOrder: 1 },
    { symbol: "BTC-USDT", market: "OKX", displayName: "BTC", displayOrder: 2 },
  ];

  const stockSeeds2 = [
    { symbol: "BTC-USDT", market: "OKX", displayName: "BTC", displayOrder: 0 },
    { symbol: "ETH-USDT", market: "OKX", displayName: "ETH", displayOrder: 1 },
    { symbol: "SOL-USDT", market: "OKX", displayName: "SOL", displayOrder: 2 },
  ];

  for (const s of stockSeeds1) {
    await prisma.deviceStock.upsert({
      where: {
        deviceId_market_symbol: { deviceId: device1.id, market: s.market, symbol: s.symbol },
      },
      update: {},
      create: { deviceId: device1.id, ...s, enabled: true },
    });
  }

  for (const s of stockSeeds2) {
    await prisma.deviceStock.upsert({
      where: {
        deviceId_market_symbol: { deviceId: device2.id, market: s.market, symbol: s.symbol },
      },
      update: {},
      create: { deviceId: device2.id, ...s, enabled: true },
    });
  }
  console.log("✅ DeviceStocks created");

  // ── 7. 使用者自選清單 ─────────────────────────────────────
  const watchlistSeeds1 = [
    { market: "OKX", symbol: "BTC/USDT", displayMode: 1, trendPeriod: 1440, sortOrder: 0 },
    { market: "TWSE", symbol: "2330", displayMode: 2, trendPeriod: 60, sortOrder: 1 },
  ];

  const watchlistSeeds2 = [
    { market: "OKX", symbol: "BTC/USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 0 },
    { market: "OKX", symbol: "ETH/USDT", displayMode: 1, trendPeriod: 1440, sortOrder: 1 },
    { market: "OKX", symbol: "SOL/USDT", displayMode: 2, trendPeriod: 60, sortOrder: 2 },
  ];

  for (const w of watchlistSeeds1) {
    await prisma.watchlistItem.upsert({
      where: {
        userId_market_symbol: { userId: user1.id, market: w.market, symbol: w.symbol },
      },
      update: {},
      create: { userId: user1.id, ...w, enabled: true },
    });
  }

  for (const w of watchlistSeeds2) {
    await prisma.watchlistItem.upsert({
      where: {
        userId_market_symbol: { userId: user2.id, market: w.market, symbol: w.symbol },
      },
      update: {},
      create: { userId: user2.id, ...w, enabled: true },
    });
  }
  console.log("✅ WatchlistItems created");

  // ── 8. 市場快取 (初始 DEMO 資料) ─────────────────────────
  const cacheSeeds = [
    { symbol: "2330", market: "TWSE", displayName: "TSMC", price: 1075, yesterday: 1056, change: 19, changePercent: 1.8, high: 1080, low: 1055, volume: 23456, tradeTime: "13:30", source: "DEMO", status: "up_alert" },
    { symbol: "2317", market: "TWSE", displayName: "HONHAI", price: 183.5, yesterday: 183.1, change: 0.4, changePercent: 0.22, high: 184, low: 182.5, volume: 8921, tradeTime: "13:30", source: "DEMO", status: "calm" },
    { symbol: "2454", market: "TWSE", displayName: "MediaTek", price: 1320, yesterday: 1348, change: -28, changePercent: -2.08, high: 1340, low: 1315, volume: 12043, tradeTime: "13:30", source: "DEMO", status: "down_alert" },
    { symbol: "0050", market: "TWSE", displayName: "ETF 0050", price: 192.85, yesterday: 191.8, change: 1.05, changePercent: 0.55, high: 193.2, low: 191.5, volume: 5632, tradeTime: "13:30", source: "DEMO", status: "up" },
    { symbol: "BTC-USDT", market: "OKX", displayName: "Bitcoin", price: 68240.5, yesterday: 67924.3, change: 316.2, changePercent: 0.47, high: 68900, low: 67500, volume: null, tradeTime: "24H", source: "DEMO", status: "calm" },
    { symbol: "ETH-USDT", market: "OKX", displayName: "Ethereum", price: 3728.18, yesterday: 3770.68, change: -42.5, changePercent: -1.13, high: 3790, low: 3710, volume: null, tradeTime: "24H", source: "DEMO", status: "down" },
    { symbol: "SOL-USDT", market: "OKX", displayName: "Solana", price: 165.25, yesterday: 158.4, change: 6.85, changePercent: 4.32, high: 168, low: 155, volume: null, tradeTime: "24H", source: "DEMO", status: "up_alert" },
  ];

  for (const c of cacheSeeds) {
    await prisma.marketCache.upsert({
      where: { symbol_market: { symbol: c.symbol, market: c.market } },
      update: { price: c.price, change: c.change, changePercent: c.changePercent, status: c.status },
      create: c,
    });
  }
  console.log("✅ MarketCache created");
  console.log("\n🎉 Seed 完成！");
}

main()
  .catch((e) => {
    console.error("❌ Seed 失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
