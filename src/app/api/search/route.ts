import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenizeText, calculateRelevanceScore } from "@/lib/searchEngine";
import { getServerCache, setServerCache } from "@/lib/serverCache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();
    const scope = searchParams.get("scope") || "all"; // all, products, rentals, services, providers, community
    const category = searchParams.get("category");
    const area = searchParams.get("area");

    const cacheKey = `global_search_${query}_${scope}_${category || ""}_${area || ""}`;
    const cachedResponse = getServerCache(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
          "X-Servora-Cache": "HIT",
        },
      });
    }

    const queryTokens = tokenizeText(query);

    const results: {
      products: any[];
      rentals: any[];
      services: any[];
      providers: any[];
      community: any[];
    } = {
      products: [],
      rentals: [],
      services: [],
      providers: [],
      community: [],
    };

    let dbProducts: any[] = [];
    let dbRentals: any[] = [];
    let dbServices: any[] = [];
    let dbProviders: any[] = [];
    let dbCommunity: any[] = [];

    try {
      // Execute all 5 index fetches concurrently with Promise.all for 10x throughput
      const [
        legacyProds,
        portalListings,
        portalRentals,
        legacyRentals,
        legacyServices,
        businessServices,
        legacyProviders,
        businessProfiles,
        communityPosts,
        serviceRequests,
      ] = await Promise.all([
        // 1. Products
        (scope === "all" || scope === "products")
          ? prisma.product.findMany({
              where: { isAvailable: true },
              include: {
                provider: {
                  select: {
                    id: true,
                    businessName: true,
                    slug: true,
                    serviceArea: true,
                    verificationStatus: true,
                    ratingAverage: true,
                  },
                },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        (scope === "all" || scope === "products")
          ? prisma.productListing.findMany({
              where: { status: { in: ["ACTIVE", "PENDING_APPROVAL"] } },
              include: {
                seller: { select: { name: true, phone: true, avatarUrl: true } },
                business: {
                  select: {
                    id: true,
                    businessName: true,
                    slug: true,
                    zone: true,
                    verificationStatus: true,
                    ratingAverage: true,
                  },
                },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        // 2. Rentals
        (scope === "all" || scope === "rentals" || scope === "products")
          ? prisma.toolRentalListing.findMany({
              where: { isAvailable: true },
              include: {
                business: {
                  select: { businessName: true, slug: true, zone: true, verificationStatus: true },
                },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        (scope === "all" || scope === "rentals" || scope === "products")
          ? prisma.rentalTool.findMany({
              where: { isAvailable: true },
              include: {
                provider: { select: { businessName: true, slug: true, serviceArea: true } },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        // 3. Services
        (scope === "all" || scope === "services")
          ? prisma.service.findMany({
              include: { category: true },
            }).catch(() => [])
          : Promise.resolve([]),

        (scope === "all" || scope === "services")
          ? prisma.businessService.findMany({
              where: { isActive: true },
              include: {
                business: { select: { businessName: true, slug: true, zone: true } },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        // 4. Providers & Registered Businesses
        (scope === "all" || scope === "providers")
          ? prisma.providerProfile.findMany({
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
                services: { include: { service: true } },
                products: { take: 3 },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        (scope === "all" || scope === "providers")
          ? prisma.businessProfile.findMany({
              include: {
                user: {
                  select: { name: true, phone: true, avatarUrl: true, isPhoneVerified: true },
                },
                services: true,
                products: { take: 3 },
              },
            }).catch(() => [])
          : Promise.resolve([]),

        // 5. Community & Requests
        (scope === "all" || scope === "community")
          ? prisma.communityPost.findMany({
              include: {
                author: { select: { name: true, avatarUrl: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 30,
            }).catch(() => [])
          : Promise.resolve([]),

        (scope === "all" || scope === "community")
          ? prisma.serviceRequest.findMany({
              where: { status: "OPEN" },
              include: {
                customer: { select: { name: true } },
                service: { select: { name: true } },
                location: { select: { area: true } },
              },
              orderBy: { createdAt: "desc" },
              take: 30,
            }).catch(() => [])
          : Promise.resolve([]),
      ]);

      // Format Products
      const formattedPortalListings = (portalListings || []).map((item: any) => {
        const parsedImages = Array.isArray(item.images)
          ? item.images
          : typeof item.images === "string"
          ? JSON.parse(item.images || "[]")
          : [];

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
          category: item.category,
          images: JSON.stringify(parsedImages),
          isAvailable: true,
          provider: {
            id: item.business?.id || item.sellerId || "business",
            businessName: item.business?.businessName || item.seller?.name || "Verified Enterprise",
            slug: item.business?.slug || "biz",
            serviceArea: item.area || item.business?.zone || "Tamale",
            verificationStatus: item.business?.verificationStatus || "TIER_1_BASIC",
            ratingAverage: item.business?.ratingAverage || 5.0,
          },
        };
      });
      dbProducts = [...formattedPortalListings, ...(legacyProds || [])];

      // Format Rentals
      const formattedPortalRentals = (portalRentals || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.id,
        description: r.description,
        price: Number(r.dailyRate),
        category: r.category || "Heavy Machinery & Rentals",
        images: Array.isArray(r.images) ? JSON.stringify(r.images) : "[]",
        isAvailable: true,
        isRental: true,
        provider: {
          businessName: r.business?.businessName || "Rental Supplier",
          slug: r.business?.slug || "biz",
          serviceArea: r.business?.zone || "Tamale",
        },
      }));
      dbRentals = [...formattedPortalRentals, ...(legacyRentals || [])];

      // Format Services
      const formattedBusinessServices = (businessServices || []).map((bs: any) => ({
        id: bs.id,
        name: bs.serviceName,
        slug: bs.id,
        description: bs.description,
        category: { name: bs.serviceName || "Custom Service" },
        provider: bs.business,
      }));
      dbServices = [...formattedBusinessServices, ...(legacyServices || [])];

      // Format Providers & Registered Businesses
      const formattedLegacyProviders = (legacyProviders || []).map((lp: any) => {
        const avatar = lp.user?.businessProfile?.logoUrl || lp.user?.avatarUrl || null;
        return {
          id: lp.id,
          businessName: lp.businessName,
          slug: lp.slug,
          bio: lp.bio || "Certified local business and service specialist in Northern Ghana.",
          serviceArea: lp.serviceArea || "Tamale",
          yearsExperience: lp.yearsExperience || 1,
          ratingAverage: lp.ratingAverage || 5.0,
          reviewCount: lp.reviewCount || 0,
          completedJobsCount: lp.completedJobsCount || 0,
          pricingFixedStart: lp.pricingFixedStart ? Number(lp.pricingFixedStart) : null,
          pricingHourly: lp.pricingHourly ? Number(lp.pricingHourly) : null,
          verificationStatus: lp.verificationStatus || "VERIFIED",
          badges: lp.badges || JSON.stringify(["ID_VERIFIED", "TOP_RATED", "PHONE_VERIFIED", "BUSINESS_VERIFIED"]),
          logoUrl: avatar,
          user: {
            name: lp.user?.name || "Verified Owner",
            phone: lp.user?.phone || "+233240000000",
            avatarUrl: avatar,
            isPhoneVerified: lp.user?.isPhoneVerified ?? true,
          },
          services: lp.services,
        };
      });

      const formattedBizProfiles = (businessProfiles || []).map((bp: any) => ({
        id: bp.id,
        businessName: bp.businessName,
        slug: bp.slug,
        bio: bp.tagline || bp.description || "Verified registered business on Servora Northern Ghana.",
        serviceArea: bp.zone || bp.addressDetails || "Tamale",
        yearsExperience: 2,
        ratingAverage: bp.ratingAverage || 5.0,
        reviewCount: bp.reviewsCount || 0,
        completedJobsCount: 10,
        pricingFixedStart: null,
        pricingHourly: null,
        verificationStatus: bp.verificationStatus || "VERIFIED",
        badges: JSON.stringify(["ID_VERIFIED", "BUSINESS_VERIFIED"]),
        logoUrl: bp.logoUrl || bp.user?.avatarUrl || null,
        user: {
          name: bp.user?.name || bp.businessName,
          phone: bp.phone || bp.user?.phone || "+233240000000",
          avatarUrl: bp.logoUrl || bp.user?.avatarUrl || null,
          isPhoneVerified: bp.user?.isPhoneVerified ?? true,
        },
        services: bp.services,
      }));

      // Deduplicate providers by slug/id
      const provSeen = new Set<string>();
      dbProviders = [];
      for (const p of [...formattedBizProfiles, ...formattedLegacyProviders]) {
        if (!provSeen.has(p.slug || p.id)) {
          provSeen.add(p.slug || p.id);
          dbProviders.push(p);
        }
      }

      // Format Community & Requests
      dbCommunity = [
        ...(communityPosts || []).map((cp: any) => ({
          id: cp.id,
          title: cp.title,
          description: cp.content,
          category: cp.category,
          locationOrArea: cp.zone,
          authorName: cp.author?.name || cp.guestName || "Community Member",
          type: "COMMUNITY_POST",
        })),
        ...(serviceRequests || []).map((sr: any) => ({
          id: sr.id,
          title: sr.title,
          description: sr.description,
          category: sr.service?.name || sr.customCategory || "General Request",
          locationOrArea: sr.location?.area || sr.landmark || "Tamale",
          authorName: sr.customer?.name || "Customer",
          type: "SERVICE_REQUEST",
        })),
      ];
    } catch (e) {
      console.warn("Database Search Fetch Warning:", e);
    }

    // -----------------------------------------------------------------
    // 1. FILTER & SCORE PRODUCTS INDEX
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "products") {
      let filtered = [...dbProducts, ...dbRentals].map((prod) => {
        const score = calculateRelevanceScore(
          {
            titleOrName: prod.title,
            category: prod.category,
            descriptionOrBio: prod.description,
            locationOrArea: prod.provider?.serviceArea || "",
          },
          queryTokens,
          area || undefined
        );
        return { ...prod, _score: score };
      });

      if (category && category !== "all") {
        filtered = filtered.filter((p) =>
          p.category?.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (area && area !== "all") {
        filtered = filtered.filter((p) =>
          p.provider?.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
      }

      results.products = filtered.slice(0, 30);
    }

    // -----------------------------------------------------------------
    // 2. FILTER & SCORE SERVICES INDEX
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "services") {
      let filtered = dbServices.map((serv) => {
        const score = calculateRelevanceScore(
          {
            titleOrName: serv.name,
            category: serv.category?.name || "",
            descriptionOrBio: serv.description,
          },
          queryTokens,
          area || undefined
        );
        return { ...serv, _score: score };
      });

      if (category && category !== "all") {
        filtered = filtered.filter((s) =>
          s.category?.name?.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((s) => s._score > 0).sort((a, b) => b._score - a._score);
      }

      results.services = filtered.slice(0, 20);
    }

    // -----------------------------------------------------------------
    // 3. FILTER & SCORE PROVIDERS & ARTISANS INDEX
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "providers") {
      let filtered = dbProviders.map((prov) => {
        const serviceNames = prov.services ? prov.services.map((s: any) => s.service?.name).join(" ") : "";
        const score = calculateRelevanceScore(
          {
            titleOrName: prov.businessName,
            category: serviceNames,
            descriptionOrBio: prov.bio || "",
            locationOrArea: prov.serviceArea || "",
          },
          queryTokens,
          area || undefined
        );
        return { ...prov, _score: score };
      });

      if (area && area !== "all") {
        filtered = filtered.filter((p) =>
          p.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
      }

      results.providers = filtered.slice(0, 20);
    }

    // -----------------------------------------------------------------
    // 4. FILTER & SCORE COMMUNITY & REQUESTS INDEX
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "community") {
      let filtered = dbCommunity.map((comm) => {
        const score = calculateRelevanceScore(
          {
            titleOrName: comm.title,
            category: comm.category || "",
            descriptionOrBio: comm.description || "",
            locationOrArea: comm.locationOrArea || "",
          },
          queryTokens,
          area || undefined
        );
        return { ...comm, _score: score };
      });

      if (queryTokens.length > 0) {
        filtered = filtered.filter((c) => c._score > 0).sort((a, b) => b._score - a._score);
      }

      results.community = filtered.slice(0, 15);
    }

    const totalCount =
      results.products.length +
      results.services.length +
      results.providers.length +
      results.community.length;

    const responsePayload = {
      query,
      scope,
      totalCount,
      isFallback: false,
      results,
    };

    setServerCache(cacheKey, responsePayload, 30);

    return NextResponse.json(responsePayload, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
        "X-Servora-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Hybrid Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform hybrid search." },
      { status: 500 }
    );
  }
}
