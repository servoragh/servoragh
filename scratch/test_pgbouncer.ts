import { PrismaClient } from "@prisma/client";

const pgbouncerUrl = "postgresql://postgres.cgheqqromasxogsdtqyv:Abdul%40%400207682251@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: pgbouncerUrl } } });
  try {
    const count = await p.user.count();
    console.log("SUCCESS WITH PGBOUNCER! User count:", count);
  } catch (e: any) {
    console.error("FAILED WITH PGBOUNCER:", e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
