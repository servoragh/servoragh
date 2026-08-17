import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to upvote." }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    }

    const existingUpvote = await prisma.communityUpvote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.id,
        },
      },
    });

    let hasUpvoted = false;
    if (existingUpvote) {
      // Remove upvote
      await prisma.communityUpvote.delete({
        where: { id: existingUpvote.id },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotesCount: { decrement: 1 } },
      });
      hasUpvoted = false;
    } else {
      // Add upvote
      await prisma.communityUpvote.create({
        data: {
          postId,
          userId: session.id,
        },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotesCount: { increment: 1 } },
      });
      hasUpvoted = true;
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { upvotesCount: true },
    });

    return NextResponse.json({ success: true, hasUpvoted, upvotesCount: post?.upvotesCount || 0 });
  } catch (error: any) {
    console.error("Community Upvote Error:", error);
    return NextResponse.json({ error: "Failed to process upvote." }, { status: 500 });
  }
}
