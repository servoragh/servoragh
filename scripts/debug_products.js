const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.productListing.findMany({
    include: {
      business: true,
      seller: {
        include: {
          businessProfile: true,
          providerProfile: true,
        },
      },
    },
  });

  console.log('=== TOTAL PRODUCT LISTINGS: ' + prods.length + ' ===');
  for (const p of prods) {
    const slug = p.business?.slug || p.seller?.businessProfile?.slug || p.seller?.providerProfile?.slug;
    const name = p.business?.businessName || p.seller?.businessProfile?.businessName || p.seller?.providerProfile?.businessName;
    console.log(`Product: "${p.title}" -> Store: "${name}" (slug: "${slug}") [businessId: ${p.businessId}, sellerId: ${p.sellerId}]`);
  }
}

main().finally(() => prisma.$disconnect());
