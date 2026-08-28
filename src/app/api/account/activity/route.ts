import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activityLogs = await prisma.userActivityLog.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ activityLogs });
  } catch (error: any) {
    console.error("Activity GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { actionType, description, entityId, entityType, metadata } = body;

    if (!actionType || !description) {
      return NextResponse.json({ error: "Action type and description are required" }, { status: 400 });
    }

    const log = await prisma.userActivityLog.create({
      data: {
        userId: session.id,
        actionType,
        description,
        entityId: entityId || null,
        entityType: entityType || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Activity POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log activity" }, { status: 500 });
  }
}
