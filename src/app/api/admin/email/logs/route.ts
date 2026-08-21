import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      where.OR = [
        { recipientEmail: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { templateName: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalCount = await prisma.emailLog.count();
    const sentCount = await prisma.emailLog.count({ where: { status: "SENT" } });
    const failedCount = await prisma.emailLog.count({ where: { status: "FAILED" } });
    const queuedCount = await prisma.emailLog.count({ where: { status: "QUEUED" } });

    const activeProvider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();

    return NextResponse.json({
      activeProvider,
      stats: {
        totalCount,
        sentCount,
        failedCount,
        queuedCount,
        deliveryRate: totalCount > 0 ? Number(((sentCount / totalCount) * 100).toFixed(1)) : 100,
      },
      logs,
    });
  } catch (error: any) {
    console.error("Admin Email Logs Error:", error);
    return NextResponse.json({ error: "Failed to load email logs." }, { status: 500 });
  }
}
