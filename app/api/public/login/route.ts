import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { account, password } = body;

    if (!account || !password) {
      return NextResponse.json(
        { success: false, message: "請輸入帳號與密碼" },
        { status: 400 }
      );
    }

    const inputClean = account.trim().toLowerCase();

    // 1. Check if database has users. If not, auto-seed.
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
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
      } catch (seedErr) {
        console.error("Auto seeding in login route failed", seedErr);
      }
    }

    // 2. Fetch all users for matching
    const allUsers = await prisma.user.findMany();

    const matchedUser = allUsers.find((u) => {
      const emailClean = u.email.toLowerCase();
      const nameClean = (u.displayName || "").toLowerCase();

      if (emailClean === inputClean) return true;
      if (nameClean === inputClean) return true;

      if (inputClean === "user1" && (emailClean.includes("demo") || nameClean.includes("user 1"))) return true;
      if (inputClean === "user2" && (emailClean.includes("user2") || nameClean.includes("user 2"))) return true;

      return false;
    });

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: "帳號不存在！請輸入預設帳戶：User1 或 User2" },
        { status: 401 }
      );
    }

    // Simple password validation for demo
    if (password !== matchedUser.passwordHash) {
      return NextResponse.json(
        { success: false, message: "密碼錯誤！請使用預設密碼 demo1234" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        displayName: matchedUser.displayName,
      },
    });
  } catch (e) {
    console.error("[POST /api/public/login]", e);
    return NextResponse.json(
      { success: false, message: "伺服器發生錯誤" },
      { status: 500 }
    );
  }
}
