/**
 * GET  /api/web/stocks  — 取得裝置股票清單（ESP32 輪播用）
 * POST /api/web/stocks  — 新增股票到裝置清單
 *
 * Header 必填: x-user-id: <userId>
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getDefaultDevice } from "@/lib/auth-mock";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const device = await getDefaultDevice(user.id);
    if (!device) return NextResponse.json({ success: false, message: "尚未綁定裝置" }, { status: 404 });

    const stocks = await prisma.deviceStock.findMany({
      where: { deviceId: device.id },
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({ success: true, stocks });
  } catch (e) {
    console.error("[GET /api/web/stocks]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const device = await getDefaultDevice(user.id);
    if (!device) return NextResponse.json({ success: false, message: "尚未綁定裝置" }, { status: 404 });

    const body = await req.json();
    const { symbol, market, displayName } = body;

    if (!symbol || !market || !displayName)
      return NextResponse.json({ success: false, message: "symbol、market、displayName 為必填" }, { status: 400 });
    if (!["TWSE", "OKX", "DEMO"].includes(market))
      return NextResponse.json({ success: false, message: "market 必須為 TWSE | OKX | DEMO" }, { status: 400 });

    const count = await prisma.deviceStock.count({ where: { deviceId: device.id } });
    const stock = await prisma.deviceStock.create({
      data: { deviceId: device.id, symbol: symbol.toUpperCase(), market, displayName, displayOrder: count, enabled: true },
    });
    return NextResponse.json({ success: true, stock }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint"))
      return NextResponse.json({ success: false, message: "此 symbol 已在清單中" }, { status: 409 });
    console.error("[POST /api/web/stocks]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
