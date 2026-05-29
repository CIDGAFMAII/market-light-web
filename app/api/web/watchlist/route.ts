/**
 * GET  /api/web/watchlist  — 取得當前使用者自選清單
 * POST /api/web/watchlist  — 新增自選項目
 *
 * Header 必填: x-user-id: <userId>
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mock";

/** GET /api/web/watchlist */
export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const items = await prisma.watchlistItem.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, items });
  } catch (e) {
    console.error("[GET /api/web/watchlist]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}

/** POST /api/web/watchlist */
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const body = await req.json();
    const { market, symbol, displayMode = 2, trendPeriod = 1440 } = body;

    if (!market || !symbol) {
      return NextResponse.json({ success: false, message: "market 與 symbol 為必填" }, { status: 400 });
    }
    if (!["OKX", "TWSE", "DEMO"].includes(market)) {
      return NextResponse.json({ success: false, message: "market 必須為 OKX | TWSE | DEMO" }, { status: 400 });
    }
    if (![0, 1, 2].includes(Number(displayMode))) {
      return NextResponse.json({ success: false, message: "displayMode 必須為 0 | 1 | 2" }, { status: 400 });
    }
    if (![5, 15, 60, 1440].includes(Number(trendPeriod))) {
      return NextResponse.json({ success: false, message: "trendPeriod 必須為 5 | 15 | 60 | 1440" }, { status: 400 });
    }

    // 計算 sortOrder（放到最後）
    const count = await prisma.watchlistItem.count({ where: { userId: user.id } });

    const item = await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        market,
        symbol: symbol.toUpperCase(),
        displayMode: Number(displayMode),
        trendPeriod: Number(trendPeriod),
        sortOrder: count,
        enabled: true,
      },
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (e: unknown) {
    // 重複 symbol 錯誤
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return NextResponse.json({ success: false, message: "此 symbol 已在自選清單中" }, { status: 409 });
    }
    console.error("[POST /api/web/watchlist]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
