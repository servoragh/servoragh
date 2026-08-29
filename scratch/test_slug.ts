import { prisma } from "../src/lib/prisma";

async function testFetchSlug() {
  const slug = "apple-gift-card-9355";
  console.log("TESTING SLUG:", slug);

  const listing = await prisma.productListing.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug },
      ],
    },
    include: {
      seller: true,
      business: true,
    },
  });
  console.log("LISTING:", listing?.title || "null");

  const legacy = await prisma.product.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug },
      ],
    },
    include: {
      provider: {
        include: {
          user: true,
        },
      },
    },
  });
  console.log("LEGACY PROD:", legacy?.title || "null");

  // Let's test the relations query if legacy product found
  if (legacy) {
    console.log("LEGACY ID:", legacy.id);
    const likeRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM "ProductLike" WHERE "productId" = $1 LIMIT 1`,
      legacy.id
    ).catch(e => console.error("Like error:", e));
    console.log("LIKE ROWS:", likeRows);

    const questions = await prisma.$queryRawUnsafe(`
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
    `, legacy.id).catch(e => console.error("Q error:", e));
    console.log("QUESTIONS:", questions);

    const recs = await prisma.$queryRawUnsafe(`
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
    `, legacy.id, legacy.category, "Tamale", "none").catch(e => console.error("Recs error:", e));
    console.log("RECS:", recs);
  }
}

testFetchSlug().catch(console.error).finally(() => prisma.$disconnect());
