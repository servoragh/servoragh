const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const provs = await prisma.providerProfile.findMany({
    include: {
      user: true,
    },
  });

  console.log('=== PROVIDER PROFILES IN DB (' + provs.length + ') ===');
  for (const p of provs) {
    console.log({
      slug: p.slug,
      businessName: p.businessName,
      owner: p.user?.name,
      phone: p.user?.phone,
      avatarUrl: p.user?.avatarUrl,
      yearsExp: p.yearsExperience,
      jobsCount: p.completedJobsCount,
      fixedStart: p.pricingFixedStart,
      hourly: p.pricingHourly,
      rating: p.ratingAverage,
      reviewCount: p.reviewCount,
      serviceArea: p.serviceArea,
    });
  }

  const bizs = await prisma.businessProfile.findMany({
    include: {
      user: true,
    },
  });

  console.log('\n=== BUSINESS PROFILES IN DB (' + bizs.length + ') ===');
  for (const b of bizs) {
    console.log({
      slug: b.slug,
      businessName: b.businessName,
      owner: b.user?.name,
      phone: b.user?.phone,
      avatarUrl: b.user?.avatarUrl,
      logoUrl: b.logoUrl,
      bannerUrl: b.bannerUrl,
      rating: b.ratingAverage,
      reviewsCount: b.reviewsCount,
      zone: b.zone,
    });
  }
}

main().finally(() => prisma.$disconnect());
