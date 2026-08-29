import { prisma } from "../src/lib/prisma";

async function verifyTables() {
  const qCount: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "ProductQuestion"`);
  const rCount: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "ProductReview"`);
  const lCount: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "ProductLike"`);
  console.log("QUESTIONS COUNT:", qCount[0]?.c);
  console.log("REVIEWS COUNT:", rCount[0]?.c);
  console.log("LIKES COUNT:", lCount[0]?.c);
}

verifyTables().catch(console.error).finally(() => prisma.$disconnect());
