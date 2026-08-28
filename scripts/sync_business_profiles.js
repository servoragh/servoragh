const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const provs = await prisma.providerProfile.findMany({
    include: {
      user: {
        include: { businessProfile: true },
      },
    },
  });

  console.log(`Found ${provs.length} provider profiles. Syncing to BusinessProfile...`);

  for (const prov of provs) {
    if (!prov.user.businessProfile) {
      console.log(`Creating BusinessProfile for: ${prov.businessName} (${prov.slug})`);
      const vStatus = prov.verificationStatus === 'VERIFIED' ? 'TIER_2_VERIFIED_ARTISAN' : 'UNVERIFIED';
      await prisma.businessProfile.create({
        data: {
          userId: prov.userId,
          businessName: prov.businessName,
          slug: prov.slug,
          phone: prov.user.phone || '+233240000000',
          whatsappNumber: prov.user.phone || '+233240000000',
          description: prov.bio,
          zone: prov.serviceArea.split(',')[0].trim(),
          ratingAverage: prov.ratingAverage,
          reviewsCount: prov.reviewCount,
          verificationStatus: vStatus,
          logoUrl: prov.logoUrl || prov.user.avatarUrl,
        },
      });
    }
  }

  console.log('Sync complete!');
}

main().finally(() => prisma.$disconnect());
