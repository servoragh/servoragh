import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Remove leading `@` if handle format `@business-slug` was passed
    const slug = rawSlug.startsWith("%40") || rawSlug.startsWith("@")
      ? rawSlug.replace(/^(%40|@)/, "")
      : rawSlug;

    const profile = await prisma.businessProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
        services: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        rentals: {
          where: { isAvailable: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    // Record WhatsApp click if requested
    if (action === "whatsapp_click") {
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: { whatsappClicks: { increment: 1 } },
      });
      return NextResponse.json({ success: true, message: "WhatsApp click recorded." });
    }

    // Increment profile views
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: { profileViews: { increment: 1 } },
    });

    // Fetch related community posts for this area/zone or business
    const communityPosts = await prisma.communityPost.findMany({
      where: {
        authorId: profile.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      profile,
      communityPosts,
    });
  } catch (error: any) {
    console.error("GET Public Storefront API Error:", error);
    return NextResponse.json({ error: "Failed to load public digital storefront." }, { status: 500 });
  }
}
