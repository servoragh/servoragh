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

    if (profile) {
      // Merge any additional product listings or legacy products linked to this business owner
      const extraListings = await prisma.productListing.findMany({
        where: {
          sellerId: profile.userId,
          businessId: { not: profile.id },
          status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
        },
      });

      const legacyProducts = await prisma.product.findMany({
        where: {
          provider: {
            OR: [
              { userId: profile.userId },
              { slug: profile.slug },
            ],
          },
          isAvailable: true,
        },
      });

      const formattedLegacy = legacyProducts.map((lp) => ({
        id: lp.id,
        title: lp.title,
        slug: lp.slug,
        description: lp.description,
        price: lp.price,
        originalPrice: lp.originalPrice,
        stockQuantity: lp.stockQuantity,
        category: lp.category,
        images: lp.images,
        status: "ACTIVE",
        createdAt: lp.createdAt,
      }));

      const pSlugs = new Set((profile.products || []).map((p: any) => p.slug));
      for (const item of [...extraListings, ...formattedLegacy]) {
        if (!pSlugs.has(item.slug)) {
          pSlugs.add(item.slug);
          profile.products.push(item as any);
        }
      }
    }

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
        const extraListings = await prisma.productListing.findMany({
          where: {
            OR: [
              { sellerId: provider.userId },
              { business: { slug } },
            ],
            status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
          },
        });

        const bizServices = await prisma.businessService.findMany({
          where: {
            OR: [
              { business: { userId: provider.userId } },
              { business: { slug } },
            ],
            isActive: true,
          },
        });

        const bizRentals = await prisma.toolRentalListing.findMany({
          where: {
            OR: [
              { business: { userId: provider.userId } },
              { business: { slug } },
            ],
            isAvailable: true,
          },
        });

        profile = {
          id: provider.id,
          userId: provider.userId,
          businessName: provider.businessName,
          slug: provider.slug,
          tagline: provider.bio || "Verified Merchant",
          description: provider.bio || "",
          zone: provider.serviceArea,
          addressDetails: provider.serviceArea,
          landmark: provider.serviceArea || "Tamale",
          phone: provider.user?.phone || "",
          whatsappNumber: provider.user?.phone || "",
          email: provider.user?.name || "",
          logoUrl: provider.logoUrl || provider.user?.avatarUrl || null,
          bannerUrl: null,
          storefrontPhotoUrl: (provider as any).storefrontPhotoUrl || null,
          verificationStatus: provider.verificationStatus,
          isFeatured: provider.isPromoted,
          ratingAverage: provider.ratingAverage || 0,
          reviewsCount: provider.reviewCount || 0,
          profileViews: 0,
          whatsappClicks: 0,
          user: provider.user,
          products: [
            ...provider.products.map((p) => ({
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
            ...extraListings.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description,
              price: p.price,
              originalPrice: p.originalPrice,
              stockQuantity: p.stockQuantity,
              category: p.category,
              images: p.images,
              status: "ACTIVE",
              createdAt: p.createdAt,
            })),
          ],
          services: bizServices,
          rentals: bizRentals,
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
          description: `Servora Ghana platform member (${user.role}).`,
          zone: "Tamale",
          addressDetails: "Tamale",
          landmark: "Tamale",
          phone: user.phone,
          whatsappNumber: user.phone,
          email: user.email,
          logoUrl: user.avatarUrl,
          bannerUrl: null,
          verificationStatus: user.isPhoneVerified ? "TIER_2_VERIFIED_ARTISAN" : "TIER_1_BASIC",
          isFeatured: false,
          ratingAverage: 0,
          reviewsCount: 0,
          profileViews: 0,
          whatsappClicks: 0,
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

      if (listing) {
        const formattedName = listing.guestName || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const sellerPhone = listing.guestPhone || listing.guestWhatsApp || "";

        profile = {
          id: `seller-${slug}`,
          userId: listing.sellerId || `guest-${slug}`,
          businessName: formattedName,
          slug: slug,
          tagline: "Marketplace Vendor Profile",
          description: `Marketplace storefront for ${formattedName}.`,
          zone: listing.area || "Tamale",
          addressDetails: listing.area || "Tamale",
          landmark: "Tamale",
          phone: sellerPhone,
          whatsappNumber: sellerPhone,
          email: listing.guestEmail || "",
          logoUrl: null,
          bannerUrl: null,
          verificationStatus: "TIER_1_BASIC",
          isFeatured: false,
          ratingAverage: 0,
          reviewsCount: 0,
          profileViews: 0,
          whatsappClicks: 0,
          user: {
            name: formattedName,
            avatarUrl: null,
            isPhoneVerified: true,
            createdAt: new Date().toISOString(),
          },
          products: [{
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            description: listing.description,
            price: Number(listing.price),
            originalPrice: listing.originalPrice ? Number(listing.originalPrice) : null,
            stockQuantity: 1,
            category: listing.category,
            images: listing.images,
            status: "ACTIVE",
            createdAt: listing.createdAt,
          }],
          services: [],
          rentals: [],
        } as any;
      }
    }

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
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
