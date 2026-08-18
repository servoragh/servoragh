import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addCommunityComment } from "@/lib/communityStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSession();
    const { id } = await params;
    const body = await request.json();
    const { content, guestName } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Comment text is required." }, { status: 400 });
    }

    const nameToUse = sessionUser ? sessionUser.name : guestName || "Guest Resident";
    const comment = await addCommunityComment(id, content.trim(), nameToUse);

    if (!comment) {
      return NextResponse.json({ error: "Community post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error("Community Comment Error:", error);
    return NextResponse.json({ error: "Failed to add comment." }, { status: 500 });
  }
}
