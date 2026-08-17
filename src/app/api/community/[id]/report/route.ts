import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: postId } = await params;
    const body = await request.json();
    const { reason } = body;

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: { reportsCount: { increment: 1 } },
    });

    if (session) {
      await prisma.report.create({
        data: {
          reporterId: session.id,
          targetId: post.authorId || session.id,
          reason: reason || "COMMUNITY_POST_FLAGGED",
          details: `Flagged community post "${post.title}" (ID: ${postId})`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you. Your report has been submitted to Tamale platform moderators.",
      reportsCount: updatedPost.reportsCount,
    });
  } catch (error: any) {
    console.error("Report Community Post Error:", error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}
