import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchProductTaxonomy } from "@/lib/taxonomyResolver";
import { getServerCache, setServerCache } from "@/lib/serverCache";
import { filterAndRankItems, extractQueryTokens } from "@/lib/reliableSearch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const providerSlug = searchParams.get("provider");
    const area = searchParams.get("area");
    const search = searchParams.get("q");
    const sortBy = searchParams.get("sortBy") || "newest";
    const includeInactive = searchParams.get("all") === "true";

    // Fast In-Memory Cache Lookup (Sub-millisecond instant return)
    const cacheKey = `products_${category || ""}_${subCategory || ""}_${providerSlug || ""}_${area || ""}_${search || ""}_${sortBy}_${includeInactive}`;
    const cachedResponse = getServerCache(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
          "X-Servora-Cache": "HIT",
        },
      });
    }

    // 1. Where clause for legacy `prisma.product`
    const productWhere: any = {};
    if (!includeInactive) productWhere.isAvailable = true;
    if (providerSlug) {
      productWhere.OR = [
        { provider: { slug: providerSlug } },
        { provider: { user: { businessProfile: { slug: providerSlug } } } },
      ];
    }
    if (area && area !== "all") {
      productWhere.provider = {
        ...(productWhere.provider || {}),
        serviceArea: { contains: area, mode: "insensitive" },
      };
    }
    // Token & Synonym Expansion for DB search
    if (search && search.trim()) {
      const { rawTokens, synonymTokens } = extractQueryTokens(search);
      const allSearchTerms = Array.from(new Set([...rawTokens, ...synonymTokens.slice(0, 3)]));

      if (allSearchTerms.length > 0) {
        productWhere.OR = allSearchTerms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { category: { contains: term, mode: "insensitive" } },
        ]);
      }
    }

    // 2. Where clause for `prisma.productListing`
    const listingWhere: any = {};
    if (!includeInactive) {
      listingWhere.status = { in: ["ACTIVE", "PENDING_APPROVAL"] };
    }
    if (providerSlug) {
      listingWhere.OR = [
        { business: { slug: providerSlug } },
        { seller: { businessProfile: { slug: providerSlug } } },
        { seller: { providerProfile: { slug: providerSlug } } },
      ];
    }
    if (area && area !== "all") {
      listingWhere.area = { contains: area, mode: "insensitive" };
    }
    if (search && search.trim()) {
      const { rawTokens, synonymTokens } = extractQueryTokens(search);
      const allSearchTerms = Array.from(new Set([...rawTokens, ...synonymTokens.slice(0, 3)]));

      if (allSearchTerms.length > 0) {
        listingWhere.OR = allSearchTerms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { category: { contains: term, mode: "insensitive" } },
          { subCategory: { contains: term, mode: "insensitive" } },
        ]);
      }
    }

    // Run both queries concurrently with Promise.all for maximum speed!
    const [legacyProducts, portalListings] = await Promise.all([
      prisma.product.findMany({
        where: productWhere,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              logoUrl: true,
              serviceArea: true,
              ratingAverage: true,
              verificationStatus: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  avatarUrl: true,
                  isOnline: true,
                  lastSeen: true,
                  businessProfile: {
                    select: {
                      id: true,
                      isOnline: true,
                      lastSeen: true,
                      businessHours: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productListing.findMany({
        where: listingWhere,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              isOnline: true,
              lastSeen: true,
              businessProfile: { select: { id: true, slug: true, businessName: true, logoUrl: true, zone: true, isOnline: true, lastSeen: true, businessHours: true } },
              providerProfile: { select: { id: true, slug: true, businessName: true, logoUrl: true, serviceArea: true } },
            },
          },
          business: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              logoUrl: true,
              zone: true,
              verificationStatus: true,
              ratingAverage: true,
              isOnline: true,
              lastSeen: true,
              businessHours: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Format ProductListing records to match Product structure
    const formattedPortalProducts = portalListings.map((item: any) => {
      const parsedImages = Array.isArray(item.images)
        ? item.images
        : typeof item.images === "string"
        ? JSON.parse(item.images || "[]")
        : [];

      const providerSlug =
        item.business?.slug ||
        item.seller?.businessProfile?.slug ||
        item.seller?.providerProfile?.slug ||
        "savannah-fresh-farms";

      const providerName =
        item.business?.businessName ||
        item.seller?.businessProfile?.businessName ||
        item.seller?.providerProfile?.businessName ||
        item.seller?.name ||
        "Verified Enterprise";

      const providerLogo =
        item.business?.logoUrl ||
        item.seller?.businessProfile?.logoUrl ||
        item.seller?.avatarUrl ||
        null;

      const providerArea =
        item.area ||
        item.business?.zone ||
        item.seller?.businessProfile?.zone ||
        "Tamale";

      const isOnline = item.business?.isOnline || item.seller?.isOnline || false;
      const lastSeen = item.business?.lastSeen || item.seller?.lastSeen || null;

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
        category: item.category,
        subCategory: item.subCategory || null,
        categoryId: item.categoryId || null,
        subCategoryId: item.subCategoryId || null,
        isAvailable: item.status === "ACTIVE" || item.status === "PENDING_APPROVAL",
        images: parsedImages,
        createdAt: item.createdAt,
        provider: {
          id: item.businessId || item.sellerId || "default-provider",
          businessName: providerName,
          slug: providerSlug,
          logoUrl: providerLogo,
          serviceArea: providerArea,
          ratingAverage: item.business?.ratingAverage || 4.8,
          verificationStatus: item.business?.verificationStatus || "TIER_2_VERIFIED_ARTISAN",
          isOnline,
          lastSeen,
          businessHours: item.business?.businessHours || null,
          user: item.seller ? { id: item.seller.id, name: item.seller.name, phone: item.seller.phone, avatarUrl: item.seller.avatarUrl } : null,
        },
      };
    });

    // Legacy products formatting
    const formattedLegacyProducts = legacyProducts.map((p: any) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      subCategory: p.subCategory || null,
      provider: {
        ...p.provider,
        isOnline: p.provider?.user?.businessProfile?.isOnline || p.provider?.user?.isOnline || false,
        lastSeen: p.provider?.user?.businessProfile?.lastSeen || p.provider?.user?.lastSeen || null,
        businessHours: p.provider?.user?.businessProfile?.businessHours || null,
      },
    }));

    // Merge and deduplicate by slug
    const mergedMap = new Map<string, any>();
    for (const p of formattedPortalProducts) {
      if (p.slug) mergedMap.set(p.slug, p);
    }
    for (const p of formattedLegacyProducts) {
      if (p.slug && !mergedMap.has(p.slug)) {
        mergedMap.set(p.slug, p);
      }
    }

    let allMerged = Array.from(mergedMap.values());

    // STRICT CANONICAL TAXONOMY MATCHING (Occurs BEFORE sorting!)
    if ((category && category !== "all") || (subCategory && subCategory !== "all")) {
      allMerged = allMerged.filter((p) => matchProductTaxonomy(p, category, subCategory));
    }

    // RELIABLE INTELLIGENT RELEVANCE RANKING (If search is present)
    if (search && search.trim()) {
      allMerged = filterAndRankItems(allMerged, search, (p: any) => ({
        title: p.title,
        category: p.category,
        subCategory: p.subCategory,
        description: p.description,
        price: p.price,
        area: p.provider?.serviceArea || p.area,
      }));
    }

    // MODERN PRODUCT SORTING (Applied AFTER filtering / if user selected explicit sort)
    if (!search || (sortBy && sortBy !== "newest")) {
      allMerged.sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "price_asc") {
          return a.price - b.price;
        }
        if (sortBy === "price_desc") {
          return b.price - a.price;
        }
        if (sortBy === "rating") {
          return (b.provider?.ratingAverage || 0) - (a.provider?.ratingAverage || 0);
        }
        // Default: "newest"
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const responsePayload = { products: allMerged, total: allMerged.length };
    setServerCache(cacheKey, responsePayload, 30);

    return NextResponse.json(
      responsePayload,
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
          "X-Servora-Cache": "MISS",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
