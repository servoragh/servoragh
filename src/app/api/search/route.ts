import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenizeText, calculateRelevanceScore } from "@/lib/searchEngine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();
    const scope = searchParams.get("scope") || "all"; // all, products, rentals, services, providers, community
    const category = searchParams.get("category");
    const area = searchParams.get("area");

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
      // -------------------------------------------------------------
      // INDEX 1: PRODUCTS CATALOG (ProductListing & Product)
      // -------------------------------------------------------------
      if (scope === "all" || scope === "products") {
        const legacyProds = await prisma.product.findMany({
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
        });

        const portalListings = await prisma.productListing.findMany({
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
        });

        const formattedPortalListings = portalListings.map((item) => {
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

        dbProducts = [...formattedPortalListings, ...legacyProds];
      }

      // -------------------------------------------------------------
      // INDEX 2: TOOL & EQUIPMENT RENTALS (ToolRentalListing & RentalTool)
      // -------------------------------------------------------------
      if (scope === "all" || scope === "rentals" || scope === "products") {
        const portalRentals = await prisma.toolRentalListing.findMany({
          where: { isAvailable: true },
          include: {
            business: {
              select: { businessName: true, slug: true, zone: true, verificationStatus: true },
            },
          },
        });

        const legacyRentals = await prisma.rentalTool.findMany({
          where: { isAvailable: true },
          include: {
            provider: { select: { businessName: true, slug: true, serviceArea: true } },
          },
        });

        const formattedPortalRentals = portalRentals.map((r) => ({
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

        dbRentals = [...formattedPortalRentals, ...legacyRentals];
      }

      // -------------------------------------------------------------
      // INDEX 3: SERVICES MENU (BusinessService & Service)
      // -------------------------------------------------------------
      if (scope === "all" || scope === "services") {
        const legacyServices = await prisma.service.findMany({
          include: { category: true },
        });

        const businessServices = await prisma.businessService.findMany({
          where: { isActive: true },
          include: {
            business: { select: { businessName: true, slug: true, zone: true } },
          },
        });

        const formattedBusinessServices = businessServices.map((bs) => ({
          id: bs.id,
          name: bs.serviceName,
          slug: bs.id,
          description: bs.description,
          category: { name: bs.serviceName || "Custom Service" },
          provider: bs.business,
        }));

        dbServices = [...formattedBusinessServices, ...legacyServices];
      }

      // -------------------------------------------------------------
      // INDEX 4: ARTISANS & BUSINESSES (BusinessProfile & ProviderProfile)
      // -------------------------------------------------------------
      if (scope === "all" || scope === "providers") {
        const legacyProviders = await prisma.providerProfile.findMany({
          include: {
            services: { include: { service: true } },
            products: { take: 3 },
          },
        });

        const businessProfiles = await prisma.businessProfile.findMany({
          include: {
            products: { take: 3 },
            services: { take: 3 },
            rentals: { take: 3 },
          },
        });

        const formattedBusinessProfiles = businessProfiles.map((bp) => ({
          id: bp.id,
          businessName: bp.businessName,
          slug: bp.slug,
          bio: bp.description,
          serviceArea: bp.zone,
          ratingAverage: bp.ratingAverage,
          verificationStatus: bp.verificationStatus,
          services: bp.services.map((s) => ({ service: { name: s.serviceName } })),
        }));

        dbProviders = [...formattedBusinessProfiles, ...legacyProviders];
      }

      // -------------------------------------------------------------
      // INDEX 5: COMMUNITY POSTS & SERVICE REQUESTS
      // -------------------------------------------------------------
      if (scope === "all" || scope === "community") {
        const communityPosts = await prisma.communityPost.findMany({
          include: {
            author: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        });

        const serviceRequests = await prisma.serviceRequest.findMany({
          where: { status: "OPEN" },
          include: {
            customer: { select: { name: true } },
            service: { select: { name: true } },
            location: { select: { area: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        });

        dbCommunity = [
          ...communityPosts.map((cp) => ({
            id: cp.id,
            title: cp.title,
            description: cp.content,
            category: cp.category,
            locationOrArea: cp.zone,
            authorName: cp.author?.name || cp.guestName || "Community Member",
            type: "COMMUNITY_POST",
          })),
          ...serviceRequests.map((sr) => ({
            id: sr.id,
            title: sr.title,
            description: sr.description,
            category: sr.service?.name || sr.customCategory || "General Request",
            locationOrArea: sr.location?.area || sr.landmark || "Tamale",
            authorName: sr.customer?.name || "Customer",
            type: "SERVICE_REQUEST",
          })),
        ];
      }
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

    // -----------------------------------------------------------------
    // ASYNCHRONOUS SEARCH TELEMETRY LOGGING
    // -----------------------------------------------------------------
    if (query) {
      prisma.searchQueryLog
        .create({
          data: {
            query,
            scope,
            filters: { category, area },
            resultCount: totalCount,
            userIp: request.headers.get("x-forwarded-for") || "127.0.0.1",
          },
        })
        .catch((err) => console.warn("Search Telemetry Log Warning:", err));
    }

    return NextResponse.json({
      query,
      scope,
      totalCount,
      isFallback: false,
      results,
    });
  } catch (error: any) {
    console.error("Hybrid Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform hybrid search." },
      { status: 500 }
    );
  }
}
