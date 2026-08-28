import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS COUNT:", users.length);
  console.log(users.map(u => ({ id: u.id, name: u.name, phone: u.phone, email: u.email })));

  const reqs = await prisma.serviceRequest.findMany();
  console.log("REQS COUNT:", reqs.length);
  console.log(reqs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
