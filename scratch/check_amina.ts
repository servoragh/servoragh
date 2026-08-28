import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "amina", mode: "insensitive" } },
        { phone: { contains: "241112233" } },
      ],
    },
    include: {
      serviceRequests: true,
    },
  });

  console.log("USERS FOUND:", JSON.stringify(users, null, 2));

  const allRequests = await prisma.serviceRequest.findMany({
    include: {
      customer: true,
    },
  });

  console.log("ALL REQUESTS IN DB:", JSON.stringify(allRequests.map(r => ({
    id: r.id,
    title: r.title,
    status: r.status,
    customerId: r.customerId,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    customerName: r.customer?.name,
    customerPhone: r.customer?.phone,
  })), null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
