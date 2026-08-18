import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const status = searchParams.get("status");

    const whereClause: any = {};

    // Category Filter with Equivalencies
    if (category && category !== "ALL") {
      if (category === "EQUIPMENT_RENTAL") {
        whereClause.category = { in: ["EQUIPMENT_RENTAL", "EQUIPMENT_NEEDED"] };
      } else if (category === "MEETUP") {
        whereClause.category = { in: ["MEETUP", "ARTISAN_MEETUP"] };
      } else if (category === "ALERT") {
        whereClause.category = { in: ["ALERT", "NEIGHBORHOOD_NOTICE"] };
      } else {
        whereClause.category = category;
      }
    }

    // Area Filter: ONLY filter if a specific area is chosen (not ALL / ALL_TAMALE)
    if (area && area !== "ALL" && area !== "ALL_TAMALE") {
      whereClause.area = { contains: area };
    }

    // Status Filter
    if (status && status !== "ALL") {
      if (status === "OPEN") {
        whereClause.status = { in: ["OPEN", "PUBLISHED"] };
      } else {
        whereClause.status = status;
      }
    }

    const posts = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
            role: true,
            providerProfile: {
              select: {
                businessName: true,
                slug: true,
                verificationStatus: true,
                logoUrl: true,
              },
            },
          },
        },
        serviceRequest: {
          include: {
            service: { select: { name: true } },
            location: { select: { area: true } },
            quotes: { select: { id: true, price: true, status: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                avatarUrl: true,
                providerProfile: {
                  select: { businessName: true },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        upvotes: session ? { where: { userId: session.id } } : false,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      hasUpvoted: session && Array.isArray(post.upvotes) ? post.upvotes.length > 0 : false,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: any) {
    console.error("Fetch Community Posts Error:", error);
    return NextResponse.json({ error: "Failed to fetch community posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    const body = await request.json();
    const { title, content, category, area, images, allowDirectCall, allowWhatsApp, guestName, guestPhone } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Post title and content are required." }, { status: 400 });
    }

    let guestContactStr: string | null = null;
    if (!session) {
      if (!guestName || !guestPhone) {
        return NextResponse.json({ error: "Guest posts require Name and Phone number." }, { status: 400 });
      }
      guestContactStr = JSON.stringify({ name: guestName, phone: guestPhone, whatsapp: guestPhone });
    }

    const newPost = await prisma.communityPost.create({
      data: {
        authorId: session ? session.id : null,
        title,
        content,
        category: (category || "ALL_DISCUSSIONS") as any,
        zone: "ALL_NORTHERN_GH" as any,
        photos: images || [],
        guestName: guestName || null,
        guestPhone: guestPhone || null,
        guestWhatsApp: guestPhone || null,
        status: "OPEN_ACTIVE" as any,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
            providerProfile: {
              select: { businessName: true, slug: true, verificationStatus: true },
            },
          },
        },
        comments: true,
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    console.error("Create Community Post Error:", error);
    return NextResponse.json({ error: "Failed to submit community post." }, { status: 500 });
  }
}
