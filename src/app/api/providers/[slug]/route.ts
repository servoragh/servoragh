import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const provider = await prisma.providerProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatarUrl: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
        services: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!provider) {
      const biz = await prisma.businessProfile.findUnique({
        where: { slug },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              avatarUrl: true,
              isPhoneVerified: true,
              createdAt: true,
            },
          },
          services: true,
        },
      });

      if (biz) {
        return NextResponse.json({
          provider: {
            id: biz.id,
            userId: biz.userId,
            businessName: biz.businessName,
            slug: biz.slug,
            bio: biz.description,
            yearsExperience: 1,
            pricingHourly: null,
            pricingFixedStart: null,
            serviceArea: biz.zone,
            verificationStatus: biz.verificationStatus,
            logoUrl: biz.logoUrl,
            ratingAverage: biz.ratingAverage,
            reviewCount: biz.reviewsCount,
            completedJobsCount: 0,
            badges: "[\"PHONE_VERIFIED\"]",
            portfolioUrls: "[]",
            user: biz.user,
            services: biz.services.map((s) => ({
              service: { id: s.id, name: s.serviceName },
            })),
          },
          reviews: [],
        });
      }

      return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
    }

    // Fetch provider reviews
    const reviews = await prisma.review.findMany({
      where: {
        targetId: provider.userId,
        isApproved: true,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        request: {
          select: {
            title: true,
            service: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ provider, reviews });
  } catch (error: any) {
    console.error("Get Provider Error:", error);
    return NextResponse.json({ error: "Failed to load provider profile." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { businessName, bio, serviceArea, yearsExperience, pricingHourly, pricingFixedStart } = body;

    const provider = await prisma.providerProfile.findUnique({ where: { slug } });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found." }, { status: 404 });
    }

    const updated = await prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(bio !== undefined && { bio }),
        ...(serviceArea !== undefined && { serviceArea }),
        ...(yearsExperience !== undefined && { yearsExperience: Number(yearsExperience) }),
        ...(pricingHourly !== undefined && { pricingHourly: Number(pricingHourly) }),
        ...(pricingFixedStart !== undefined && { pricingFixedStart: Number(pricingFixedStart) }),
      },
    });

    return NextResponse.json({ success: true, provider: updated });
  } catch (error: any) {
    console.error("Update Provider Error:", error);
    return NextResponse.json({ error: "Failed to update business profile." }, { status: 500 });
  }
}

