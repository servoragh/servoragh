const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bizProfiles = await prisma.businessProfile.findMany({ select: { id: true, slug: true, businessName: true, userId: true } });
  console.log('BusinessProfiles:', bizProfiles);

  const provProfiles = await prisma.providerProfile.findMany({ select: { id: true, slug: true, businessName: true, userId: true } });
  console.log('ProviderProfiles:', provProfiles);
}

main().finally(() => prisma.$disconnect());
