import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json().catch(() => null);

  return NextResponse.json({
    success: true,
    receivedAt: new Date().toISOString(),
  });
}
