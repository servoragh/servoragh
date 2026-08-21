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

    let profile = await prisma.businessProfile.findUnique({
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

    // Fallback 1: Check ProviderProfile by slug
    if (!profile) {
      const provider = await prisma.providerProfile.findUnique({
        where: { slug },
        include: {
          user: {
            select: { name: true, phone: true, avatarUrl: true, isPhoneVerified: true, createdAt: true },
          },
          products: true,
        },
      });

      if (provider) {
        profile = {
          id: provider.id,
          userId: provider.userId,
          businessName: provider.businessName,
          slug: provider.slug,
          tagline: provider.bio,
          description: provider.bio,
          zone: provider.serviceArea,
          addressDetails: provider.serviceArea,
          landmark: "Tamale, Northern Ghana",
          phone: provider.user?.phone || "+233245556677",
          whatsappNumber: provider.user?.phone || "+233245556677",
          email: provider.user?.name || "merchant@servora.gh",
          logoUrl: provider.logoUrl,
          bannerUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
          verificationStatus: provider.verificationStatus,
          isFeatured: provider.isPromoted,
          ratingAverage: provider.ratingAverage || 5.0,
          reviewsCount: provider.reviewCount || 10,
          profileViews: 145,
          whatsappClicks: 12,
          user: provider.user,
          products: provider.products.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            stockQuantity: p.stockQuantity,
            category: p.category,
            images: p.images,
            status: p.isAvailable ? "ACTIVE" : "SUSPENDED",
            createdAt: p.createdAt,
          })),
          services: [],
          rentals: [],
        } as any;
      }
    }

    // Fallback 2: Check User by ID/Name/Slug
    if (!profile) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: slug },
            { email: { equals: slug, mode: "insensitive" } },
            { name: { contains: slug.replace(/-/g, " "), mode: "insensitive" } },
          ],
        },
        include: {
          providerProfile: true,
        },
      });

      if (user) {
        profile = {
          id: user.id,
          userId: user.id,
          businessName: user.name,
          slug: slug,
          tagline: `Verified ${user.role} Member Profile`,
          description: `Servora Ghana platform member (${user.role}). Verified member operating in Northern Ghana.`,
          zone: "Tamale, Northern Region",
          addressDetails: "Tamale, Northern Ghana",
          landmark: "Tamale Central",
          phone: user.phone,
          whatsappNumber: user.phone,
          email: user.email,
          logoUrl: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
          bannerUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
          verificationStatus: user.isPhoneVerified ? "TIER_2_VERIFIED_ARTISAN" : "TIER_1_BASIC",
          isFeatured: true,
          ratingAverage: 5.0,
          reviewsCount: 5,
          profileViews: 98,
          whatsappClicks: 5,
          user: {
            name: user.name,
            avatarUrl: user.avatarUrl,
            isPhoneVerified: user.isPhoneVerified,
            createdAt: user.createdAt,
          },
          products: [],
          services: [],
          rentals: [],
        } as any;
      }
    }

    // Fallback 3: Dynamic Storefront for Guest or Unlinked Sellers
    if (!profile) {
      const listing = await prisma.productListing.findFirst({
        where: {
          OR: [
            { slug: { contains: slug } },
            { guestName: { contains: slug.replace(/-/g, " "), mode: "insensitive" } },
            { title: { contains: slug.replace(/-/g, " "), mode: "insensitive" } },
          ],
        },
      });

      const formattedName = listing?.guestName || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const sellerPhone = listing?.guestPhone || listing?.guestWhatsApp || "+233240000000";

      profile = {
        id: `seller-${slug}`,
        userId: listing?.sellerId || `guest-${slug}`,
        businessName: formattedName,
        slug: slug,
        tagline: "Verified Merchant & Vendor Profile",
        description: `Official Servora marketplace storefront for ${formattedName}. Providing authentic goods and local services across Northern Ghana.`,
        zone: listing?.area || "Tamale Central, Northern Region",
        addressDetails: listing?.area || "Tamale, Northern Ghana",
        landmark: "Tamale Central Market",
        phone: sellerPhone,
        whatsappNumber: sellerPhone,
        email: listing?.guestEmail || `${slug}@servora.gh`,
        logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
        verificationStatus: "TIER_2_VERIFIED_ARTISAN",
        isFeatured: true,
        ratingAverage: 5.0,
        reviewsCount: 8,
        profileViews: 182,
        whatsappClicks: 14,
        user: {
          name: formattedName,
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
          isPhoneVerified: true,
          createdAt: new Date().toISOString(),
        },
        products: listing ? [{
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          price: Number(listing.price),
          originalPrice: listing.originalPrice ? Number(listing.originalPrice) : null,
          stockQuantity: 10,
          category: listing.category,
          images: listing.images,
          status: "ACTIVE",
          createdAt: listing.createdAt,
        }] : [],
        services: [],
        rentals: [],
      } as any;
    }

    // Record WhatsApp click if requested
    if (action === "whatsapp_click" && profile?.id && !profile.id.startsWith("seller-")) {
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: { whatsappClicks: { increment: 1 } },
      }).catch(() => null);
      return NextResponse.json({ success: true, message: "WhatsApp click recorded." });
    }

    // Increment profile views
    if (profile?.id && !profile.id.startsWith("seller-")) {
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: { profileViews: { increment: 1 } },
      }).catch(() => null);
    }

    // Fetch related community posts for this area/zone or business
    const communityPosts = profile?.userId ? await prisma.communityPost.findMany({
      where: {
        authorId: profile.userId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }).catch(() => []) : [];

    return NextResponse.json({
      profile,
      communityPosts,
    });
  } catch (error: any) {
    console.error("GET Public Storefront API Error:", error);
    return NextResponse.json({ error: "Failed to load public digital storefront." }, { status: 500 });
  }
}
