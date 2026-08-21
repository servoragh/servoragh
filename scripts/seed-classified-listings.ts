import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Classified Product Listings into real PostgreSQL database...");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const adminId = admin?.id || null;

  const listings = [
    {
      title: "Toyota Hilux Pickup Truck (2020 Model - Clean Engine)",
      slug: "toyota-hilux-pickup-truck-2020-tamale-lst101",
      description: "Well maintained Toyota Hilux Double Cabin. Air conditioning freezing cold, complete duty paid in Ghana. Ideal for farm and site work in Northern Region.",
      category: "Vehicles & Heavy Equipment",
      subCategory: "Pickup Trucks",
      condition: "USED_LIKE_NEW",
      price: 185000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Sakasaka, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY"],
      sellerType: "REGISTERED_USER",
      sellerId: adminId,
      status: "ACTIVE",
      isFeatured: true,
      approvedById: adminId,
      approvedAt: new Date(),
    },
    {
      title: "DeWalt 20V Max Cordless Brushless Combo Drill Kit (Guest Listing)",
      slug: "dewalt-20v-max-cordless-drill-kit-lst102",
      description: "Brand new original DeWalt drill set imported from US. Comes with 2 batteries, charger, and heavy duty contractor bag.",
      category: "Tools & Equipment",
      subCategory: "Power Tools",
      condition: "BRAND_NEW",
      price: 1450.0,
      isNegotiable: false,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Central Market, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: "GUEST",
      guestName: "Baba Salifu",
      guestPhone: "+233245678901",
      guestWhatsApp: "+233245678901",
      guestEmail: "salifu.hardware@gmail.com",
      isGuestVerified: true,
      guestAccessKey: "magic_key_salifu_102",
      status: "PENDING_APPROVAL",
      isFeatured: false,
    },
    {
      title: "Handwoven Royal Dagbon Smock (Batik Fugu - Size XL)",
      slug: "handwoven-royal-dagbon-smock-fugu-lst103",
      description: "Authentic handspun Northern Ghana heavy cotton fugu. Traditional blue and white stripes with intricate neck embroidery.",
      category: "Fashion & Apparel",
      subCategory: "Northern Smocks (Fugu)",
      condition: "BRAND_NEW",
      price: 480.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Nyohini, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: "REGISTERED_USER",
      sellerId: adminId,
      status: "ACTIVE",
      isFeatured: true,
    },
    {
      title: "Commercial Agricultural Solar Water Pump (5HP - High Head)",
      slug: "commercial-agricultural-solar-water-pump-5hp-lst104",
      description: "High discharge solar surface pump for large scale irrigation, tomato, yam & onion farms in Bolgatanga and Tamale.",
      category: "Agro Produce & Equipment",
      subCategory: "Water Pumps",
      condition: "BRAND_NEW",
      price: 8500.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Aboabo, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: "GUEST",
      guestName: "Zenabu Salifu",
      guestPhone: "+233247778899",
      guestWhatsApp: "+233247778899",
      guestEmail: "zenabu.farms@servora.gh",
      isGuestVerified: true,
      guestAccessKey: "magic_key_zenabu_104",
      status: "PENDING_APPROVAL",
      isFeatured: true,
    },
  ];

  for (const item of listings) {
    await prisma.productListing.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        condition: item.condition as any,
        price: item.price,
        isNegotiable: item.isNegotiable,
        currency: item.currency,
        images: item.images,
        area: item.area,
        deliveryOptions: item.deliveryOptions,
        sellerType: item.sellerType as any,
        sellerId: item.sellerId,
        guestName: item.guestName,
        guestPhone: item.guestPhone,
        guestWhatsApp: item.guestWhatsApp,
        guestEmail: item.guestEmail,
        isGuestVerified: item.isGuestVerified,
        guestAccessKey: item.guestAccessKey,
        status: item.status as any,
        isFeatured: item.isFeatured,
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        condition: item.condition as any,
        price: item.price,
        isNegotiable: item.isNegotiable,
        currency: item.currency,
        images: item.images,
        area: item.area,
        deliveryOptions: item.deliveryOptions,
        sellerType: item.sellerType as any,
        sellerId: item.sellerId,
        guestName: item.guestName,
        guestPhone: item.guestPhone,
        guestWhatsApp: item.guestWhatsApp,
        guestEmail: item.guestEmail,
        isGuestVerified: item.isGuestVerified,
        guestAccessKey: item.guestAccessKey,
        status: item.status as any,
        isFeatured: item.isFeatured,
      },
    });
  }

  console.log("  ✓ Seeded Classified Listings into PostgreSQL database successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding classified listings failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
