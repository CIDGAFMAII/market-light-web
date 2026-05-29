import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
      },
      orderBy: {
        email: "asc",
      },
    });
    return NextResponse.json({ success: true, users });
  } catch (e) {
    console.error("[GET /api/public/users]", e);
    return NextResponse.json({ success: false, message: "伺服器錯誤" }, { status: 500 });
  }
}
