import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoPassword, ensureDemoUsers, matchesDemoAccount } from "@/lib/demo-users";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { account?: unknown; password?: unknown };
    const account = typeof body.account === "string" ? body.account.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!account || !password) {
      return NextResponse.json(
        { success: false, message: "請輸入帳號與密碼" },
        { status: 400 },
      );
    }

    await ensureDemoUsers();

    const users = await prisma.user.findMany();
    const matchedUser = users.find((user) => matchesDemoAccount(account, user.email, user.displayName));

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: "找不到帳號，請使用 User1、User2 或 Demo Email" },
        { status: 401 },
      );
    }

    if (password !== matchedUser.passwordHash) {
      return NextResponse.json(
        { success: false, message: `密碼錯誤，Demo 密碼為 ${demoPassword}` },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        displayName: matchedUser.displayName,
      },
    });
  } catch (error) {
    console.error("[POST /api/public/login]", error);
    return NextResponse.json(
      { success: false, message: "登入 API 呼叫失敗，請確認 Neon DATABASE_URL 與 Prisma schema" },
      { status: 500 },
    );
  }
}
