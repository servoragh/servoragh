const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Assigning product listings to their true store profiles ---');

  const bizProfiles = await prisma.businessProfile.findMany();
  const provProfiles = await prisma.providerProfile.findMany();

  const getBizId = (slug) => {
    const b = bizProfiles.find((x) => x.slug === slug);
    return b ? b.id : null;
  };

  const getUserId = (slug) => {
    const b = bizProfiles.find((x) => x.slug === slug);
    if (b) return b.userId;
    const p = provProfiles.find((x) => x.slug === slug);
    return p ? p.userId : null;
  };

  const listings = await prisma.productListing.findMany();

  for (const item of listings) {
    const titleLower = item.title.toLowerCase();
    let targetSlug = null;

    if (titleLower.includes('solar') || titleLower.includes('pump') || titleLower.includes('borehole') || titleLower.includes('generator') || titleLower.includes('electrical installation') || titleLower.includes('battery')) {
      targetSlug = 'tamale-solar-power';
    } else if (titleLower.includes('phone') || titleLower.includes('laptop') || titleLower.includes('hp elitebook') || titleLower.includes('charger') || titleLower.includes('screen replacement') || titleLower.includes('samsung') || titleLower.includes('type-c')) {
      targetSlug = 'fuseini-phone-repair-sakasaka';
    } else if (titleLower.includes('fugu') || titleLower.includes('smock') || titleLower.includes('agbada') || titleLower.includes('cap') || titleLower.includes('bridal') || titleLower.includes('makeup')) {
      targetSlug = 'northern-heritage-smocks';
    } else if (titleLower.includes('hilux') || titleLower.includes('truck') || titleLower.includes('pickup') || titleLower.includes('driver')) {
      targetSlug = 'royals';
    } else if (titleLower.includes('shea') || titleLower.includes('rice') || titleLower.includes('yam') || titleLower.includes('honey') || titleLower.includes('egg') || titleLower.includes('guinea fowl') || titleLower.includes('soybean') || titleLower.includes('farm') || titleLower.includes('harvest') || titleLower.includes('platter')) {
      targetSlug = 'savannah-fresh-farms';
    } else if (titleLower.includes('drill') || titleLower.includes('dewalt') || titleLower.includes('cable') || titleLower.includes('wire') || titleLower.includes('gold')) {
      targetSlug = 'kwame-electrical-tamale';
    } else if (titleLower.includes('gift card') || titleLower.includes('apple')) {
      targetSlug = 'antigravity-limited-936';
    } else {
      targetSlug = 'antigravity-limited-936';
    }

    const bizId = getBizId(targetSlug);
    const userId = getUserId(targetSlug);

    await prisma.productListing.update({
      where: { id: item.id },
      data: {
        businessId: bizId,
        sellerId: userId || item.sellerId,
      },
    });

    console.log(`Assigned "${item.title}" -> Store: "${targetSlug}" (bizId: ${bizId}, userId: ${userId})`);
  }

  console.log('\n--- Checking results after update ---');
  const updated = await prisma.productListing.findMany({
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

  for (const u of updated) {
    const slug = u.business?.slug || u.seller?.businessProfile?.slug || u.seller?.providerProfile?.slug;
    const name = u.business?.businessName || u.seller?.businessProfile?.businessName || u.seller?.providerProfile?.businessName;
    console.log(`[${u.title}] -> Store: "${name}" (${slug})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
