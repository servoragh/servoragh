import { NextResponse } from "next/server";
import { upvoteCommunityPost } from "@/lib/communityStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newCount = await upvoteCommunityPost(id);
    return NextResponse.json({ success: true, upvotesCount: newCount });
  } catch (error: any) {
    console.error("Community Upvote Error:", error);
    return NextResponse.json({ error: "Failed to upvote post." }, { status: 500 });
  }
}
