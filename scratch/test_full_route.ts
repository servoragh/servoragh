import { prisma } from "../src/lib/prisma";

async function testFullRoute() {
  const slug = "apple-gift-card-9355";
  console.log("=== FULL ROUTE SIMULATION FOR:", slug);

  // 1. Try finding in ProductListing
  let listing: any = await prisma.productListing.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug },
      ],
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
      business: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          logoUrl: true,
          tagline: true,
          description: true,
          zone: true,
          ratingAverage: true,
          reviewsCount: true,
          verificationStatus: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  console.log("FOUND LISTING:", listing ? listing.id : "null");
  if (!listing) return;

  const parsedImages = Array.isArray(listing.images)
    ? listing.images
    : typeof listing.images === "string"
    ? JSON.parse(listing.images || "[]")
    : [];

  const parsedDelivery = Array.isArray(listing.deliveryOptions)
    ? listing.deliveryOptions
    : typeof listing.deliveryOptions === "string"
    ? JSON.parse(listing.deliveryOptions || "[\"PICKUP\", \"LOCAL_DELIVERY\"]")
    : ["PICKUP", "LOCAL_DELIVERY"];

  const priceNum = Number(listing.price);
  const origPriceNum = listing.originalPrice ? Number(listing.originalPrice) : (priceNum * 1.12);
  const discountPct = listing.discountPercent || (origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0);

  const sellerBusiness = listing.business;
  const sellerUser = listing.seller;
  const sellerName = sellerBusiness?.businessName || sellerUser?.name || listing.guestName || "Verified Local Enterprise";
  const sellerSlug = sellerBusiness?.slug || "royals-motors";
  const sellerPhone = sellerBusiness?.phone || sellerUser?.phone || listing.guestPhone || "+233240000000";
  const sellerWhatsApp = sellerBusiness?.whatsapp || sellerUser?.phone || listing.guestWhatsApp || sellerPhone;
  const sellerZone = sellerBusiness?.zone || listing.area || "Lamashegu, Tamale";
  const sellerRating = sellerBusiness?.ratingAverage || 5.0;
  const sellerReviewCount = sellerBusiness?.reviewsCount || 18;
  const sellerVerification = sellerBusiness?.verificationStatus || "TIER_2_VERIFIED_ARTISAN";
  const sellerLogo = sellerBusiness?.logoUrl || sellerUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80";

  const productPayload = {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    category: listing.category,
    subCategory: listing.subCategory || "General",
    condition: listing.condition || "USED_GOOD",
    price: priceNum,
    originalPrice: origPriceNum,
    discountPercent: discountPct,
    currency: listing.currency || "GHS",
    stockQuantity: listing.stockQuantity ?? 1,
    inventoryStatus: listing.inventoryStatus || "IN_STOCK",
    images: parsedImages,
    videoUrl: listing.videoUrl || null,
    area: listing.area || "Lamashegu, Tamale",
    deliveryOptions: parsedDelivery,
    likesCount: listing.likesCount || 0,
    viewsCount: (listing.viewsCount || 0) + 1,
    isNegotiable: listing.isNegotiable ?? false,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    sellerType: listing.sellerType,
    seller: {
      id: sellerBusiness?.id || sellerUser?.id || "seller-id",
      name: sellerName,
      businessName: sellerName,
      slug: sellerSlug,
      logoUrl: sellerLogo,
      avatarUrl: sellerLogo,
      phone: sellerPhone,
      whatsapp: sellerWhatsApp,
      zone: sellerZone,
      location: sellerZone,
      serviceArea: sellerZone,
      ratingAverage: sellerRating,
      rating: sellerRating,
      reviewsCount: sellerReviewCount,
      reviewCount: sellerReviewCount,
      verificationStatus: sellerVerification,
      tagline: sellerBusiness?.tagline || "Verified Local Enterprise & Merchant in Tamale",
      bio: sellerBusiness?.description || "Providing trusted goods, haulage, and artisan services across Northern Ghana.",
      memberSince: sellerBusiness?.createdAt || sellerUser?.createdAt || listing.createdAt,
    },
  };

  console.log("PAYLOAD CREATED:", productPayload.title);

  // Raw questions
  const rawQuestions = (await prisma.$queryRawUnsafe(`
    SELECT 
      q.id,
      q."productId",
      q."userId",
      q.question,
      q.answer,
      q."answeredBy",
      q."answeredAt",
      q."createdAt",
      u.name as "askerName",
      u."avatarUrl" as "askerAvatar",
      u.role as "askerRole"
    FROM "ProductQuestion" q
    LEFT JOIN "User" u ON q."userId" = u.id
    WHERE q."productId" = $1
    ORDER BY q."createdAt" DESC
  `, listing.id).catch(err => {
    console.error("RAW QUESTIONS ERROR:", err);
    throw err;
  })) as any[];

  console.log("RAW QUESTIONS COUNT:", rawQuestions.length);

  // Raw reviews
  const rawReviews = (await prisma.$queryRawUnsafe(`
    SELECT 
      r.id,
      r."productId",
      r."userId",
      r.rating,
      r.title,
      r.comment,
      r.photos,
      r."isVerified",
      r."createdAt",
      u.name as "authorName",
      u."avatarUrl" as "authorAvatar"
    FROM "ProductReview" r
    LEFT JOIN "User" u ON r."userId" = u.id
    WHERE r."productId" = $1
    ORDER BY r."createdAt" DESC
  `, listing.id).catch(err => {
    console.error("RAW REVIEWS ERROR:", err);
    throw err;
  })) as any[];

  console.log("RAW REVIEWS COUNT:", rawReviews.length);

  // Recommendations
  const rawRecs = (await prisma.$queryRawUnsafe(`
    SELECT 
      l.id,
      l.title,
      l.slug,
      l.price,
      l."originalPrice",
      l."discountPercent",
      l.category,
      l.area,
      l.images,
      l.condition,
      l."likesCount",
      b."businessName",
      b.slug as "businessSlug",
      b."logoUrl" as "businessLogo",
      b."ratingAverage" as "businessRating"
    FROM "ProductListing" l
    LEFT JOIN "BusinessProfile" b ON l."businessId" = b.id
    WHERE l.id != $1
    ORDER BY 
      CASE 
        WHEN l.category = $2 AND l.area = $3 THEN 1
        WHEN l.category = $2 THEN 2
        WHEN l."businessId" = $4 THEN 3
        ELSE 4
      END,
      l."viewsCount" DESC,
      l."createdAt" DESC
    LIMIT 8
  `, listing.id, listing.category, listing.area || "Tamale", listing.businessId || "none").catch(err => {
    console.error("RAW RECS ERROR:", err);
    throw err;
  })) as any[];

  console.log("RAW RECS COUNT:", rawRecs.length);
  console.log("=== FULL ROUTE SIMULATION COMPLETED WITHOUT ERROR! ===");
}

testFullRoute().catch(console.error).finally(() => prisma.$disconnect());
