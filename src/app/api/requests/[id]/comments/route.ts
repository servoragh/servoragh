import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/requests/[id]/comments — fetch comments + like count for a request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the linked community post (auto-created when request is posted)
    const communityPost = await prisma.communityPost.findFirst({
      where: { serviceRequestId: id },
      include: {
        comments: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        upvotes: true,
      },
    });

    if (!communityPost) {
      return NextResponse.json({ comments: [], likes: 0, communityPostId: null });
    }

    return NextResponse.json({
      comments: communityPost.comments,
      likes: communityPost.upvotesCount,
      communityPostId: communityPost.id,
    });
  } catch (error: any) {
    console.error("Fetch Comments Error:", error);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

// POST /api/requests/[id]/comments — post a comment or a like
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();
    const { action, content, guestName } = body; // action: "COMMENT" | "LIKE"

    // Find or create a linked community post for this request
    let communityPost = await prisma.communityPost.findFirst({
      where: { serviceRequestId: id },
    });

    if (!communityPost) {
      // Lazy-create a community post for legacy requests
      const req = await prisma.serviceRequest.findUnique({
        where: { id },
        select: { title: true, description: true, customerId: true, guestName: true },
      });
      if (!req) return NextResponse.json({ error: "Request not found." }, { status: 404 });

      communityPost = await prisma.communityPost.create({
        data: {
          serviceRequestId: id,
          category: "SERVICE_CALL",
          title: req.title,
          content: req.description || "",
          zone: "ALL_NORTHERN_GH",
          authorId: req.customerId || undefined,
          guestName: req.guestName || undefined,
        },
      });
    }

    if (action === "LIKE") {
      // Toggle like
      const existingLike = session
        ? await prisma.communityUpvote.findFirst({
            where: { postId: communityPost.id, userId: session.id },
          })
        : null;

      if (existingLike) {
        // Remove like
        await prisma.communityUpvote.delete({ where: { id: existingLike.id } });
        await prisma.communityPost.update({
          where: { id: communityPost.id },
          data: { upvotesCount: { decrement: 1 } },
        });
        return NextResponse.json({ liked: false });
      } else {
        await prisma.communityUpvote.create({
          data: {
            postId: communityPost.id,
            userId: session?.id || undefined,
          },
        });
        await prisma.communityPost.update({
          where: { id: communityPost.id },
          data: { upvotesCount: { increment: 1 } },
        });

        // Notify requester if liked by someone else
        if (session) {
          const req = await prisma.serviceRequest.findUnique({
            where: { id },
            select: { customerId: true, title: true },
          });
          if (req && req.customerId !== session.id) {
            await prisma.notification.create({
              data: {
                userId: req.customerId,
                title: "Someone liked your request!",
                message: `${session.name} liked your job request.`,
                link: `/requests/${id}`,
              },
            }).catch(() => null);
          }
        }

        return NextResponse.json({ liked: true });
      }
    }

    if (action === "COMMENT") {
      if (!content?.trim()) {
        return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
      }

      const comment = await prisma.communityComment.create({
        data: {
          postId: communityPost.id,
          authorId: session?.id || undefined,
          guestName: !session ? (guestName || "Anonymous") : undefined,
          content: content.trim(),
        },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      await prisma.communityPost.update({
        where: { id: communityPost.id },
        data: { commentsCount: { increment: 1 } },
      });

      // Notify the request owner of a new comment
      const req = await prisma.serviceRequest.findUnique({
        where: { id },
        select: { customerId: true, title: true },
      });
      if (req && req.customerId && req.customerId !== session?.id) {
        await prisma.notification.create({
          data: {
            userId: req.customerId,
            title: "New comment on your request",
            message: `${session?.name || guestName || "Someone"} commented: "${content.slice(0, 60)}..."`,
            link: `/requests/${id}`,
          },
        }).catch(() => null);
      }

      return NextResponse.json({ comment });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Comment/Like Error:", error);
    return NextResponse.json({ error: "Failed to process action." }, { status: 500 });
  }
}
