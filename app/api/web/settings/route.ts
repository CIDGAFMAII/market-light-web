/**
 * GET /api/web/settings  — 取得裝置設定
 * PUT /api/web/settings  — 更新裝置設定
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

    const settings = await prisma.deviceSettings.findUnique({ where: { deviceId: device.id } });
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    console.error("[GET /api/web/settings]", e);
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
    const { brightness, quietMode, buzzerEnabled, updateInterval, rotateInterval, demoMode, companionMode, refreshIntervalSec, detailChartRange } = body;

    const updateData: Record<string, unknown> = {};
    if (brightness !== undefined) {
      const b = Number(brightness);
      if (b < 0 || b > 100) return NextResponse.json({ success: false, message: "brightness 必須在 0-100 之間" }, { status: 400 });
      updateData.brightness = b;
    }
    if (quietMode !== undefined) updateData.quietMode = Boolean(quietMode);
    if (buzzerEnabled !== undefined) updateData.buzzerEnabled = Boolean(buzzerEnabled);
    if (updateInterval !== undefined) {
      if (Number(updateInterval) < 5000) return NextResponse.json({ success: false, message: "updateInterval 最小 5000ms" }, { status: 400 });
      updateData.updateInterval = Number(updateInterval);
    }
    if (rotateInterval !== undefined) {
      if (Number(rotateInterval) < 5000) return NextResponse.json({ success: false, message: "rotateInterval 最小 5000ms" }, { status: 400 });
      updateData.rotateInterval = Number(rotateInterval);
    }
    if (demoMode !== undefined) updateData.demoMode = Boolean(demoMode);

    if (companionMode !== undefined) {
      if (!["normal", "flirt", "quiet"].includes(companionMode)) {
        return NextResponse.json({ success: false, message: "companionMode 必須為 normal | flirt | quiet" }, { status: 400 });
      }
      updateData.companionMode = companionMode;
    }
    if (refreshIntervalSec !== undefined) {
      const sec = Number(refreshIntervalSec);
      if (sec < 5) return NextResponse.json({ success: false, message: "refreshIntervalSec 最小 5s" }, { status: 400 });
      updateData.refreshIntervalSec = sec;
      updateData.updateInterval = sec * 1000;
    }
    if (detailChartRange !== undefined) {
      if (!["5m", "15m", "1h", "24h"].includes(detailChartRange)) {
        return NextResponse.json({ success: false, message: "detailChartRange 必須為 5m | 15m | 1h | 24h" }, { status: 400 });
      }
      updateData.detailChartRange = detailChartRange;
    }

    const settings = await prisma.deviceSettings.update({ where: { deviceId: device.id }, data: updateData });
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    console.error("[PUT /api/web/settings]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
