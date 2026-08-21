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

    let existingPost = await prisma.communityPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      // Upsert default post into DB on the fly if it's a seed post
      existingPost = await prisma.communityPost.create({
        data: {
          id,
          title: id === "post-101"
            ? "Tamale Artisan Association Monthly Technical Workshop"
            : "Urgent Equipment Needed: 100KVA Generator for Construction Project",
          content: id === "post-101"
            ? "Calling all certified electricians, solar installers, and borehole technicians in Sakasaka and Choggu for our monthly safety & solar standards meetup."
            : "Contractor requiring 100KVA silent diesel generator for 3-day site pouring in Bolgatanga road area.",
          category: id === "post-101" ? "ARTISAN_MEETUP" : "TOOL_RENTAL",
          zone: id === "post-101" ? "SAKASAKA" : "ABOABO",
          guestName: id === "post-101" ? "Master Electrical Guild Ghana" : "Savannah Infra Works",
          guestPhone: id === "post-101" ? "+233244889900" : "+233201122334",
          isPinned: false,
          isLocked: false,
        },
      });
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id },
      data: {
        isPinned: !existingPost.isPinned,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: updatedPost.isPinned ? "PIN_COMMUNITY_POST" : "UNPIN_COMMUNITY_POST",
        details: `${updatedPost.isPinned ? "Pinned" : "Unpinned"} community post "${updatedPost.title}" (${updatedPost.id})`,
      },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error("Pin Community Post Error:", error);
    return NextResponse.json({ error: "Failed to update pinned status." }, { status: 500 });
  }
}
