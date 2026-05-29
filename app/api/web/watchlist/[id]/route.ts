/**
 * PUT    /api/web/watchlist/[id]  — 更新自選項目（displayMode / trendPeriod / enabled）
 * DELETE /api/web/watchlist/[id]  — 刪除自選項目
 *
 * Header 必填: x-user-id: <userId>
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-mock";

/** PUT /api/web/watchlist/[id] */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { displayMode, trendPeriod, enabled, sortOrder } = body;

    // 確認此項目屬於該使用者
    const existing = await prisma.watchlistItem.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ success: false, message: "找不到項目" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (displayMode !== undefined) {
      if (![0, 1, 2].includes(Number(displayMode)))
        return NextResponse.json({ success: false, message: "displayMode 必須為 0 | 1 | 2" }, { status: 400 });
      updateData.displayMode = Number(displayMode);
    }
    if (trendPeriod !== undefined) {
      if (![5, 15, 60, 1440].includes(Number(trendPeriod)))
        return NextResponse.json({ success: false, message: "trendPeriod 必須為 5 | 15 | 60 | 1440" }, { status: 400 });
      updateData.trendPeriod = Number(trendPeriod);
    }
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const item = await prisma.watchlistItem.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, item });
  } catch (e) {
    console.error("[PUT /api/web/watchlist/[id]]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}

/** DELETE /api/web/watchlist/[id] */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.watchlistItem.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ success: false, message: "找不到項目" }, { status: 404 });

    await prisma.watchlistItem.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "已刪除" });
  } catch (e) {
    console.error("[DELETE /api/web/watchlist/[id]]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
