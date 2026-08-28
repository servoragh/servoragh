import { PrismaClient } from "@prisma/client";

const directDbUrl = "postgresql://postgres:Abdul%40%400207682251@db.cgheqqromasxogsdtqyv.supabase.co:5432/postgres?sslmode=require";
const poolerUrl = "postgresql://postgres.cgheqqromasxogsdtqyv:Abdul%40%400207682251@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require";

async function test(url: string, name: string) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const start = Date.now();
    const count = await p.user.count();
    console.log(`[${name}] SUCCESS: ${count} users in ${Date.now() - start}ms`);
  } catch (e: any) {
    console.error(`[${name}] FAILED:`, e.message);
  } finally {
    await p.$disconnect();
  }
}

async function main() {
  await test(directDbUrl, "DIRECT (db.cgheqq...)");
  await test(poolerUrl, "POOLER (aws-0-eu-central-1.pooler...)");
}

main();
