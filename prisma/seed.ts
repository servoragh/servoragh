import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Servora database seeding...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.product.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Locations (Tamale Neighborhoods)
  const locations = [
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Sakasaka", slug: "sakasaka" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Nyohini", slug: "nyohini" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Choggu", slug: "choggu" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Aboabo", slug: "aboabo" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Lamashegu", slug: "lamashegu" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Education Ridge", slug: "education-ridge" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Kalpohin", slug: "kalpohin" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Dungu (UDS Campus)", slug: "dungu-uds" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Tamale Central", slug: "tamale-central" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Kakpagyili", slug: "kakpagyili" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Vittin", slug: "vittin" },
    { country: "Ghana", region: "Northern Region", city: "Tamale", area: "Gurugu", slug: "gurugu" },
  ];

  const createdLocations: Record<string, any> = {};
  for (const loc of locations) {
    const l = await prisma.location.create({ data: loc });
    createdLocations[loc.slug] = l;
  }
  console.log(`✅ Created ${locations.length} Tamale locations`);

  // 2. Seed Service Categories & Sub-Services
  const categoriesData = [
    {
      name: "Electrical & Home Maintenance",
      slug: "electrical-home",
      description: "Home wiring, socket repair, AC servicing, generator maintenance, and plumbing.",
      icon: "Zap",
      featured: true,
      services: [
        { name: "Electrician & Wiring", slug: "electricians", description: "Fault detection, house wiring, breaker repair, ceiling fan installation." },
        { name: "AC & Fridge Servicing", slug: "ac-fridge-repair", description: "Air conditioner gas refill, cooling repairs, refrigerator compressor fixing." },
        { name: "Plumbing & Drainage", slug: "plumbers", description: "Water pipe leaks, borehole pump installation, bathroom fixtures." },
      ],
    },
    {
      name: "Electronics & Device Repair",
      slug: "electronics-repair",
      description: "Smartphone screen repair, laptop servicing, TV fixing, and gadgets.",
      icon: "Smartphone",
      featured: true,
      services: [
        { name: "Phone & Tablet Repair", slug: "phone-repair", description: "Screen replacements, battery changes, charging port repair, software flashing." },
        { name: "Laptop & PC Servicing", slug: "computer-repair", description: "OS installation, keyboard replacement, hard drive upgrade, motherboard fixing." },
        { name: "TV & Home Appliance Repair", slug: "appliance-repair", description: "Flat screen LED TV repairs, microwave and washing machine fixing." },
      ],
    },
    {
      name: "Tailoring & Fashion Design",
      slug: "tailoring-fashion",
      description: "Traditional Northern Ghana Smocks (Fugu), Kaftans, and custom ladieswear.",
      icon: "Scissors",
      featured: true,
      services: [
        { name: "Fugu & Traditional Smock Weaving", slug: "fugu-tailors", description: "Authentic handmade Northern Ghanaian Fugu, smock embroidery, custom sizing." },
        { name: "Men's Kaftans & Suits", slug: "mens-tailors", description: "Bespoke Senator suits, traditional kaftans, trouser adjustments." },
        { name: "Seamstress & Ladieswear", slug: "seamstresses", description: "Kente dresses, wedding gowns, casual ladieswear alterations." },
      ],
    },
    {
      name: "Cleaning & Sanitation",
      slug: "cleaning-sanitation",
      description: "Residential deep cleaning, office janitorial services, move-in cleaning.",
      icon: "Sparkles",
      featured: false,
      services: [
        { name: "Home Deep Cleaning", slug: "cleaners", description: "Full apartment cleaning, carpet washing, post-construction cleanup." },
        { name: "Sofa & Mattress Washing", slug: "furniture-cleaning", description: "Upholstery foam washing, stain removal, odor elimination." },
      ],
    },
  ];

  const createdServices: Record<string, any> = {};
  for (const catData of categoriesData) {
    const { services, ...cat } = catData;
    const createdCat = await prisma.category.create({ data: cat });
    for (const serv of services) {
      const s = await prisma.service.create({
        data: {
          ...serv,
          categoryId: createdCat.id,
        },
      });
      createdServices[serv.slug] = s;
    }
  }
  console.log("✅ Created categories & sub-services");

  // 3. Password Hashes
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);

  // 4. Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: "Servora Admin",
      email: "admin@servora.gh",
      phone: "+233240000000",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isPhoneVerified: true,
      referralCode: "ADMIN001",
    },
  });

  // 5. Customer Users
  const customer1 = await prisma.user.create({
    data: {
      name: "Amina Abdul-Rahman",
      email: "amina@gmail.com",
      phone: "+233241112233",
      passwordHash: defaultPasswordHash,
      role: "CUSTOMER",
      isPhoneVerified: true,
      referralCode: "AMINA101",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "David Osei Yaw",
      email: "david.uds@gmail.com",
      phone: "+233552233444",
      passwordHash: defaultPasswordHash,
      role: "CUSTOMER",
      isPhoneVerified: true,
      referralCode: "DAVID202",
    },
  });

  // 6. Provider Users & Profiles
  // Provider 1: Kwame Mensah (Electrician in Sakasaka)
  const providerUser1 = await prisma.user.create({
    data: {
      name: "Kwame Mensah",
      email: "kwame.electric@gmail.com",
      phone: "+233244889900",
      passwordHash: defaultPasswordHash,
      role: "PROVIDER",
      isPhoneVerified: true,
      referralCode: "KWAME77",
    },
  });

  const providerProfile1 = await prisma.providerProfile.create({
    data: {
      userId: providerUser1.id,
      businessName: "Kwame Electrical & AC Experts",
      slug: "kwame-electrical-tamale",
      bio: "Certified electrical engineer with over 8 years experience in Tamale. Specialist in household wiring, AC gas refilling, breaker troubleshooting, and ceiling fans.",
      yearsExperience: 8,
      pricingHourly: 45.0,
      pricingFixedStart: 60.0,
      serviceArea: "Sakasaka, Tamale Central, Nyohini, Choggu, Kalpohin",
      verificationStatus: "VERIFIED",
      ratingAverage: 4.9,
      reviewCount: 28,
      completedJobsCount: 42,
      responseRate: 98.0,
      responseTimeMinutes: 15,
      isPromoted: true,
      badges: JSON.stringify(["PHONE_VERIFIED", "IDENTITY_VERIFIED", "BUSINESS_VERIFIED", "TOP_RATED"]),
      portfolioUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.providerService.create({
    data: {
      providerId: providerProfile1.id,
      serviceId: createdServices["electricians"].id,
    },
  });
  await prisma.providerService.create({
    data: {
      providerId: providerProfile1.id,
      serviceId: createdServices["ac-fridge-repair"].id,
    },
  });

  // Provider 2: Fuseini Ibrahim (Phone Repair in Sakasaka Market)
  const providerUser2 = await prisma.user.create({
    data: {
      name: "Fuseini Ibrahim",
      email: "fuseini.tech@gmail.com",
      phone: "+233209988776",
      passwordHash: defaultPasswordHash,
      role: "PROVIDER",
      isPhoneVerified: true,
      referralCode: "FUSEINI88",
    },
  });

  const providerProfile2 = await prisma.providerProfile.create({
    data: {
      userId: providerUser2.id,
      businessName: "Fuseini Mobile Phone & Laptop Hospital",
      slug: "fuseini-phone-repair-sakasaka",
      bio: "Sakasaka phone hub master technician. Original screen replacement for iPhone, Samsung, Tecno, Infinix. Battery upgrades, charging port soldering, OS flashing.",
      yearsExperience: 6,
      pricingHourly: 35.0,
      pricingFixedStart: 50.0,
      serviceArea: "Sakasaka, Aboabo, Central Market, All Tamale",
      verificationStatus: "VERIFIED",
      ratingAverage: 4.8,
      reviewCount: 34,
      completedJobsCount: 65,
      responseRate: 99.0,
      responseTimeMinutes: 10,
      isPromoted: true,
      badges: JSON.stringify(["PHONE_VERIFIED", "IDENTITY_VERIFIED", "TOP_RATED", "FAST_RESPONDER"]),
      portfolioUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.providerService.create({
    data: {
      providerId: providerProfile2.id,
      serviceId: createdServices["phone-repair"].id,
    },
  });
  await prisma.providerService.create({
    data: {
      providerId: providerProfile2.id,
      serviceId: createdServices["computer-repair"].id,
    },
  });

  // Provider 3: Hajia Fatima (Traditional Fugu & Tailor in Aboabo)
  const providerUser3 = await prisma.user.create({
    data: {
      name: "Hajia Fatima Al-Hassan",
      email: "hajia.fugu@gmail.com",
      phone: "+233245554433",
      passwordHash: defaultPasswordHash,
      role: "PROVIDER",
      isPhoneVerified: true,
      referralCode: "HAJIA303",
    },
  });

  const providerProfile3 = await prisma.providerProfile.create({
    data: {
      userId: providerUser3.id,
      businessName: "Northern Grace Fugu & Tailoring Hub",
      slug: "northern-grace-fugu-tamale",
      bio: "Authentic hand-woven Northern Ghana Fugu (Smocks), embroidery, bespoke Senator kaftans, and bridal attire. Located at Aboabo Market, delivering across Tamale.",
      yearsExperience: 12,
      pricingHourly: 50.0,
      pricingFixedStart: 120.0,
      serviceArea: "Aboabo, Tamale Central, Choggu, Education Ridge, Worldwide Delivery",
      verificationStatus: "VERIFIED",
      ratingAverage: 5.0,
      reviewCount: 19,
      completedJobsCount: 50,
      responseRate: 95.0,
      responseTimeMinutes: 20,
      isPromoted: false,
      badges: JSON.stringify(["PHONE_VERIFIED", "IDENTITY_VERIFIED", "BUSINESS_VERIFIED", "TOP_RATED"]),
      portfolioUrls: JSON.stringify([
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.providerService.create({
    data: {
      providerId: providerProfile3.id,
      serviceId: createdServices["fugu-tailors"].id,
    },
  });

  console.log("✅ Seeded users & provider profiles");

  // 6.5 Seed Products for Local Businesses
  await prisma.product.create({
    data: {
      providerId: providerProfile1.id,
      title: "Original 1.5mm Pure Copper Wiring Cable (100m Roll)",
      slug: "copper-wiring-cable-100m",
      description: "High quality copper cable for household wiring and socket installations in Tamale. High heat resistance.",
      price: 350.0,
      category: "Electrical Supplies",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.product.create({
    data: {
      providerId: providerProfile1.id,
      title: "Solar Rechargeable LED Emergency Bulb (30W)",
      slug: "solar-led-emergency-bulb-30w",
      description: "Bright solar rechargeable bulb for homes & shops during power outages. Long battery life.",
      price: 45.0,
      category: "Electrical Supplies",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.product.create({
    data: {
      providerId: providerProfile2.id,
      title: "Original Samsung Galaxy A54 AMOLED Screen Replacement",
      slug: "samsung-a54-amoled-screen",
      description: "Genuine OEM AMOLED replacement display with glass touch digitizer. Sakasaka phone hub.",
      price: 280.0,
      category: "Electronics",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.product.create({
    data: {
      providerId: providerProfile2.id,
      title: "Fast Charging 67W Type-C Adapter & Cable",
      slug: "fast-charging-67w-typec",
      description: "Ultra-fast charger compatible with Xiaomi, Tecno, Infinix, Samsung. Over-voltage protection.",
      price: 65.0,
      category: "Electronics",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  await prisma.product.create({
    data: {
      providerId: providerProfile3.id,
      title: "Hand-Woven Heavy Northern Ghana Fugu Smock",
      slug: "hand-woven-northern-fugu-smock",
      description: "Authentic hand-woven traditional Fugu from Aboabo Market. Premium thread, custom embroidery.",
      price: 450.0,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80",
      ]),
    },
  });

  // 7. Seed Service Requests
  const request1 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      serviceId: createdServices["electricians"].id,
      locationId: createdLocations["nyohini"].id,
      title: "Fix Tripping Circuit Breaker & Installing 2 Ceiling Fans",
      description: "The main circuit breaker in my house keeps tripping whenever we turn on the AC. Also need an electrician to mount two new ceiling fans in Nyohini near the police station.",
      urgency: "TODAY",
      budgetMin: 80,
      budgetMax: 150,
      status: "QUOTED",
      images: JSON.stringify([]),
    },
  });

  const request2 = await prisma.serviceRequest.create({
    data: {
      customerId: customer2.id,
      serviceId: createdServices["phone-repair"].id,
      locationId: createdLocations["dungu-uds"].id,
      title: "Broken Samsung Galaxy A54 Screen Replacement",
      description: "My screen cracked after dropping it at UDS Dungu campus. Touch is still working but glass is shattered. Need a clean replacement with genuine AMOLED screen.",
      urgency: "THIS_WEEK",
      budgetMin: 200,
      budgetMax: 350,
      status: "OPEN",
      images: JSON.stringify([]),
    },
  });

  // 8. Seed Quote
  const quote1 = await prisma.quote.create({
    data: {
      requestId: request1.id,
      providerId: providerUser1.id,
      price: 110.0,
      estimatedHours: 2,
      completionTime: "Same day (2 hours)",
      message: "Hello Amina, I can come over to Nyohini within 45 minutes with proper diagnostic tools to resolve the circuit breaker issue and safely install both ceiling fans. Guaranteed work.",
      status: "ACCEPTED",
    },
  });

  // 9. Seed Review
  await prisma.review.create({
    data: {
      requestId: request1.id,
      authorId: customer1.id,
      targetId: providerUser1.id,
      rating: 5,
      comment: "Kwame arrived promptly in Nyohini within 30 minutes! He identified the fault in our breaker panel quickly and installed the ceiling fans very neatly. Highly recommended!",
      isApproved: true,
    },
  });

  // 10. Seed Feature Flags
  const flags = [
    { name: "commission_enabled", isEnabled: false, description: "Charge 5% platform commission on completed escrow transactions." },
    { name: "featured_listing_enabled", isEnabled: true, description: "Allow providers to promote listing for top search placement." },
    { name: "provider_subscription_enabled", isEnabled: false, description: "Require monthly Pro subscription for unlimited leads." },
    { name: "lead_fee_enabled", isEnabled: false, description: "Charge GHS 3 per submitted quote." },
    { name: "verification_badge_fee_enabled", isEnabled: false, description: "Charge GHS 30 for physical ID verification process." },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.create({ data: flag });
  }

  // 11. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "INITIAL_SYSTEM_SEED",
      details: "Seeded initial Tamale locations, categories, providers, and settings.",
      ipAddress: "127.0.0.1",
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
