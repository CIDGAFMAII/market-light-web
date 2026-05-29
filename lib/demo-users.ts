import { prisma } from "@/lib/prisma";

export const demoPassword = "demo1234";

export const demoAccounts = [
  {
    alias: "User1",
    email: "demo@marketlight.local",
    displayName: "Demo User 1",
    deviceCode: "ML-8F3A2C",
    deviceName: "Market Light Desk 1",
    settings: {
      brightness: 80,
      quietMode: false,
      buzzerEnabled: true,
      companionMode: "normal",
      detailChartRange: "15m",
    },
    petName: "Miko",
    stocks: [
      { market: "TWSE", symbol: "2330", displayName: "TSMC" },
      { market: "TWSE", symbol: "2317", displayName: "HONHAI" },
      { market: "OKX", symbol: "BTC-USDT", displayName: "BTC" },
    ],
  },
  {
    alias: "User2",
    email: "user2@marketlight.local",
    displayName: "Demo User 2",
    deviceCode: "ML-8F3A2D",
    deviceName: "Market Light Desk 2",
    settings: {
      brightness: 60,
      quietMode: true,
      buzzerEnabled: false,
      companionMode: "flirt",
      detailChartRange: "1h",
    },
    petName: "Lumi",
    stocks: [
      { market: "OKX", symbol: "BTC-USDT", displayName: "BTC" },
      { market: "OKX", symbol: "ETH-USDT", displayName: "ETH" },
      { market: "OKX", symbol: "SOL-USDT", displayName: "SOL" },
    ],
  },
] as const;

export async function ensureDemoUsers() {
  for (const account of demoAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        displayName: account.displayName,
        passwordHash: demoPassword,
        role: "user",
      },
      create: {
        email: account.email,
        displayName: account.displayName,
        passwordHash: demoPassword,
        role: "user",
      },
    });

    const device = await prisma.device.upsert({
      where: { deviceCode: account.deviceCode },
      update: {
        deviceName: account.deviceName,
        isBound: true,
        userId: user.id,
      },
      create: {
        deviceCode: account.deviceCode,
        deviceName: account.deviceName,
        isBound: true,
        userId: user.id,
      },
    });

    await prisma.deviceSettings.upsert({
      where: { deviceId: device.id },
      update: account.settings,
      create: {
        deviceId: device.id,
        updateInterval: 30000,
        rotateInterval: 45000,
        demoMode: false,
        refreshIntervalSec: 30,
        ...account.settings,
      },
    });

    await prisma.petSettings.upsert({
      where: { deviceId: device.id },
      update: { petName: account.petName },
      create: {
        deviceId: device.id,
        petName: account.petName,
        petEnabled: true,
        level: account.alias === "User1" ? 1 : 2,
        exp: account.alias === "User1" ? 0 : 150,
        mood: account.alias === "User1" ? "calm" : "up",
        animationStyle: "simple",
        interactionEnabled: true,
      },
    });

    for (const [index, stock] of account.stocks.entries()) {
      await prisma.deviceStock.upsert({
        where: {
          deviceId_market_symbol: {
            deviceId: device.id,
            market: stock.market,
            symbol: stock.symbol,
          },
        },
        update: {
          displayName: stock.displayName,
          displayOrder: index,
          enabled: true,
        },
        create: {
          deviceId: device.id,
          market: stock.market,
          symbol: stock.symbol,
          displayName: stock.displayName,
          displayOrder: index,
          enabled: true,
        },
      });

      await prisma.watchlistItem.upsert({
        where: {
          userId_market_symbol: {
            userId: user.id,
            market: stock.market,
            symbol: stock.symbol,
          },
        },
        update: {
          sortOrder: index,
          enabled: true,
          displayMode: 2,
        },
        create: {
          userId: user.id,
          market: stock.market,
          symbol: stock.symbol,
          displayMode: 2,
          trendPeriod: 1440,
          sortOrder: index,
          enabled: true,
        },
      });
    }
  }
}

export function matchesDemoAccount(accountInput: string, email: string, displayName: string | null) {
  const input = accountInput.trim().toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const normalizedName = (displayName || "").toLowerCase();

  return (
    normalizedEmail === input ||
    normalizedName === input ||
    (input === "user1" && normalizedEmail === demoAccounts[0].email) ||
    (input === "user2" && normalizedEmail === demoAccounts[1].email)
  );
}
