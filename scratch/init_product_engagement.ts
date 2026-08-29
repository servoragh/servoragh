import { prisma } from "../src/lib/prisma";

async function initProductEngagement() {
  console.log("INITIALIZING PRODUCT ENGAGEMENT TABLES (SINGLE STATEMENTS)...");

  // 1. Alter ProductListing table to add columns
  await prisma.$executeRawUnsafe(`ALTER TABLE "ProductListing" ADD COLUMN IF NOT EXISTS "likesCount" INTEGER NOT NULL DEFAULT 0`).catch(console.error);
  await prisma.$executeRawUnsafe(`ALTER TABLE "ProductListing" ADD COLUMN IF NOT EXISTS "discountPercent" INTEGER`).catch(console.error);

  // 2. Create ProductLike table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductLike" (
      "id" TEXT PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      CONSTRAINT "ProductLike_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductListing"("id") ON DELETE CASCADE,
      CONSTRAINT "ProductLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      CONSTRAINT "ProductLike_productId_userId_key" UNIQUE ("productId", "userId")
    )
  `).catch(console.error);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductLike_productId_idx" ON "ProductLike"("productId")`).catch(console.error);

  // 3. Create ProductQuestion table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductQuestion" (
      "id" TEXT PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "question" TEXT NOT NULL,
      "answer" TEXT,
      "answeredBy" TEXT,
      "answeredAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ProductQuestion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductListing"("id") ON DELETE CASCADE,
      CONSTRAINT "ProductQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `).catch(console.error);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductQuestion_productId_idx" ON "ProductQuestion"("productId")`).catch(console.error);

  // 4. Create ProductReview table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductReview" (
      "id" TEXT PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "title" TEXT,
      "comment" TEXT NOT NULL,
      "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductListing"("id") ON DELETE CASCADE,
      CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )
  `).catch(console.error);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProductReview_productId_idx" ON "ProductReview"("productId")`).catch(console.error);

  console.log("ALL TABLES & INDEXES CREATED SUCCESSFULLY!");

  // 5. Fetch sample users and listings to seed realistic questions & verified reviews
  const users = await prisma.user.findMany({ take: 5 });
  const amina = users.find(u => u.name.includes("Amina")) || users[0];
  const kwame = users.find(u => u.name.includes("Kwame")) || users[1];

  const listings = await prisma.productListing.findMany();
  console.log(`Found ${listings.length} listings to verify and populate seed data.`);

  for (const item of listings) {
    // Seed question if none
    const existingQ: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "ProductQuestion" WHERE "productId" = $1 LIMIT 1`,
      item.id
    );

    if (existingQ.length === 0 && amina) {
      const qId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ProductQuestion" ("id", "productId", "userId", "question", "answer", "answeredBy", "answeredAt", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        qId,
        item.id,
        amina.id,
        `Hello, is same-day pickup or express delivery available around ${item.area || 'Tamale'}?`,
        `Yes absolutely! You can pick it up directly at our store or request immediate Servora dispatch across Northern Ghana.`,
        `Verified Merchant`
      );
    }

    // Seed review if none
    const existingR: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "ProductReview" WHERE "productId" = $1 LIMIT 1`,
      item.id
    );

    if (existingR.length === 0 && kwame) {
      const rId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const samplePhotos = (item.images && item.images.length > 0) ? [item.images[0]] : [];
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ProductReview" ("id", "productId", "userId", "rating", "title", "comment", "photos", "isVerified", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
        rId,
        item.id,
        kwame.id,
        5,
        `Exceptional quality & fast transaction!`,
        `Very satisfied with the item condition and smooth coordination via MoMo escrow. Highly recommend this seller in Tamale!`,
        samplePhotos
      );
    }

    // Update likesCount and discountPercent
    const likesCount = Math.floor(4 + Math.random() * 18);
    const origPrice = Number(item.price) * 1.15;
    const discountPct = Math.round(((origPrice - Number(item.price)) / origPrice) * 100);

    await prisma.$executeRawUnsafe(
      `UPDATE "ProductListing" 
       SET "likesCount" = $1, "originalPrice" = $2, "discountPercent" = $3
       WHERE "id" = $4`,
      likesCount,
      origPrice,
      discountPct,
      item.id
    );
  }

  console.log("SEEDED PRODUCT ENGAGEMENT DATA SUCCESSFULLY!");
}

initProductEngagement()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
