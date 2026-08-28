import { prisma } from "../src/lib/prisma";

async function testEndpoints() {
  const session = {
    id: "customer-id", // Simulating non-UUID session
    name: "Amina Abdul-Rahman",
    phone: "+233241112233",
    email: "amina@gmail.com",
    role: "CUSTOMER" as const,
    isPhoneVerified: true,
  };

  console.log("TESTING PROFILE LOGIC WITH NON-UUID SESSION...");

  const isValidUuid = (s?: string | null) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const orConditions: any[] = [];
  if (isValidUuid(session.id)) orConditions.push({ id: session.id });
  if (session.phone) {
    orConditions.push({ phone: session.phone });
    orConditions.push({ phone: session.phone.replace("+233", "0") });
    orConditions.push({ phone: "+233" + session.phone.replace(/^0/, "") });
  }
  if (session.email) orConditions.push({ email: session.email });

  const user = await prisma.user.findFirst({
    where: orConditions.length > 0 ? { OR: orConditions } : undefined,
  });

  if (!user) {
    throw new Error("User not found!");
  }

  console.log("USER RESOLVED SUCCESSFULLY:", user.id, user.name);

  // Test CustomerProfile lookup
  let profile = await prisma.customerProfile.findUnique({
    where: { userId: user.id },
    include: {
      savedAddresses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) {
    console.log("CREATING PROFILE FOR USER:", user.id);
    profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        defaultCurrency: "GHS",
        defaultZone: "Tamale Central",
        preferredPayment: "MOMO_ESCROW",
        profileVisibility: "RESTRICTED",
        notifyInApp: true,
        notifyWhatsApp: true,
        notifySms: true,
        notifyMarketingEmail: false,
        sharePhoneWithArtisan: true,
        showNameOnReviews: true,
        status: "ACTIVE",
        verificationTier: user.isPhoneVerified ? "TIER_1_BASIC" : "UNVERIFIED",
        riskLevel: "LOW",
        riskScore: 5.0,
      },
      include: {
        savedAddresses: true,
      },
    });
  }

  console.log("PROFILE RESOLVED:", profile.id, profile.savedAddresses.length, "addresses");

  // Test service requests query
  const reqConditions: any[] = [];
  if (isValidUuid(user.id)) reqConditions.push({ customerId: user.id });
  const phoneVariants = [session.phone, session.phone.replace("+233", "0")];
  phoneVariants.forEach((p) => reqConditions.push({ guestPhone: p }));

  const serviceRequests = await prisma.serviceRequest.findMany({
    where: { OR: reqConditions },
    include: {
      quotes: {
        include: {
          provider: {
            select: { id: true, name: true, phone: true, avatarUrl: true },
          },
        },
      },
      service: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("SERVICE REQUESTS FOUND:", serviceRequests.length);
  serviceRequests.forEach(r => console.log(`- [${r.status}] ${r.title} (ID: ${r.id})`));

  // Test address creation
  console.log("TESTING ADDRESS CREATION...");
  const newAddr = await prisma.customerAddress.create({
    data: {
      customerProfileId: profile.id,
      label: "Home / Workshop",
      zone: "Tamale Central",
      streetDetails: "Near Central Mosque",
      landmark: "Opposite Police Station",
      latitude: 9.4008,
      longitude: -0.8393,
      isDefault: true,
    },
  });

  console.log("ADDRESS CREATED SUCCESSFULLY:", newAddr.id, newAddr.label);
}

testEndpoints()
  .then(() => console.log("ALL TESTS PASSED WITH 0 ERRORS!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
