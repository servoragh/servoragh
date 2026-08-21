import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(data: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  avatarUrl?: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
  });

  if (existing) {
    return await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
        avatarUrl: data.avatarUrl || existing.avatarUrl,
        isPhoneVerified: true,
      },
    });
  } else {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
        avatarUrl: data.avatarUrl,
        isPhoneVerified: true,
      },
    });
  }
}

async function main() {
  console.log("🌱 Starting Detailed Accounts & Products Seeding for Servora Ghana...");

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // =========================================================================
  // 1. CREATE 3 DETAILED CUSTOMER ACCOUNTS
  // =========================================================================
  console.log("\n👤 Creating 3 Detailed Customer Accounts...");

  await upsertUser({
    name: "Fatima Alhassan",
    email: "fatima.alhassan@gmail.com",
    phone: "+233241119988",
    passwordHash: defaultPasswordHash,
    role: "CUSTOMER",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
  });

  await upsertUser({
    name: "Kwaku Mensah",
    email: "kwaku.mensah@gmail.com",
    phone: "+233242229988",
    passwordHash: defaultPasswordHash,
    role: "CUSTOMER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  });

  await upsertUser({
    name: "Amina Yakubu",
    email: "amina.yakubu@gmail.com",
    phone: "+233243339988",
    passwordHash: defaultPasswordHash,
    role: "CUSTOMER",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
  });

  console.log("  ✓ Created Customers: Fatima, Kwaku, Amina");

  // =========================================================================
  // 2. CREATE 3 DETAILED ADMIN ACCOUNTS
  // =========================================================================
  console.log("\n🛡️ Creating 3 Admin Accounts...");

  await upsertUser({
    name: "Master Super Admin",
    email: "admin@servora.gh",
    phone: "+233240000000",
    passwordHash: defaultPasswordHash,
    role: "ADMIN",
  });

  await upsertUser({
    name: "Delivery Operations Admin",
    email: "delivery.admin@servora.gh",
    phone: "+233240000001",
    passwordHash: defaultPasswordHash,
    role: "ADMIN",
  });

  await upsertUser({
    name: "Merchant Verification Admin",
    email: "verifications.admin@servora.gh",
    phone: "+233240000002",
    passwordHash: defaultPasswordHash,
    role: "ADMIN",
  });

  console.log("  ✓ Created Admins: Master Admin, Delivery Admin, Verification Admin");

  // =========================================================================
  // 3. CREATE 3 DETAILED BUSINESS ACCOUNTS & MANY PRODUCTS WITH PHOTOS
  // =========================================================================
  console.log("\n🏪 Creating 3 Detailed Business Accounts & Product Catalogues...");

  // --- BUSINESS 1: Northern Heritage Smocks & Fugu Hub ---
  const bizUser1 = await upsertUser({
    name: "Chief Fuseini Adam",
    email: "fuseini.smocks@servora.gh",
    phone: "+233245559988",
    passwordHash: defaultPasswordHash,
    role: "PROVIDER",
    avatarUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80",
  });

  const prov1 = await prisma.providerProfile.upsert({
    where: { slug: "northern-heritage-smocks" },
    update: {
      businessName: "Northern Heritage Smocks & Fugu Hub",
      bio: "Master weaver producing authentic Dagbon royal smocks, heavy handwoven Fugu cotton attire, and ceremonial marriage attire.",
      pricingHourly: 50.0,
      pricingFixedStart: 85.0,
      serviceArea: "Tamale, Sakasaka, Choggu, All Ghana Shipping",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 4.9,
      reviewCount: 48,
      completedJobsCount: 120,
    },
    create: {
      userId: bizUser1.id,
      businessName: "Northern Heritage Smocks & Fugu Hub",
      slug: "northern-heritage-smocks",
      bio: "Master weaver producing authentic Dagbon royal smocks, heavy handwoven Fugu cotton attire, and ceremonial marriage attire.",
      pricingHourly: 50.0,
      pricingFixedStart: 85.0,
      serviceArea: "Tamale, Sakasaka, Choggu, All Ghana Shipping",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 4.9,
      reviewCount: 48,
      completedJobsCount: 120,
    },
  });

  await prisma.businessProfile.upsert({
    where: { slug: "northern-heritage-smocks" },
    update: {
      businessName: "Northern Heritage Smocks & Fugu Hub",
      tagline: "Authentic Handwoven Dagbon Royal Smocks & Attire",
      description: "Authentic hand-woven Ghanaian Fugu smocks, royal Dagbon attire, heavy cotton weaves, and customized traditional wear direct from Tamale weavers.",
      zone: "Sakasaka",
      addressDetails: "Sakasaka Crafts Center, Hospital Road, Tamale",
      landmark: "Opposite Sakasaka Total Filling Station",
      phone: "+233245559988",
      whatsappNumber: "+233245559988",
      email: "fuseini.smocks@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 4.9,
      reviewsCount: 48,
    },
    create: {
      userId: bizUser1.id,
      businessName: "Northern Heritage Smocks & Fugu Hub",
      slug: "northern-heritage-smocks",
      tagline: "Authentic Handwoven Dagbon Royal Smocks & Attire",
      description: "Authentic hand-woven Ghanaian Fugu smocks, royal Dagbon attire, heavy cotton weaves, and customized traditional wear direct from Tamale weavers.",
      zone: "Sakasaka",
      addressDetails: "Sakasaka Crafts Center, Hospital Road, Tamale",
      landmark: "Opposite Sakasaka Total Filling Station",
      phone: "+233245559988",
      whatsappNumber: "+233245559988",
      email: "fuseini.smocks@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 4.9,
      reviewsCount: 48,
    },
  });

  const smockProducts = [
    {
      title: "Royal Handwoven Dagbon Heavy Fugu Smock",
      slug: "royal-handwoven-dagbon-fugu-smock",
      description: "Heavyweight 100% natural cotton hand-loomed smock woven by master artisans in Tamale. Features traditional intricate embroidery, reinforced seams, and authentic royal colors.",
      price: 450.0,
      originalPrice: 520.0,
      stockQuantity: 15,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Men's Presidential Striped Cotton Fugu (Blue & White)",
      slug: "mens-presidential-striped-fugu-blue-white",
      description: "Executive presidential cut Fugu tailored for formal occasions, durbars, and cultural events. Breathable heavy cotton weave with premium embroidery.",
      price: 380.0,
      originalPrice: 420.0,
      stockQuantity: 25,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Women's Traditional Woven Northern Agbada Dress",
      slug: "womens-traditional-woven-northern-dress",
      description: "Elegantly tailored female Northern gown made from authentic strip-woven cotton cloth with matching headwrap.",
      price: 520.0,
      originalPrice: 580.0,
      stockQuantity: 10,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Custom Ceremonial Marriage Smock Set (His & Hers)",
      slug: "custom-ceremonial-marriage-smock-set",
      description: "Matching couple's wedding attire featuring custom handwoven patterns, custom initials embroidery, and premium gold threading.",
      price: 950.0,
      originalPrice: 1100.0,
      stockQuantity: 8,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Handwoven Dagbon Traditional Riding Cap (Fila)",
      slug: "handwoven-dagbon-traditional-cap-fila",
      description: "Authentic handwoven cotton cap to complete your traditional Northern smock attire. Available in multiple sizes.",
      price: 85.0,
      originalPrice: 100.0,
      stockQuantity: 40,
      category: "Fashion & Fugu",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  ];

  for (const p of smockProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, providerId: prov1.id },
      create: { ...p, providerId: prov1.id },
    });
  }

  // --- BUSINESS 2: Tamale Solar & Heavy Power Solutions ---
  const bizUser2 = await upsertUser({
    name: "Eng. Rashid Mohammed",
    email: "rashid.solar@servora.gh",
    phone: "+233246669988",
    passwordHash: defaultPasswordHash,
    role: "PROVIDER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  });

  const prov2 = await prisma.providerProfile.upsert({
    where: { slug: "tamale-solar-power" },
    update: {
      businessName: "Tamale Solar & Heavy Power Solutions",
      bio: "Northern Ghana's leading distributor of high-efficiency solar panels, lithium wall batteries, pure sine wave inverters, and heavy diesel generators.",
      pricingHourly: 100.0,
      pricingFixedStart: 250.0,
      serviceArea: "Tamale, Bolgatanga, Wa, Yendi, All Northern Region",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 5.0,
      reviewCount: 36,
      completedJobsCount: 85,
    },
    create: {
      userId: bizUser2.id,
      businessName: "Tamale Solar & Heavy Power Solutions",
      slug: "tamale-solar-power",
      bio: "Northern Ghana's leading distributor of high-efficiency solar panels, lithium wall batteries, pure sine wave inverters, and heavy diesel generators.",
      pricingHourly: 100.0,
      pricingFixedStart: 250.0,
      serviceArea: "Tamale, Bolgatanga, Wa, Yendi, All Northern Region",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 5.0,
      reviewCount: 36,
      completedJobsCount: 85,
    },
  });

  await prisma.businessProfile.upsert({
    where: { slug: "tamale-solar-power" },
    update: {
      businessName: "Tamale Solar & Heavy Power Solutions",
      tagline: "Uninterrupted Renewable Power & Generator Distribution",
      description: "Northern Ghana's leading distributor of solar panels, lithium-ion storage batteries, pure sine wave inverters, and heavy-duty diesel generators.",
      zone: "Tamale Central",
      addressDetails: "Commercial Street, Near Barclays Building, Tamale CBD",
      landmark: "Opposite GCB Main Branch",
      phone: "+233246669988",
      whatsappNumber: "+233246669988",
      email: "rashid.solar@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1508873696983-2df515122519?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 5.0,
      reviewsCount: 36,
    },
    create: {
      userId: bizUser2.id,
      businessName: "Tamale Solar & Heavy Power Solutions",
      slug: "tamale-solar-power",
      tagline: "Uninterrupted Renewable Power & Generator Distribution",
      description: "Northern Ghana's leading distributor of solar panels, lithium-ion storage batteries, pure sine wave inverters, and heavy-duty diesel generators.",
      zone: "Tamale Central",
      addressDetails: "Commercial Street, Near Barclays Building, Tamale CBD",
      landmark: "Opposite GCB Main Branch",
      phone: "+233246669988",
      whatsappNumber: "+233246669988",
      email: "rashid.solar@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1508873696983-2df515122519?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 5.0,
      reviewsCount: 36,
    },
  });

  const solarProducts = [
    {
      title: "Felicity 550W Monocrystalline High-Efficiency Solar Panel",
      slug: "felicity-550w-monocrystalline-solar-panel",
      description: "Tier-1 high efficiency PERC monocrystalline panel engineered for high solar radiance in Northern Ghana. 25-year linear power warranty.",
      price: 1250.0,
      originalPrice: 1400.0,
      stockQuantity: 50,
      category: "Electrical Supplies",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "5.12kWh LiFePO4 Lithium Wall-Mounted Battery 48V",
      slug: "5-12kwh-lifepo4-lithium-wall-battery-48v",
      description: "Long-life lithium iron phosphate battery pack with built-in Smart BMS. 6,000+ cycle life for off-grid homes, commercial shops, and cold rooms.",
      price: 14500.0,
      originalPrice: 16000.0,
      stockQuantity: 12,
      category: "Electrical Supplies",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1558441719-67799a714655?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "5kW Hybrid Pure Sine Wave Solar Inverter (MPPT)",
      slug: "5kw-hybrid-pure-sine-wave-solar-inverter",
      description: "High-capacity hybrid inverter with built-in 100A MPPT solar controller. Supports grid-tie, generator auto-start, and lithium battery communication.",
      price: 6800.0,
      originalPrice: 7500.0,
      stockQuantity: 18,
      category: "Electrical Supplies",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "10kVA Heavy-Duty Silent Diesel Generator",
      slug: "10kva-heavy-duty-silent-diesel-generator",
      description: "Commercial soundproof diesel generator with automatic transfer switch (ATS). Ideal for supermarkets, hospitals, and construction sites.",
      price: 28000.0,
      originalPrice: 31000.0,
      stockQuantity: 5,
      category: "Tools",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Solar Borehole Submersible Water Pump System 1.5HP",
      slug: "solar-borehole-submersible-pump-system-1-5hp",
      description: "DC brushless solar submersible pump capable of pumping water up to 120m depth for irrigation and livestock farming.",
      price: 4200.0,
      originalPrice: 4700.0,
      stockQuantity: 14,
      category: "Tools",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  ];

  for (const p of solarProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, providerId: prov2.id },
      create: { ...p, providerId: prov2.id },
    });
  }

  // --- BUSINESS 3: Savannah Fresh Farm Produce & Agro-Goods ---
  const bizUser3 = await upsertUser({
    name: "Madam Salifu Zenabu",
    email: "zenabu.farms@servora.gh",
    phone: "+233247779988",
    passwordHash: defaultPasswordHash,
    role: "PROVIDER",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
  });

  const prov3 = await prisma.providerProfile.upsert({
    where: { slug: "savannah-fresh-farms" },
    update: {
      businessName: "Savannah Fresh Farm Produce & Agro-Goods",
      bio: "Direct farm cooperative wholesaler supplying pure unrefined Shea Butter, fresh Tamale Pona yams, organic soybeans, guinea fowl eggs, and wild honey.",
      pricingHourly: 30.0,
      pricingFixedStart: 65.0,
      serviceArea: "Tamale, Aboabo, Kumasi, Accra, Export Orders",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 4.8,
      reviewCount: 62,
      completedJobsCount: 210,
    },
    create: {
      userId: bizUser3.id,
      businessName: "Savannah Fresh Farm Produce & Agro-Goods",
      slug: "savannah-fresh-farms",
      bio: "Direct farm cooperative wholesaler supplying pure unrefined Shea Butter, fresh Tamale Pona yams, organic soybeans, guinea fowl eggs, and wild honey.",
      pricingHourly: 30.0,
      pricingFixedStart: 65.0,
      serviceArea: "Tamale, Aboabo, Kumasi, Accra, Export Orders",
      verificationStatus: "VERIFIED",
      logoUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80",
      ratingAverage: 4.8,
      reviewCount: 62,
      completedJobsCount: 210,
    },
  });

  await prisma.businessProfile.upsert({
    where: { slug: "savannah-fresh-farms" },
    update: {
      businessName: "Savannah Fresh Farm Produce & Agro-Goods",
      tagline: "Pure Northern Shea Butter, Fresh Yams & Agro Produce",
      description: "Direct farm-to-table wholesaler of pure Northern Shea Butter, fresh Tamale yams, guinea fowl eggs, organic soybeans, and unprocessed honey.",
      zone: "Aboabo",
      addressDetails: "Aboabo Wholesale Agro Market, Shed #12, Tamale",
      landmark: "Near Aboabo Yam Market Gate",
      phone: "+233247779988",
      whatsappNumber: "+233247779988",
      email: "zenabu.farms@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 4.8,
      reviewsCount: 62,
    },
    create: {
      userId: bizUser3.id,
      businessName: "Savannah Fresh Farm Produce & Agro-Goods",
      slug: "savannah-fresh-farms",
      tagline: "Pure Northern Shea Butter, Fresh Yams & Agro Produce",
      description: "Direct farm-to-table wholesaler of pure Northern Shea Butter, fresh Tamale yams, guinea fowl eggs, organic soybeans, and unprocessed honey.",
      zone: "Aboabo",
      addressDetails: "Aboabo Wholesale Agro Market, Shed #12, Tamale",
      landmark: "Near Aboabo Yam Market Gate",
      phone: "+233247779988",
      whatsappNumber: "+233247779988",
      email: "zenabu.farms@servora.gh",
      logoUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80",
      verificationStatus: "TIER_3_REGISTERED_ENTERPRISE",
      isFeatured: true,
      ratingAverage: 4.8,
      reviewsCount: 62,
    },
  });

  const farmProducts = [
    {
      title: "Organic Unrefined Grade-A Northern Shea Butter (25kg Tub)",
      slug: "organic-unrefined-grade-a-northern-shea-butter",
      description: "100% pure raw unrefined Shea Butter extracted traditionally by women's cooperatives in Northern Ghana. Rich in natural vitamins A & E for cosmetic & pharmaceutical uses.",
      price: 450.0,
      originalPrice: 500.0,
      stockQuantity: 30,
      category: "Agro Produce",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Fresh Pona Yams (Full 100 Tubers Large Size Batch)",
      slug: "fresh-pona-yams-100-tubers-large-batch",
      description: "Freshly harvested sweet Northern Pona yams sourced directly from Tamale & Salaga farms. High dry-matter content, sweet flavor, ideal for boiling and fried yam.",
      price: 1200.0,
      originalPrice: 1350.0,
      stockQuantity: 20,
      category: "Agro Produce",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Fresh Farm-Raised Northern Guinea Fowl Eggs (Crate of 30)",
      slug: "fresh-farm-raised-guinea-fowl-eggs-crate-30",
      description: "Organic free-range guinea fowl eggs harvested daily. High protein content and long shelf life.",
      price: 65.0,
      originalPrice: 75.0,
      stockQuantity: 100,
      category: "Agro Produce",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Raw Unpasteurized Wild Forest Honey (5 Liter Gallon)",
      slug: "raw-unpasteurized-wild-forest-honey-5L",
      description: "Pure wild forest honey harvested from northern savanna woodlands. Unfiltered, thick texture with rich natural aroma.",
      price: 280.0,
      originalPrice: 320.0,
      stockQuantity: 45,
      category: "Agro Produce",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80",
      ]),
    },
    {
      title: "Cleaned Non-GMO Organic Soybeans (100kg Bag)",
      slug: "cleaned-non-gmo-organic-soybeans-100kg-bag",
      description: "High-oil content organic yellow soybeans, thoroughly cleaned and machine sorted. Ideal for soymilk processing, poultry feed, and oil extraction.",
      price: 550.0,
      originalPrice: 600.0,
      stockQuantity: 40,
      category: "Agro Produce",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
      ]),
    },
  ];

  for (const p of farmProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, providerId: prov3.id },
      create: { ...p, providerId: prov3.id },
    });
  }

  console.log("  ✓ Created Businesses & Product Catalogues:");
  console.log("    1. Northern Heritage Smocks & Fugu Hub (5 Products)");
  console.log("    2. Tamale Solar & Heavy Power Solutions (5 Products)");
  console.log("    3. Savannah Fresh Farm Produce & Agro-Goods (5 Products)");

  console.log("\n🎉 All 9 Detailed Accounts and 15 Products Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
