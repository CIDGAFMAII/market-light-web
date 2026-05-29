/**
 * GET /api/web/pet  — 取得桌寵設定
 * PUT /api/web/pet  — 更新桌寵設定
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

    const pet = await prisma.petSettings.findUnique({ where: { deviceId: device.id } });
    return NextResponse.json({ success: true, pet });
  } catch (e) {
    console.error("[GET /api/web/pet]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });

  try {
    const device = await getDefaultDevice(user.id);
    if (!device) return NextResponse.json({ success: false, message: "尚未綁定裝置" }, { status: 404 });

    const body = await req.json();
    const { petName, petEnabled, mood, animationStyle, interactionEnabled } = body;

    const updateData: Record<string, unknown> = {};
    if (petName !== undefined) updateData.petName = String(petName);
    if (petEnabled !== undefined) updateData.petEnabled = Boolean(petEnabled);
    if (mood !== undefined) {
      if (!["calm", "up", "up_alert", "down", "down_alert", "error", "closed", "quiet"].includes(mood)) {
        return NextResponse.json({ success: false, message: "mood 格式錯誤" }, { status: 400 });
      }
      updateData.mood = String(mood);
    }
    if (animationStyle !== undefined) {
      if (!["simple", "cute", "minimal"].includes(animationStyle)) {
        return NextResponse.json({ success: false, message: "animationStyle 格式錯誤" }, { status: 400 });
      }
      updateData.animationStyle = String(animationStyle);
    }
    if (interactionEnabled !== undefined) updateData.interactionEnabled = Boolean(interactionEnabled);

    const pet = await prisma.petSettings.update({ where: { deviceId: device.id }, data: updateData });
    return NextResponse.json({ success: true, pet });
  } catch (e) {
    console.error("[PUT /api/web/pet]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
