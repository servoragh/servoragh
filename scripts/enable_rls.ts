import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Enabling Row Level Security (RLS) on all public tables in Supabase...');

  const tables: Array<{ tablename: string; rowsecurity: boolean }> = await prisma.$queryRaw`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `;

  console.log(`Found ${tables.length} tables in public schema.`);
  const withoutRls = tables.filter(t => !t.rowsecurity);

  if (withoutRls.length === 0) {
    console.log('✅ All tables already have Row-Level Security enabled!');
    return;
  }

  console.log(`Enabling RLS on ${withoutRls.length} tables...`);
  for (const table of withoutRls) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE public."${table.tablename}" ENABLE ROW LEVEL SECURITY;`
    );
    console.log(` ✔ Enabled RLS on: ${table.tablename}`);
  }

  console.log('\n🎉 Successfully enabled RLS on all tables!');
  console.log('Your Supabase project is now secured against public API exposure.');
}

main()
  .catch((e) => {
    console.error('Error enabling RLS:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
