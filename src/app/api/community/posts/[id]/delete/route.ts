import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;

    const existingPost = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (existingPost) {
      await prisma.communityPost.delete({
        where: { id },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "DELETE_COMMUNITY_POST",
        details: `Deleted community post "${existingPost?.title || id}" (${id})`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Community Post Error:", error);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
