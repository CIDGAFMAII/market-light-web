import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, getDefaultDevice } from "@/lib/auth-mock";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "未登入" }, { status: 401 });
  }

  try {
    const device = await getDefaultDevice(user.id);
    if (!device) {
      return NextResponse.json({
        success: true,
        database: "已啟用 (Prisma Postgres)",
        auth: "已啟用 (Mock)",
        deviceName: "未綁定裝置",
        bindStatus: "未綁定",
        deviceCode: "無",
        lastSeenAt: "無紀錄",
        stockCount: 0,
        quietMode: "關閉",
        demoMode: "關閉",
        petName: "無",
        apiStatus: "連線正常",
      });
    }

    const settings = await prisma.deviceSettings.findUnique({
      where: { deviceId: device.id },
    });

    const pet = await prisma.petSettings.findUnique({
      where: { deviceId: device.id },
    });

    const stockCount = await prisma.deviceStock.count({
      where: { deviceId: device.id },
    });

    return NextResponse.json({
      success: true,
      database: "已啟用 (Prisma Postgres)",
      auth: "已啟用 (Mock)",
      deviceName: device.deviceName,
      bindStatus: device.isBound ? "已綁定" : "未綁定",
      deviceCode: device.deviceCode,
      lastSeenAt: device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }) : "無紀錄",
      stockCount,
      quietMode: settings?.quietMode ? "開啟" : "關閉",
      demoMode: settings?.demoMode ? "開啟" : "關閉",
      petName: pet?.petName || "無",
      apiStatus: "連線正常",
    });
  } catch (e) {
    console.error("[GET /api/web/dashboard]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
