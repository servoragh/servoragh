import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const serviceSlug = searchParams.get("service");
    const area = searchParams.get("area");
    const search = searchParams.get("q");
    const verifiedOnly = searchParams.get("verified") === "true";

    const whereClause: any = {};

    if (verifiedOnly) {
      whereClause.verificationStatus = "VERIFIED";
    }

    if (area) {
      whereClause.serviceArea = {
        contains: area,
      };
    }

    if (search) {
      whereClause.OR = [
        { businessName: { contains: search } },
        { bio: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    if (serviceSlug) {
      whereClause.services = {
        some: {
          service: {
            slug: serviceSlug,
          },
        },
      };
    } else if (categorySlug) {
      whereClause.services = {
        some: {
          service: {
            category: {
              slug: categorySlug,
            },
          },
        },
      };
    }

    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
            isPhoneVerified: true,
            businessProfile: {
              select: {
                logoUrl: true,
                bannerUrl: true,
              },
            },
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
      orderBy: [
        { isPromoted: "desc" },
        { verificationStatus: "desc" },
        { ratingAverage: "desc" },
        { completedJobsCount: "desc" },
      ],
    });

    const formattedProviders = providers.map((p) => {
      const avatar = p.user?.businessProfile?.logoUrl || p.user?.avatarUrl || null;
      return {
        ...p,
        logoUrl: avatar,
        user: {
          name: p.user?.name || "Verified Owner",
          phone: p.user?.phone || "+233240000000",
          avatarUrl: avatar,
          isPhoneVerified: p.user?.isPhoneVerified ?? true,
        },
      };
    });

    return NextResponse.json({ providers: formattedProviders });
  } catch (error: any) {
    console.error("Fetch Providers Error:", error);
    return NextResponse.json({ error: "Failed to search service providers." }, { status: 500 });
  }
}
