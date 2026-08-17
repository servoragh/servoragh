import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@servora.gh";
  const phone = process.env.ADMIN_PHONE || "+233240000000";
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const name = process.env.ADMIN_NAME || "Servora Super Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { phone },
    update: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      isPhoneVerified: true,
    },
    create: {
      name,
      email,
      phone,
      passwordHash,
      role: "ADMIN",
      isPhoneVerified: true,
      referralCode: "ADMIN" + Math.floor(100 + Math.random() * 900),
    },
  });

  console.log(`✅ Admin Account Successfully Created / Updated!`);
  console.log(`- Name: ${user.name}`);
  console.log(`- Email: ${user.email}`);
  console.log(`- Phone: ${user.phone}`);
  console.log(`- Password: ${password}`);
  console.log(`- Role: ${user.role}`);
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
