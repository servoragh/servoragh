const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running database migration for sellerReply...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ProductReview" 
      ADD COLUMN IF NOT EXISTS "sellerReply" TEXT,
      ADD COLUMN IF NOT EXISTS "sellerRepliedAt" TIMESTAMP(3);
    `);
    console.log('Migration successful: sellerReply and sellerRepliedAt added to ProductReview.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
