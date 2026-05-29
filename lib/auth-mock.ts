/**
 * @module auth-mock
 * @description MVP 簡化驗證模組
 * 從 Request header 讀取 x-user-id，作為當前登入使用者識別
 * 正式環境請替換為 JWT / next-auth session
 */
import { prisma } from "./prisma";

/** 從 header 取得 userId，未提供則回傳 null */
export function getMockUserId(req: Request): string | null {
  return req.headers.get("x-user-id");
}

export async function getAuthUser(req: Request) {
  const userId = getMockUserId(req);
  if (userId && userId !== "null" && userId !== "undefined") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }
  return null;
}

/** 取得預設裝置（MVP 單裝置模式） */
export async function getDefaultDevice(userId: string) {
  const device = await prisma.device.findFirst({ where: { userId } });
  return device;
}
