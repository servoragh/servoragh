import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCommunityPosts, createCommunityPost } from "@/lib/communityStore";
import { RegionZone, PostCategory, ItemStatus } from "@/lib/communityTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const zone = (searchParams.get("zone") as RegionZone | "ALL") || "ALL";
    const category = (searchParams.get("category") as PostCategory | "ALL") || "ALL";
    const status = (searchParams.get("status") as ItemStatus | "ALL") || "ALL";

    const { posts, total } = await getAllCommunityPosts({
      search,
      zone,
      category,
      status,
    });

    return NextResponse.json({
      success: true,
      posts,
      total,
    });
  } catch (error: any) {
    console.error("Community Feed GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch community trade board feed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSession();
    const body = await request.json();

    const {
      title,
      content,
      category,
      zone,
      budget,
      currency,
      urgency,
      photos,
      guestName,
      guestPhone,
      guestWhatsApp,
    } = body;

    if (!title || !content || !category || !zone) {
      return NextResponse.json(
        { error: "Title, content, category, and neighborhood zone are required." },
        { status: 400 }
      );
    }

    if (!sessionUser && (!guestName || !guestPhone)) {
      return NextResponse.json(
        { error: "Guest name and phone number are required for unauthenticated postings." },
        { status: 400 }
      );
    }

    const newPost = await createCommunityPost(
      {
        title,
        content,
        category,
        zone,
        budget: budget ? Number(budget) : undefined,
        currency: currency || "GHS",
        urgency: urgency || "Flexible",
        photos: Array.isArray(photos) ? photos : [],
        guestName,
        guestPhone,
        guestWhatsApp: guestWhatsApp || guestPhone,
      },
      sessionUser
    );

    return NextResponse.json({
      success: true,
      message: "Notice / Equipment Call published successfully on Community Trade Board.",
      post: newPost,
    });
  } catch (error: any) {
    console.error("Create Community Post Error:", error);
    return NextResponse.json({ error: "Failed to publish notice on trade board." }, { status: 500 });
  }
}
