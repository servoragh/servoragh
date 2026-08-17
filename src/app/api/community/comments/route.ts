import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to post a reply." }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return NextResponse.json({ error: "Post ID and comment content are required." }, { status: 400 });
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        authorId: session.id,
        content,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
            providerProfile: { select: { businessName: true } },
          },
        },
      },
    });

    // Increment commentsCount on CommunityPost
    await prisma.communityPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error("Post Community Comment Error:", error);
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
  }
}
