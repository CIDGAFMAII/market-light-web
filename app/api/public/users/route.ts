import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUsers } from "@/lib/demo-users";

export async function GET() {
  try {
    await ensureDemoUsers();
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
    return NextResponse.json(
      { success: false, message: "讀取使用者失敗，請確認 Neon DATABASE_URL 與 Prisma schema" },
      { status: 500 },
    );
  }
}
