import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id: postId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["OPEN", "RESOLVED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid post status." }, { status: 400 });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.authorId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Permission denied." }, { status: 403 });
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: { status },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error("Update Community Post Status Error:", error);
    return NextResponse.json({ error: "Failed to update post status." }, { status: 500 });
  }
}
