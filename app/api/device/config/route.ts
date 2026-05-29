import { NextResponse } from "next/server";
import { mockDeviceSettings } from "@/lib/market/default-list";

export async function GET() {
  return NextResponse.json({
    success: true,
    deviceId: "ML-ESP32-8F2A",
    updatedAt: new Date().toISOString(),
    settings: mockDeviceSettings,
    display: {
      oledWidth: 128,
      oledHeight: 64,
      lines: 4,
    },
  });
}
