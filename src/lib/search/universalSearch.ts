import { prisma } from "@/lib/prisma";

export interface UniversalSearchResultItem {
  id: string;
  entityType: "PROVIDER" | "BUSINESS" | "OFFER" | "PRODUCT" | "SERVICE_REQUEST" | "RENTAL" | "CATEGORY";
  title: string;
  slug?: string;
  subtitle: string;
  categoryName: string;
  locationCity: string;
  priceDisplay?: string;
  ratingAverage?: number;
  verificationBadge?: string;
  disclaimerText?: string;
  availableActions: string[];
  rawRecord: any;
}

export async function searchUniversalMarketplace(
  query: string,
  options: {
    city?: string;
    categorySlug?: string;
    transactionType?: string;
    verifiedOnly?: boolean;
    limit?: number;
  } = {}
) {
  const cleanQuery = query.trim().toLowerCase();
  const limit = options.limit || 20;

  // Intent parsing
  const isNearMe = cleanQuery.includes("near me");
  const parsedSearch = cleanQuery.replace("near me", "").trim();

  const results: UniversalSearchResultItem[] = [];

  // 1. Search Categories & Subcategories
  const matchingCategories = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: parsedSearch, mode: "insensitive" } },
        { description: { contains: parsedSearch, mode: "insensitive" } },
      ],
    },
    include: { subcategories: true },
    take: 5,
  });

  matchingCategories.forEach((cat) => {
    results.push({
      id: `cat-${cat.id}`,
      entityType: "CATEGORY",
      title: cat.name,
      slug: cat.slug,
      subtitle: cat.description,
      categoryName: cat.name,
      locationCity: "Ghana Nationwide",
      disclaimerText: cat.disclaimerText || undefined,
      availableActions: ["Explore Category ➔", "Browse Providers"],
      rawRecord: cat,
    });
  });

  // 2. Search Universal Offers (Products, Services, Bookings, Rentals, Quotes)
  const offers = await prisma.universalOffer.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: parsedSearch, mode: "insensitive" } },
        { description: { contains: parsedSearch, mode: "insensitive" } },
        { locationCity: { contains: parsedSearch, mode: "insensitive" } },
      ],
      ...(options.city ? { locationCity: { contains: options.city, mode: "insensitive" } } : {}),
      ...(options.transactionType ? { transactionType: options.transactionType } : {}),
    },
    include: { category: true, subcategory: true },
    take: limit,
  }).catch(() => []);

  offers.forEach((offer) => {
    let actions = ["Contact Provider"];
    if (offer.transactionType === "PRODUCT_PURCHASE") actions = ["Buy Now", "Add to Cart", "Contact Seller"];
    if (offer.transactionType === "SERVICE_BOOKING") actions = ["Book Service 📅", "Request Quote"];
    if (offer.transactionType === "QUOTE_REQUEST") actions = ["Request Custom Quote 📝", "Contact"];
    if (offer.transactionType === "RENTAL") actions = ["Rent Equipment 🚜", "Check Dates"];

    results.push({
      id: `off-${offer.id}`,
      entityType: "OFFER",
      title: offer.title,
      slug: offer.slug,
      subtitle: offer.description.substring(0, 100) + "...",
      categoryName: offer.category?.name || "General Marketplace",
      locationCity: offer.locationCity,
      priceDisplay: `${offer.currency} ${Number(offer.price)} ${offer.pricingUnit !== "FIXED" ? "/" + offer.pricingUnit : ""}`,
      ratingAverage: offer.ratingAverage,
      verificationBadge: offer.verificationRequired !== "NONE" ? offer.verificationRequired : undefined,
      disclaimerText: offer.category?.disclaimerText || undefined,
      availableActions: actions,
      rawRecord: offer,
    });
  });

  // 3. Search Provider Profiles (Artisans, Businesses, Companies)
  const providers = await prisma.providerProfile.findMany({
    where: {
      OR: [
        { businessName: { contains: parsedSearch, mode: "insensitive" } },
        { bio: { contains: parsedSearch, mode: "insensitive" } },
        { serviceArea: { contains: parsedSearch, mode: "insensitive" } },
      ],
      ...(options.verifiedOnly ? { verificationStatus: "VERIFIED" } : {}),
    },
    take: limit,
  });

  providers.forEach((prov) => {
    results.push({
      id: `prov-${prov.id}`,
      entityType: "PROVIDER",
      title: prov.businessName,
      slug: prov.slug,
      subtitle: prov.bio.substring(0, 100) + "...",
      categoryName: "Verified Provider / Artisan",
      locationCity: prov.serviceArea || "Tamale",
      ratingAverage: prov.ratingAverage,
      verificationBadge: prov.verificationStatus === "VERIFIED" ? "IDENTITY_VERIFIED" : "PHONE_VERIFIED",
      availableActions: ["View Public Store 🏪", "Request Quote", "Call Provider"],
      rawRecord: prov,
    });
  });

  // Log Search Query for Search Analytics
  try {
    await prisma.searchQueryLog.create({
      data: {
        query: cleanQuery,
        scope: "UNIVERSAL",
        resultCount: results.length,
      },
    });
  } catch {}

  return {
    query: cleanQuery,
    isNearMe,
    totalCount: results.length,
    results,
  };
}
