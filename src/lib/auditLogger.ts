import { prisma } from "@/lib/prisma";

export async function logAdminAction(
  userId: string | null,
  action: string,
  details: string,
  ipAddress?: string
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        details,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("Failed to write audit log entry:", error);
    return null;
  }
}
