import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
      },
      orderBy: {
        email: "asc",
      },
    });

    if (users.length === 0) {
      try {
        const user1 = await prisma.user.create({
          data: {
            email: "demo@marketlight.local",
            displayName: "Demo User 1",
            passwordHash: "demo1234",
            role: "user",
          },
        });
        const device1 = await prisma.device.create({
          data: {
            deviceCode: "ML-8F3A2C",
            deviceName: "Market Light Desk 1",
            isBound: true,
            userId: user1.id,
          },
        });
        await prisma.deviceSettings.create({
          data: {
            deviceId: device1.id,
            brightness: 80,
            quietMode: false,
            buzzerEnabled: true,
            companionMode: "normal",
            detailChartRange: "15m",
          },
        });
        await prisma.petSettings.create({
          data: {
            deviceId: device1.id,
            petName: "小韭菜",
            petEnabled: true,
            level: 1,
            exp: 0,
            mood: "calm",
          },
        });
        await prisma.watchlistItem.createMany({
          data: [
            { userId: user1.id, market: "TWSE", symbol: "2330", displayMode: 2, trendPeriod: 1440, sortOrder: 0 },
            { userId: user1.id, market: "TWSE", symbol: "2317", displayMode: 2, trendPeriod: 1440, sortOrder: 1 },
            { userId: user1.id, market: "OKX", symbol: "BTC-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 2 },
          ],
        });
        await prisma.deviceStock.createMany({
          data: [
            { deviceId: device1.id, market: "TWSE", symbol: "2330", displayName: "TSMC", displayOrder: 0 },
            { deviceId: device1.id, market: "TWSE", symbol: "2317", displayName: "HONHAI", displayOrder: 1 },
            { deviceId: device1.id, market: "OKX", symbol: "BTC-USDT", displayName: "BTC", displayOrder: 2 },
          ],
        });

        const user2 = await prisma.user.create({
          data: {
            email: "user2@marketlight.local",
            displayName: "Demo User 2",
            passwordHash: "demo1234",
            role: "user",
          },
        });
        const device2 = await prisma.device.create({
          data: {
            deviceCode: "ML-ESP32-DEMO",
            deviceName: "Market Light Pro",
            isBound: true,
            userId: user2.id,
          },
        });
        await prisma.deviceSettings.create({
          data: {
            deviceId: device2.id,
            brightness: 60,
            quietMode: true,
            buzzerEnabled: false,
            companionMode: "flirt",
            detailChartRange: "1h",
          },
        });
        await prisma.petSettings.create({
          data: {
            deviceId: device2.id,
            petName: "大蒜頭",
            petEnabled: true,
            level: 2,
            exp: 150,
            mood: "up",
          },
        });
        await prisma.watchlistItem.createMany({
          data: [
            { userId: user2.id, market: "OKX", symbol: "BTC-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 0 },
            { userId: user2.id, market: "OKX", symbol: "ETH-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 1 },
            { userId: user2.id, market: "OKX", symbol: "SOL-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 2 },
          ],
        });
        await prisma.deviceStock.createMany({
          data: [
            { deviceId: device2.id, market: "OKX", symbol: "BTC-USDT", displayName: "BTC", displayOrder: 0 },
            { deviceId: device2.id, market: "OKX", symbol: "ETH-USDT", displayName: "ETH", displayOrder: 1 },
            { deviceId: device2.id, market: "OKX", symbol: "SOL-USDT", displayName: "SOL", displayOrder: 2 },
          ],
        });

        users = await prisma.user.findMany({
          select: {
            id: true,
            displayName: true,
            email: true,
          },
          orderBy: {
            email: "asc",
          },
        });
      } catch (seedErr) {
        console.error("Auto seeding on request failed", seedErr);
      }
    }

    return NextResponse.json({ success: true, users });
  } catch (e) {
    console.error("[GET /api/public/users]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
