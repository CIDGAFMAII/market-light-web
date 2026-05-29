/**
 * PUT    /api/web/stocks/[id]  — 更新股票（enabled / displayOrder / displayName）
 * DELETE /api/web/stocks/[id]  — 刪除股票
 *
 * Header 必填: x-user-id: <userId>
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getDefaultDevice } from "@/lib/auth-mock";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const { id } = await params;
    const device = await getDefaultDevice(user.id);
    if (!device) return NextResponse.json({ success: false, message: "尚未綁定裝置" }, { status: 404 });

    const existing = await prisma.deviceStock.findFirst({ where: { id, deviceId: device.id } });
    if (!existing) return NextResponse.json({ success: false, message: "找不到股票" }, { status: 404 });

    const body = await req.json();
    const { enabled, displayOrder, displayName } = body;
    const updateData: Record<string, unknown> = {};
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (displayName !== undefined) updateData.displayName = String(displayName);

    const stock = await prisma.deviceStock.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, stock });
  } catch (e) {
    console.error("[PUT /api/web/stocks/[id]]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const { id } = await params;
    const device = await getDefaultDevice(user.id);
    if (!device) return NextResponse.json({ success: false, message: "尚未綁定裝置" }, { status: 404 });

    const existing = await prisma.deviceStock.findFirst({ where: { id, deviceId: device.id } });
    if (!existing) return NextResponse.json({ success: false, message: "找不到股票" }, { status: 404 });

    await prisma.deviceStock.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "已刪除" });
  } catch (e) {
    console.error("[DELETE /api/web/stocks/[id]]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
