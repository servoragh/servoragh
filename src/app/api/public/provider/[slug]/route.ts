import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;

    // Remove leading `@` or URL encoded `%40`
    const slug = rawSlug.startsWith("%40") || rawSlug.startsWith("@")
      ? rawSlug.replace(/^(%40|@)/, "")
      : rawSlug;

    // 1. Check BusinessProfile table
    let profile = await prisma.businessProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true, createdAt: true } },
        products: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } },
        services: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
        rentals: { where: { isAvailable: true }, orderBy: { createdAt: "desc" } },
      },
    });

    let result: any = null;

    if (profile) {
      const artisanName = profile.user?.name || profile.businessName;
      const coverage = profile.zone || "Tamale";

      result = {
        id: profile.id,
        slug: profile.slug,
        businessName: profile.businessName,
        artisanName: artisanName,
        experienceYears: 1,
        category: profile.tagline || profile.businessType || "Verified Business",
        verificationTier: profile.verificationStatus || "TIER_1_BASIC",
        isVerified: profile.verificationStatus !== "UNVERIFIED",
        logoUrl: profile.logoUrl || null,
        bannerUrl: profile.bannerUrl || null,
        storefrontPhotoUrl: profile.storefrontPhotoUrl || null,
        trustScore: profile.verificationStatus === "UNVERIFIED" ? 60 : 100,
        ratingAverage: profile.ratingAverage || 0,
        rating: profile.ratingAverage || 0,
        reviewsCount: profile.reviewsCount || 0,
        reviewCount: profile.reviewsCount || 0,
        completedJobsCount: 0,
        completedJobs: 0,
        hourlyRate: "",
        startingPrice: "",
        responseSpeed: "< 30 minutes",
        coverageZones: [coverage],
        aboutText: profile.description || "",
        joinedDate: profile.createdAt.toISOString(),
        phone: profile.phone || profile.whatsappNumber || profile.user?.phone || "",
        whatsappNumber: profile.whatsappNumber || profile.phone || profile.user?.phone || "",
        zone: coverage,
        latitude: profile.latitude || null,
        longitude: profile.longitude || null,
        isOpenNow: true,
        businessHours: profile.businessHours || null,
        bio: profile.description || "",
        catalogs: {
          products: profile.products.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            price: Number(p.price),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
            images: Array.isArray(p.images) ? JSON.stringify(p.images) : p.images || "[]",
            category: p.category || "General",
            condition: p.condition || "Brand New",
            inStock: (p.stockQuantity ?? 1) > 0,
            location: coverage,
            discountPercent: 0,
          })),
          services: profile.services.map((s) => ({
            id: s.id,
            name: s.serviceName,
            description: s.description,
            startingPrice: s.startingPrice ? Number(s.startingPrice) : null,
            estimatedTime: s.estimatedDuration || "On Request",
          })),
          rentals: profile.rentals.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            dailyRate: Number(r.dailyRate),
            depositRequired: r.securityDeposit ? Number(r.securityDeposit) : 0,
            images: Array.isArray(r.images) ? JSON.stringify(r.images) : r.images || "[]",
            isAvailable: r.isAvailable,
          })),
          portfolio: [],
        },
        reviews: [],
      };
    } else {
      // 2. Check ProviderProfile table fallback
      const provider = await prisma.providerProfile.findUnique({
        where: { slug },
        include: {
          user: { select: { name: true, phone: true, avatarUrl: true, createdAt: true } },
          products: { where: { isAvailable: true }, orderBy: { createdAt: "desc" } },
          services: { include: { service: true } },
          rentalTools: { where: { isAvailable: true }, orderBy: { createdAt: "desc" } },
        },
      });

      if (provider) {
        const artisanName = provider.user?.name || provider.businessName;
        const coverage = provider.serviceArea || "Tamale";

        result = {
          id: provider.id,
          slug: provider.slug,
          businessName: provider.businessName,
          artisanName: artisanName,
          experienceYears: provider.yearsExperience || 1,
          category: provider.bio || "Services",
          verificationTier: provider.verificationStatus || "TIER_1_BASIC",
          isVerified: provider.verificationStatus === "VERIFIED",
          logoUrl: provider.logoUrl || null,
          bannerUrl: null,
          trustScore: provider.verificationStatus === "VERIFIED" ? 100 : 70,
          ratingAverage: provider.ratingAverage || 0,
          rating: provider.ratingAverage || 0,
          reviewsCount: provider.reviewCount || 0,
          reviewCount: provider.reviewCount || 0,
          completedJobsCount: provider.completedJobsCount || 0,
          completedJobs: provider.completedJobsCount || 0,
          hourlyRate: provider.pricingHourly ? `GH₵ ${Number(provider.pricingHourly).toFixed(2)}/hr` : "",
          startingPrice: provider.pricingFixedStart ? `GH₵ ${Number(provider.pricingFixedStart).toFixed(2)}` : "",
          responseSpeed: "< 30 minutes",
          coverageZones: [coverage],
          aboutText: provider.bio || "",
          joinedDate: provider.createdAt.toISOString(),
          phone: provider.user?.phone || "",
          whatsappNumber: provider.user?.phone || "",
          zone: coverage,
          latitude: null,
          longitude: null,
          isOpenNow: true,
          businessHours: null,
          bio: provider.bio || "",
          catalogs: {
            products: provider.products.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description,
              price: Number(p.price),
              originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
              images: p.images,
              category: p.category || "General",
              condition: "Brand New",
              inStock: (p.stockQuantity ?? 1) > 0,
              location: coverage,
              discountPercent: 0,
            })),
            services: provider.services.map((ps) => ({
              id: ps.id,
              name: ps.service?.name || "Custom Service",
              description: ps.service?.description || "",
              startingPrice: null,
              estimatedTime: "On Request",
            })),
            rentals: provider.rentalTools.map((r) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              dailyRate: Number(r.dailyRate),
              depositRequired: 0,
              images: r.images,
              isAvailable: r.isAvailable,
            })),
            portfolio: [],
          },
          reviews: [],
        };
      } else {
        return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET Public Provider Storefront API Error:", error);
    return NextResponse.json({ error: "Failed to fetch public provider storefront." }, { status: 500 });
  }
}
