/**
 * @module auth-mock
 * @description MVP 簡化驗證模組
 * 從 Request header 讀取 x-user-id，作為當前登入使用者識別
 * 正式環境請替換為 JWT / next-auth session
 */
import { prisma } from "./prisma";
import { ensureDemoUsers } from "./demo-users";

/** 從 header 取得 userId，未提供則回傳 null */
export function getMockUserId(req: Request): string | null {
  return req.headers.get("x-user-id");
}

/** 驗證 userId 是否存在於資料庫，回傳 User 物件或 null */
export async function getAuthUser(req: Request) {
  await ensureDemoUsers();
  const userId = getMockUserId(req);
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }
  // Fallback to the first user in the database (Demo User) for MVP ease of use
  return prisma.user.findFirst();
}

/** 取得預設裝置（MVP 單裝置模式） */
export async function getDefaultDevice(userId: string) {
  // Try to find the device belonging to this user
  const device = await prisma.device.findFirst({ where: { userId } });
  if (device) return device;
  // Fallback to any device if none belongs to the user
  return prisma.device.findFirst();
}
