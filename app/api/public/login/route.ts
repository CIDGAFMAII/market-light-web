import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/public/login
 * Server-side account verification for Demo login.
 * If Neon database is empty (first deploy), auto-seeds two demo users.
 */
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

    // ── Auto-seed if DB is empty (handles fresh Vercel/Neon deploy) ──
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
      try {
        const u1 = await prisma.user.create({
          data: { email: "demo@marketlight.local", displayName: "Demo User 1", passwordHash: "demo1234", role: "user" },
        });
        const d1 = await prisma.device.create({
          data: { deviceCode: "ML-8F3A2C", deviceName: "Market Light Desk 1", isBound: true, userId: u1.id },
        });
        await prisma.deviceSettings.create({
          data: { deviceId: d1.id, brightness: 80, companionMode: "normal", detailChartRange: "15m" },
        });
        await prisma.petSettings.create({
          data: { deviceId: d1.id, petName: "小韭菜", level: 1, exp: 0, mood: "calm" },
        });
        await prisma.watchlistItem.createMany({
          data: [
            { userId: u1.id, market: "TWSE", symbol: "2330", displayMode: 2, trendPeriod: 1440, sortOrder: 0 },
            { userId: u1.id, market: "TWSE", symbol: "2317", displayMode: 2, trendPeriod: 1440, sortOrder: 1 },
            { userId: u1.id, market: "OKX", symbol: "BTC-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 2 },
          ],
        });
        await prisma.deviceStock.createMany({
          data: [
            { deviceId: d1.id, market: "TWSE", symbol: "2330", displayName: "TSMC", displayOrder: 0 },
            { deviceId: d1.id, market: "TWSE", symbol: "2317", displayName: "HONHAI", displayOrder: 1 },
            { deviceId: d1.id, market: "OKX", symbol: "BTC-USDT", displayName: "BTC", displayOrder: 2 },
          ],
        });

        const u2 = await prisma.user.create({
          data: { email: "user2@marketlight.local", displayName: "Demo User 2", passwordHash: "demo1234", role: "user" },
        });
        const d2 = await prisma.device.create({
          data: { deviceCode: "ML-ESP32-DEMO", deviceName: "Market Light Pro", isBound: true, userId: u2.id },
        });
        await prisma.deviceSettings.create({
          data: { deviceId: d2.id, brightness: 60, quietMode: true, buzzerEnabled: false, companionMode: "flirt", detailChartRange: "1h" },
        });
        await prisma.petSettings.create({
          data: { deviceId: d2.id, petName: "大蒜頭", level: 2, exp: 150, mood: "up" },
        });
        await prisma.watchlistItem.createMany({
          data: [
            { userId: u2.id, market: "OKX", symbol: "BTC-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 0 },
            { userId: u2.id, market: "OKX", symbol: "ETH-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 1 },
            { userId: u2.id, market: "OKX", symbol: "SOL-USDT", displayMode: 2, trendPeriod: 1440, sortOrder: 2 },
          ],
        });
        await prisma.deviceStock.createMany({
          data: [
            { deviceId: d2.id, market: "OKX", symbol: "BTC-USDT", displayName: "BTC", displayOrder: 0 },
            { deviceId: d2.id, market: "OKX", symbol: "ETH-USDT", displayName: "ETH", displayOrder: 1 },
            { deviceId: d2.id, market: "OKX", symbol: "SOL-USDT", displayName: "SOL", displayOrder: 2 },
          ],
        });
        console.log("[login] Auto-seeded 2 demo users into empty database");
      } catch (seedErr) {
        console.error("[login] Auto-seed failed:", seedErr);
      }
    }

    // ── Match account ──
    const allUsers = await prisma.user.findMany();
    const matchedUser = allUsers.find((u) => {
      const email = u.email.toLowerCase();
      const name = (u.displayName || "").toLowerCase();
      if (email === inputClean || name === inputClean) return true;
      if (inputClean === "user1" && (email.includes("demo") || name.includes("user 1"))) return true;
      if (inputClean === "user2" && (email.includes("user2") || name.includes("user 2"))) return true;
      return false;
    });

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: "帳號不存在！請輸入預設帳戶：User1 或 User2" },
        { status: 401 }
      );
    }

    if (password !== matchedUser.passwordHash) {
      return NextResponse.json(
        { success: false, message: "密碼錯誤！請使用預設密碼 demo1234" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: matchedUser.id, email: matchedUser.email, displayName: matchedUser.displayName },
    });
  } catch (e) {
    console.error("[POST /api/public/login]", e);
    return NextResponse.json({ success: false, message: "伺服器發生錯誤，請確認資料庫連線設定" }, { status: 500 });
  }
}
