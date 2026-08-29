import { prisma } from "@/lib/prisma";
import {
  GHANAIAN_TRADE_SYNONYMS,
  COMMON_TYPO_MAP,
  SEARCH_STOP_WORDS,
  NORTHERN_GHANA_ZONES,
  SEARCH_RANKING_WEIGHTS,
} from "./config";

export interface UniversalSearchOptions {
  zone?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  entity?: "all" | "products" | "rentals" | "artisans" | "community";
  verifiedOnly?: boolean;
  limit?: number;
  userId?: string;
  deviceType?: "WEB" | "MOBILE_ANDROID" | "MOBILE_IOS";
}

export interface SearchHitItem {
  id: string;
  entityType: "product" | "rental" | "artisan" | "community";
  title: string;
  slug?: string;
  subtitle: string;
  description: string;
  category: string;
  zone: string;
  price?: number;
  priceDisplay?: string;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  phone?: string;
  score: number;
  highlightedTitle: string;
  highlightedSubtitle: string;
  raw: any;
}

export interface UniversalSearchResponse {
  success: boolean;
  processingTimeMs: number;
  query: string;
  normalizedQuery: string;
  detectedZone?: string;
  expandedTerms: string[];
  totalHits: number;
  facets: {
    categories: Record<string, number>;
    zones: Record<string, number>;
    entities: {
      products: number;
      rentals: number;
      artisans: number;
      community: number;
    };
  };
  hits: {
    all: SearchHitItem[];
    products: SearchHitItem[];
    rentals: SearchHitItem[];
    artisans: SearchHitItem[];
    community: SearchHitItem[];
  };
  zeroMatchPrompt?: {
    isZeroMatch: boolean;
    suggestedQuery: string;
    broadcastMessage: string;
    defaultCategory: string;
  };
}

/**
 * Highlights matching tokens within text with <mark> tags
 */
function generateHighlight(text: string, tokens: string[]): string {
  if (!text) return "";
  let result = text;
  for (const token of tokens) {
    if (token.length < 2) continue;
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  }
  return result;
}

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Expand query tokens using phonetic corrections and Ghanaian trade dialect dictionary
 */
export function expandQuery(rawQuery: string): {
  cleanQuery: string;
  tokens: string[];
  expandedTerms: string[];
  detectedZone?: string;
} {
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return { cleanQuery: "", tokens: [], expandedTerms: [] };

  // Detect explicit or implicit neighborhood zone
  let detectedZone: string | undefined;
  for (const zone of NORTHERN_GHANA_ZONES) {
    if (clean.includes(zone.toLowerCase())) {
      detectedZone = zone;
      break;
    }
  }

  // Split tokens
  const rawTokens = clean
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const tokens: string[] = [];
  const expandedSet = new Set<string>();

  for (const rawToken of rawTokens) {
    // 1. Check typo dictionary
    const corrected = COMMON_TYPO_MAP[rawToken] || rawToken;
    tokens.push(corrected);
    expandedSet.add(corrected);

    // 2. Expand Ghanaian dialect synonyms
    if (GHANAIAN_TRADE_SYNONYMS[corrected]) {
      GHANAIAN_TRADE_SYNONYMS[corrected].forEach((syn) => expandedSet.add(syn.toLowerCase()));
    }

    // Check multi-word synonym keys (e.g., "cement mixer", "poly tank")
    for (const [key, syns] of Object.entries(GHANAIAN_TRADE_SYNONYMS)) {
      if (clean.includes(key)) {
        syns.forEach((syn) => expandedSet.add(syn.toLowerCase()));
      }
    }
  }

  return {
    cleanQuery: clean,
    tokens,
    expandedTerms: Array.from(expandedSet),
    detectedZone,
  };
}

/**
 * Execute multi-index hybrid search
 */
