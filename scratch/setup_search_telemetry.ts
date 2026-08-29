import { prisma } from "../src/lib/prisma";

async function setupSearchTelemetry() {
  console.log("Setting up SearchQueryTelemetry table in database...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SearchQueryTelemetry" (
      "id" TEXT PRIMARY KEY,
      "query" TEXT NOT NULL,
      "normalizedQuery" TEXT NOT NULL,
      "userZone" TEXT,
      "deviceType" TEXT NOT NULL DEFAULT 'WEB',
      "hitsCount" INTEGER NOT NULL DEFAULT 0,
      "productsCount" INTEGER NOT NULL DEFAULT 0,
      "artisansCount" INTEGER NOT NULL DEFAULT 0,
      "rentalsCount" INTEGER NOT NULL DEFAULT 0,
      "communityCount" INTEGER NOT NULL DEFAULT 0,
      "processingTimeMs" INTEGER NOT NULL DEFAULT 0,
      "userId" TEXT,
      "ipHash" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchQueryTelemetry_query_idx" ON "SearchQueryTelemetry"("query")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchQueryTelemetry_normalizedQuery_idx" ON "SearchQueryTelemetry"("normalizedQuery")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchQueryTelemetry_createdAt_idx" ON "SearchQueryTelemetry"("createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchQueryTelemetry_userZone_idx" ON "SearchQueryTelemetry"("userZone")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SearchQueryTelemetry_hitsCount_idx" ON "SearchQueryTelemetry"("hitsCount")`);

  console.log("SearchQueryTelemetry table and indexes created successfully!");

  // Seed sample initial telemetry for trending searches
  const sampleTelemetry = [
    { query: "Solar Inverter Sakasaka", normalizedQuery: "solar inverter sakasaka", userZone: "Sakasaka", hitsCount: 38, productsCount: 14, artisansCount: 8, rentalsCount: 12, communityCount: 4, processingTimeMs: 14 },
    { query: "Fugu Smock Nyohini", normalizedQuery: "fugu smock nyohini", userZone: "Nyohini", hitsCount: 45, productsCount: 22, artisansCount: 18, rentalsCount: 2, communityCount: 3, processingTimeMs: 12 },
    { query: "Plumber Choggu", normalizedQuery: "plumber choggu", userZone: "Choggu", hitsCount: 29, productsCount: 6, artisansCount: 15, rentalsCount: 5, communityCount: 3, processingTimeMs: 16 },
    { query: "Heavy Drill Generator Rental", normalizedQuery: "heavy drill generator rental", userZone: "Lamashegu", hitsCount: 34, productsCount: 8, artisansCount: 4, rentalsCount: 18, communityCount: 4, processingTimeMs: 11 },
    { query: "Auto Electrician Fitter", normalizedQuery: "auto electrician fitter", userZone: "Tamale Industrial", hitsCount: 31, productsCount: 10, artisansCount: 16, rentalsCount: 3, communityCount: 2, processingTimeMs: 15 },
    { query: "Mole National Park Safari", normalizedQuery: "mole national park safari", userZone: "Northern Region", hitsCount: 18, productsCount: 12, artisansCount: 4, rentalsCount: 2, communityCount: 0, processingTimeMs: 19 },
    { query: "Borehole Drilling Machine", normalizedQuery: "borehole drilling machine", userZone: "Sagnarigu", hitsCount: 26, productsCount: 4, artisansCount: 8, rentalsCount: 12, communityCount: 2, processingTimeMs: 17 },
    { query: "Welder Metal Gate Fabrication", normalizedQuery: "welder metal gate fabrication", userZone: "Aboabo", hitsCount: 24, productsCount: 6, artisansCount: 14, rentalsCount: 2, communityCount: 2, processingTimeMs: 13 },
  ];

  for (const item of sampleTelemetry) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "SearchQueryTelemetry" ("id", "query", "normalizedQuery", "userZone", "deviceType", "hitsCount", "productsCount", "artisansCount", "rentalsCount", "communityCount", "processingTimeMs", "createdAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, 'WEB', $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP - (INTERVAL '1 hour' * floor(random() * 48)))
    `, item.query, item.normalizedQuery, item.userZone, item.hitsCount, item.productsCount, item.artisansCount, item.rentalsCount, item.communityCount, item.processingTimeMs);
  }

  console.log("Sample search telemetry seeded successfully!");
}

setupSearchTelemetry().catch(console.error).finally(() => prisma.$disconnect());
