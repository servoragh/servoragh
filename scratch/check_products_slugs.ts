import { prisma } from "../src/lib/prisma";

async function checkProducts() {
  const listings = await prisma.productListing.findMany({
    select: { id: true, slug: true, title: true, status: true },
  });
  console.log("=== ProductListing rows in DB ===");
  console.log(JSON.stringify(listings, null, 2));

  const legacyProds = await prisma.product.findMany({
    select: { id: true, slug: true, title: true },
  });
  console.log("\n=== Legacy Product rows in DB ===");
  console.log(JSON.stringify(legacyProds, null, 2));
}

checkProducts().catch(console.error).finally(() => prisma.$disconnect());