export async function executeUniversalSearch(
  rawQuery: string,
  options: UniversalSearchOptions = {}
): Promise<UniversalSearchResponse> {
  const startTime = Date.now();
  const limit = options.limit || 24;
  const targetEntity = options.entity || "all";
  const filterZone = options.zone || undefined;
  const filterCategory = options.category || undefined;

  const { cleanQuery, tokens, expandedTerms, detectedZone } = expandQuery(rawQuery);
  const activeZone = filterZone || detectedZone;

  // Build search conditions
  const searchTerms = Array.from(new Set([...tokens, ...expandedTerms])).filter(
    (t) => !SEARCH_STOP_WORDS.has(t) && t.length >= 2
  );
  const primarySearch = cleanQuery.replace(/\bnear me\b/gi, "").trim();

  // 1. Execute concurrent index queries
  const [productsRaw, rentalsRaw, artisansRaw, communityRaw] = await Promise.all([
    targetEntity === "all" || targetEntity === "products"
      ? queryProductsIndex(primarySearch, searchTerms, activeZone, filterCategory, options)
      : Promise.resolve([]),
    targetEntity === "all" || targetEntity === "rentals"
      ? queryRentalsIndex(primarySearch, searchTerms, activeZone, options)
      : Promise.resolve([]),
    targetEntity === "all" || targetEntity === "artisans"
      ? queryArtisansIndex(primarySearch, searchTerms, activeZone, filterCategory, options)
      : Promise.resolve([]),
    targetEntity === "all" || targetEntity === "community"
      ? queryCommunityIndex(primarySearch, searchTerms, activeZone, options)
      : Promise.resolve([]),
  ]);

  // 2. Score and Rank Results
  const products = scoreAndSort(productsRaw, tokens, searchTerms, activeZone);
  const rentals = scoreAndSort(rentalsRaw, tokens, searchTerms, activeZone);
  const artisans = scoreAndSort(artisansRaw, tokens, searchTerms, activeZone);
  const community = scoreAndSort(communityRaw, tokens, searchTerms, activeZone);

  // 3. Global aggregation & interleaving for unified feed
  const allHits = [...products, ...rentals, ...artisans, ...community].sort((a, b) => b.score - a.score);

  // 4. Facet Aggregations
  const categoryFacets: Record<string, number> = {};
  const zoneFacets: Record<string, number> = {};

  allHits.forEach((hit) => {
    if (hit.category) {
      categoryFacets[hit.category] = (categoryFacets[hit.category] || 0) + 1;
    }
    if (hit.zone) {
      zoneFacets[hit.zone] = (zoneFacets[hit.zone] || 0) + 1;
    }
  });

  const totalHits = allHits.length;
  const processingTimeMs = Math.max(8, Date.now() - startTime);

  // 5. Zero-Match & Low-Match Demand Telemetry Capture
  const isZeroMatch = totalHits === 0;
  const zeroMatchPrompt = isZeroMatch
    ? {
        isZeroMatch: true,
        suggestedQuery: rawQuery,
        broadcastMessage: `Can't find "${rawQuery}"? Broadcast a Service Request / Community Call to Tamale suppliers and verified artisans.`,
        defaultCategory: filterCategory || "General Request",
      }
    : undefined;

  // Log telemetry asynchronously without blocking API response
  logSearchTelemetry({
    query: rawQuery,
    normalizedQuery: cleanQuery,
    userZone: activeZone,
    deviceType: options.deviceType || "WEB",
    hitsCount: totalHits,
    productsCount: products.length,
    artisansCount: artisans.length,
    rentalsCount: rentals.length,
    communityCount: community.length,
    processingTimeMs,
    userId: options.userId,
  }).catch((err) => console.error("Search telemetry log error:", err));

  return {
    success: true,
    processingTimeMs,
    query: rawQuery,
    normalizedQuery: cleanQuery,
    detectedZone: activeZone,
    expandedTerms,
    totalHits,
    facets: {
      categories: categoryFacets,
      zones: zoneFacets,
      entities: {
        products: products.length,
        rentals: rentals.length,
        artisans: artisans.length,
        community: community.length,
      },
    },
    hits: {
      all: allHits.slice(0, limit),
      products: products.slice(0, limit),
      rentals: rentals.slice(0, limit),
      artisans: artisans.slice(0, limit),
      community: community.slice(0, limit),
    },
    zeroMatchPrompt,
  };
}

/**
 * 1. Products Index Query
 */
