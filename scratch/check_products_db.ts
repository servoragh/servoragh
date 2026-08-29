import { prisma } from "../src/lib/prisma";

async function checkProducts() {
  const listings = await prisma.productListing.findMany({
    include: {
      business: true,
      seller: true,
    },
  });
  console.log("PRODUCT LISTINGS COUNT:", listings.length);
  listings.forEach(l => {
    console.log(`- [${l.id}] ${l.title} (${l.slug}) - Price: ${l.price} - Category: ${l.category} - Area: ${l.area} - Seller: ${l.business?.businessName || l.seller?.name}`);
  });

  const products = await prisma.product.findMany({
    include: {
      provider: true,
    },
  });
  console.log("PRODUCTS COUNT:", products.length);
  products.forEach(p => {
    console.log(`- [${p.id}] ${p.title} (${p.slug}) - Price: ${p.price} - Provider: ${p.provider?.businessName}`);
  });
}

checkProducts().catch(console.error).finally(() => prisma.$disconnect());