async function queryProductsIndex(
  primarySearch: string,
  searchTerms: string[],
  zone?: string,
  category?: string,
  options: UniversalSearchOptions = {}
): Promise<SearchHitItem[]> {
  try {
    const whereConditions: any = {
      status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
    };

    if (category && category !== "all") {
      whereConditions.category = { contains: category, mode: "insensitive" };
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      whereConditions.price = {};
      if (options.minPrice !== undefined) whereConditions.price.gte = options.minPrice;
      if (options.maxPrice !== undefined) whereConditions.price.lte = options.maxPrice;
    }

    // Build text search OR conditions across title, description, tags, category, area
    if (primarySearch.length > 0) {
      const orClauses: any[] = [
        { title: { contains: primarySearch, mode: "insensitive" } },
        { description: { contains: primarySearch, mode: "insensitive" } },
        { category: { contains: primarySearch, mode: "insensitive" } },
        { area: { contains: primarySearch, mode: "insensitive" } },
      ];

      for (const term of searchTerms.slice(0, 6)) {
        orClauses.push({ title: { contains: term, mode: "insensitive" } });
        orClauses.push({ description: { contains: term, mode: "insensitive" } });
        orClauses.push({ category: { contains: term, mode: "insensitive" } });
      }

      whereConditions.OR = orClauses;
    }

    const [listings, legacyProducts] = await Promise.all([
      prisma.productListing.findMany({
        where: whereConditions,
        include: {
          seller: { select: { name: true, phone: true, avatarUrl: true } },
          business: { select: { businessName: true, logoUrl: true, zone: true } },
        },
        take: 30,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
      prisma.product.findMany({
        where: {
          isAvailable: true,
          ...(primarySearch.length > 0
            ? {
                OR: [
                  { title: { contains: primarySearch, mode: "insensitive" } },
                  { description: { contains: primarySearch, mode: "insensitive" } },
                  { category: { contains: primarySearch, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          provider: {
            select: { businessName: true, serviceArea: true, logoUrl: true, user: { select: { phone: true } } },
          },
        },
        take: 30,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);

    const results: SearchHitItem[] = [];

    listings.forEach((p: any) => {
      let parsedImages: string[] = [];
      try {
        parsedImages = p.images ? JSON.parse(p.images) : [];
      } catch {
        parsedImages = p.images ? [p.images] : [];
      }

      const imageUrl = parsedImages.length > 0 ? parsedImages[0] : "";
      const priceNum = Number(p.price) || 0;
      const originalPriceNum = p.originalPrice ? Number(p.originalPrice) : undefined;
      const zoneText = p.area || p.business?.zone || "Tamale";

      results.push({
        id: `prod-${p.id}`,
        entityType: "product",
        title: p.title,
        slug: p.slug,
        subtitle: `${p.sellerName || p.business?.businessName || p.seller?.name || "Merchant"} • ${zoneText}`,
        description: p.description || "",
        category: p.category,
        zone: zoneText,
        price: priceNum,
        priceDisplay: `GH₵ ${priceNum.toLocaleString()}`,
        originalPrice: originalPriceNum,
        image: imageUrl,
        images: parsedImages,
        rating: p.ratingAverage || 4.8,
        reviewCount: p.reviewCount || 0,
        isVerified: p.isPromoted || p.status === "ACTIVE",
        phone: p.seller?.phone || "+233240000000",
        score: 0,
        highlightedTitle: p.title,
        highlightedSubtitle: "",
        raw: p,
      });
    });

    legacyProducts.forEach((p: any) => {
      let parsedImages: string[] = [];
      try {
        if (Array.isArray(p.images)) {
          parsedImages = p.images;
        } else if (typeof p.images === "string" && p.images.startsWith("[")) {
          parsedImages = JSON.parse(p.images);
        } else if (p.images) {
          parsedImages = [p.images];
        }
      } catch {
        parsedImages = p.images ? [p.images] : [];
      }

      const imageUrl = parsedImages.length > 0 ? parsedImages[0] : "";
      const priceNum = Number(p.price) || 0;
      const originalPriceNum = p.originalPrice ? Number(p.originalPrice) : undefined;
      const zoneText = p.provider?.serviceArea?.split(",")[0]?.trim() || "Tamale";

      results.push({
        id: `leg-prod-${p.id}`,
        entityType: "product",
        title: p.title,
        slug: p.id,
        subtitle: `${p.provider?.businessName || "Verified Shop"} • ${zoneText}`,
        description: p.description || "",
        category: p.category,
        zone: zoneText,
        price: priceNum,
        priceDisplay: `GH₵ ${priceNum.toLocaleString()}`,
        originalPrice: originalPriceNum,
        image: imageUrl,
        images: parsedImages,
        rating: 4.9,
        reviewCount: 12,
        isVerified: true,
        phone: p.provider?.user?.phone || "+233240000000",
        score: 0,
        highlightedTitle: p.title,
        highlightedSubtitle: "",
        raw: p,
      });
    });

    return results;
  } catch (error) {
    console.error("queryProductsIndex error:", error);
    return [];
  }
}

/**
 * 2. Equipment Rentals Index Query
 */
async function queryRentalsIndex(
  primarySearch: string,
  searchTerms: string[],
  zone?: string,
  options: UniversalSearchOptions = {}
): Promise<SearchHitItem[]> {
  try {
    const whereConditions: any = {
      isAvailable: true,
    };

    if (primarySearch.length > 0) {
      const orClauses: any[] = [
        { title: { contains: primarySearch, mode: "insensitive" } },
        { description: { contains: primarySearch, mode: "insensitive" } },
        { category: { contains: primarySearch, mode: "insensitive" } },
      ];

      for (const term of searchTerms.slice(0, 6)) {
        orClauses.push({ title: { contains: term, mode: "insensitive" } });
        orClauses.push({ description: { contains: term, mode: "insensitive" } });
        orClauses.push({ category: { contains: term, mode: "insensitive" } });
      }

      whereConditions.OR = orClauses;
    }

    const rentals = await prisma.rentalTool.findMany({
      where: whereConditions,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            serviceArea: true,
            user: { select: { phone: true } },
          },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }).catch(() => []);

    return rentals.map((r: any) => {
      let parsedImages: string[] = [];
      try {
        parsedImages = r.images ? JSON.parse(r.images) : [];
      } catch {
        parsedImages = r.images ? [r.images] : [];
      }

      const dailyRate = Number(r.dailyRate) || 0;
      const zoneText = r.provider?.serviceArea?.split(",")[0]?.trim() || "Tamale";

      return {
        id: `rent-${r.id}`,
        entityType: "rental",
        title: r.title,
        slug: r.slug || r.id,
        subtitle: `Lease: GH₵ ${dailyRate}/day • ${r.provider?.businessName || "Verified Shop"} • ${zoneText}`,
        description: r.description || "",
        category: r.category || "Tool & Heavy Equipment Rentals",
        zone: zoneText,
        price: dailyRate,
        priceDisplay: `GH₵ ${dailyRate}/day`,
        image: parsedImages[0] || "",
        images: parsedImages,
        rating: 4.9,
        isVerified: true,
        phone: r.provider?.user?.phone || "+233240000000",
        score: 0,
        highlightedTitle: r.title,
        highlightedSubtitle: "",
        raw: r,
      };
    });
  } catch (error) {
    console.error("queryRentalsIndex error:", error);
    return [];
  }
}

/**
 * 3. Verified Artisans & Businesses Index Query
 */
async function queryArtisansIndex(
  primarySearch: string,
  searchTerms: string[],
  zone?: string,
  category?: string,
  options: UniversalSearchOptions = {}
): Promise<SearchHitItem[]> {
  try {
    const whereConditions: any = {};

    if (options.verifiedOnly) {
      whereConditions.verificationStatus = "VERIFIED";
    }

    if (primarySearch.length > 0) {
      const orClauses: any[] = [
        { businessName: { contains: primarySearch, mode: "insensitive" } },
        { bio: { contains: primarySearch, mode: "insensitive" } },
        { serviceArea: { contains: primarySearch, mode: "insensitive" } },
      ];

      for (const term of searchTerms.slice(0, 6)) {
        orClauses.push({ businessName: { contains: term, mode: "insensitive" } });
        orClauses.push({ bio: { contains: term, mode: "insensitive" } });
        orClauses.push({ serviceArea: { contains: term, mode: "insensitive" } });
      }

      whereConditions.OR = orClauses;
    }

    const providers = await prisma.providerProfile.findMany({
      where: whereConditions,
      include: {
        user: { select: { name: true, phone: true, avatarUrl: true } },
      },
      take: 30,
      orderBy: { ratingAverage: "desc" },
    });

    return providers.map((prov) => {
      const isVerified = prov.verificationStatus === "VERIFIED";
      const rating = prov.ratingAverage || 4.9;
      const zoneText = prov.serviceArea?.split(",")[0]?.trim() || "Tamale Metro";

      return {
        id: `art-${prov.id}`,
        entityType: "artisan",
        title: prov.businessName,
        slug: prov.slug,
        subtitle: `${prov.yearsExperience} yrs exp • ${zoneText}`,
        description: prov.bio || "",
        category: "Verified Artisan / Workshop",
        zone: zoneText,
        price: prov.pricingFixedStart ? Number(prov.pricingFixedStart) : undefined,
        priceDisplay: prov.pricingFixedStart ? `Starts GH₵ ${Number(prov.pricingFixedStart)}` : "Contact for Quote",
        image: prov.logoUrl || prov.user?.avatarUrl || "",
        rating,
        reviewCount: prov.reviewCount || 0,
        isVerified,
        phone: prov.user?.phone || "+233240000000",
        score: 0,
        highlightedTitle: prov.businessName,
        highlightedSubtitle: "",
        raw: prov,
      };
    });
  } catch (error) {
    console.error("queryArtisansIndex error:", error);
    return [];
  }
}

/**
 * 4. Community Requests Index Query
 */
async function queryCommunityIndex(
  primarySearch: string,
  searchTerms: string[],
  zone?: string,
  options: UniversalSearchOptions = {}
): Promise<SearchHitItem[]> {
  try {
    const whereConditions: any = {
      status: { in: ["OPEN", "PENDING", "ACTIVE"] },
    };

    if (primarySearch.length > 0) {
      const orClauses: any[] = [
        { title: { contains: primarySearch, mode: "insensitive" } },
        { description: { contains: primarySearch, mode: "insensitive" } },
      ];

      for (const term of searchTerms.slice(0, 6)) {
        orClauses.push({ title: { contains: term, mode: "insensitive" } });
        orClauses.push({ description: { contains: term, mode: "insensitive" } });
      }

      whereConditions.OR = orClauses;
    }

    const [requests, communityPosts] = await Promise.all([
      prisma.serviceRequest.findMany({
        where: whereConditions,
        include: {
          customer: { select: { name: true, phone: true } },
          location: { select: { area: true, city: true } },
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
      prisma.communityPost.findMany({
        where: {
          status: "OPEN_ACTIVE",
          ...(primarySearch.length > 0
            ? {
                OR: [
                  { title: { contains: primarySearch, mode: "insensitive" } },
                  { content: { contains: primarySearch, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: {
          author: { select: { name: true, phone: true } },
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);

    const results: SearchHitItem[] = [];

    requests.forEach((req: any) => {
      const budget = req.budgetMax ? Number(req.budgetMax) : req.budgetMin ? Number(req.budgetMin) : undefined;
      const zoneText = req.location?.area || req.location?.city || "Tamale";

      results.push({
        id: `com-${req.id}`,
        entityType: "community",
        title: req.title,
        slug: req.id,
        subtitle: `Urgency: ${req.urgency} • ${zoneText}`,
        description: req.description || "",
        category: "Service Gig Call",
        zone: zoneText,
        price: budget,
        priceDisplay: budget ? `Budget: GH₵ ${budget}` : "Open for Quotes",
        rating: 5.0,
        isVerified: false,
        phone: req.customer?.phone || "+233240000000",
        score: 0,
        highlightedTitle: req.title,
        highlightedSubtitle: "",
        raw: req,
      });
    });

    communityPosts.forEach((post: any) => {
      const budget = post.budget ? Number(post.budget) : undefined;
      const zoneText = post.zone || "Tamale";

      results.push({
        id: `post-${post.id}`,
        entityType: "community",
        title: post.title,
        slug: post.id,
        subtitle: `Category: ${post.category} • ${zoneText}`,
        description: post.content || "",
        category: "Community Trade Board",
        zone: zoneText,
        price: budget,
        priceDisplay: budget ? `Budget: GH₵ ${budget}` : "Discussion / Gig",
        rating: 5.0,
        isVerified: false,
        phone: post.author?.phone || post.guestPhone || "+233240000000",
        score: 0,
        highlightedTitle: post.title,
        highlightedSubtitle: "",
        raw: post,
      });
    });

    return results;
  } catch (error) {
    console.error("queryCommunityIndex error:", error);
    return [];
  }
}

/**
 * Score, highlight, and rank hits by relevance
 */
function scoreAndSort(
  hits: SearchHitItem[],
  tokens: string[],
  searchTerms: string[],
  activeZone?: string
): SearchHitItem[] {
  return hits
    .map((hit) => {
      let score = 0;
      const lowerTitle = hit.title.toLowerCase();
      const lowerDesc = hit.description.toLowerCase();
      const lowerCat = hit.category.toLowerCase();
      const lowerZone = hit.zone.toLowerCase();

      // 1. Exact match on title
      for (const token of tokens) {
        if (lowerTitle === token) {
          score += SEARCH_RANKING_WEIGHTS.EXACT_TITLE_MATCH;
        } else if (lowerTitle.includes(token)) {
          score += SEARCH_RANKING_WEIGHTS.PREFIX_TITLE_MATCH;
        }

        // Exact match on category
        if (lowerCat.includes(token)) {
          score += SEARCH_RANKING_WEIGHTS.EXACT_CATEGORY_MATCH;
        }

        // Match on description
        if (lowerDesc.includes(token)) {
          score += SEARCH_RANKING_WEIGHTS.DESCRIPTION_MATCH;
        }

        // Fuzzy match via Levenshtein
        if (token.length >= 4) {
          const titleWords = lowerTitle.split(/\s+/);
          for (const word of titleWords) {
            const dist = levenshtein(token, word);
            if (dist === 1) {
              score += SEARCH_RANKING_WEIGHTS.PREFIX_TITLE_MATCH + SEARCH_RANKING_WEIGHTS.TYPO_TOLERANCE_PENALTY;
            }
          }
        }
      }

      // 2. Ghanaian Dialect Synonym expansion boost
      for (const term of searchTerms) {
        if (lowerTitle.includes(term) || lowerDesc.includes(term) || lowerCat.includes(term)) {
          score += SEARCH_RANKING_WEIGHTS.SYNONYM_MATCH;
        }
      }

      // 3. Geographic Zone match boost
      if (activeZone && lowerZone.includes(activeZone.toLowerCase())) {
        score += SEARCH_RANKING_WEIGHTS.GEO_ZONE_MATCH;
      }

      // 4. Verification boost
      if (hit.isVerified) {
        score += SEARCH_RANKING_WEIGHTS.VERIFIED_TIER_BOOST;
      }

      // Generate HTML Highlight tags
      const highlightedTitle = generateHighlight(hit.title, searchTerms);
      const highlightedSubtitle = generateHighlight(hit.subtitle, searchTerms);

      return {
        ...hit,
        score,
        highlightedTitle,
        highlightedSubtitle,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Telemetry logger
 */
async function logSearchTelemetry(data: {
  query: string;
  normalizedQuery: string;
  userZone?: string;
  deviceType: string;
  hitsCount: number;
  productsCount: number;
  artisansCount: number;
  rentalsCount: number;
  communityCount: number;
  processingTimeMs: number;
  userId?: string;
}) {
  if (!data.query || data.query.trim().length === 0) return;

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SearchQueryTelemetry" 
      ("id", "query", "normalizedQuery", "userZone", "deviceType", "hitsCount", "productsCount", "artisansCount", "rentalsCount", "communityCount", "processingTimeMs", "userId", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
    data.query,
    data.normalizedQuery,
    data.userZone || null,
    data.deviceType,
    data.hitsCount,
    data.productsCount,
    data.artisansCount,
    data.rentalsCount,
    data.communityCount,
    data.processingTimeMs,
    data.userId || null
  );
}
