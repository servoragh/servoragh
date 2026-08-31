import { PrismaClient, ItemCondition, SellerType, ProductListingStatus } from "@prisma/client";
import { CLASSIFIED_CATEGORIES } from "../src/lib/categoriesData";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding full Category & Subcategory taxonomy into PostgreSQL...");

  let displayOrder = 1;
  for (const catData of CLASSIFIED_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.name,
        description: catData.description,
        icon: catData.iconName,
        displayOrder: displayOrder++,
        isActive: true,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        icon: catData.iconName,
        displayOrder: displayOrder++,
        isActive: true,
      },
    });

    console.log(` ✅ Category seeded: "${category.name}" (${category.slug})`);

    let subOrder = 1;
    for (const sub of catData.subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          categoryId: category.id,
          displayOrder: subOrder++,
          isActive: true,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          categoryId: category.id,
          displayOrder: subOrder++,
          isActive: true,
        },
      });
    }
  }

  console.log("🌱 Seeding realistic mock classified products for Marketplace Categories...");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const adminId = admin?.id || null;

  const mockItems = [
    {
      id: "mock-item-veh-01",
      title: "Toyota Hilux Pickup Truck (2020 Double Cabin - Clean Engine)",
      slug: "toyota-hilux-pickup-truck-2020-tamale-lst101",
      description: "Well maintained Toyota Hilux Double Cabin. Air conditioning freezing cold, complete duty paid in Ghana. Ideal for farm and site work in Northern Region.",
      category: "Vehicles",
      subCategory: "Trucks & Trailers",
      condition: ItemCondition.USED_LIKE_NEW,
      price: 185000.0,
      originalPrice: 195000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Sakasaka, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY"],
      sellerType: SellerType.REGISTERED_USER,
      sellerId: adminId,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-prop-02",
      title: "Modern 3-Bedroom Self-Contained House for Sale in Kalpohin Estate",
      slug: "modern-3-bedroom-house-for-sale-kalpohin",
      description: "Newly built walled house with private prepaid meter, water storage tank, tiled floors, and spacious compound in serene Kalpohin Residential Area.",
      category: "Property",
      subCategory: "Houses & Apartments for Sale",
      condition: ItemCondition.BRAND_NEW,
      price: 450000.0,
      originalPrice: 480000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Kalpohin, Tamale",
      deliveryOptions: ["ON_SITE_SERVICE"],
      sellerType: SellerType.REGISTERED_USER,
      sellerId: adminId,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-phone-03",
      title: "Samsung Galaxy S23 Ultra (256GB - Phantom Black - US Spec)",
      slug: "samsung-galaxy-s23-ultra-256gb-phantom-black",
      description: "Super clean original Samsung Galaxy S23 Ultra with S-Pen, 100x Space Zoom camera, and 12GB RAM. Unlocked for all Ghanaian mobile networks.",
      category: "Phones & Tablets",
      subCategory: "Mobile Phones",
      condition: ItemCondition.USED_LIKE_NEW,
      price: 8200.0,
      originalPrice: 9000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Central Market, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY"],
      sellerType: SellerType.GUEST,
      guestName: "Alhassan Tech",
      guestPhone: "+233245678901",
      guestWhatsApp: "+233245678901",
      isGuestVerified: true,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-elec-04",
      title: "Apple MacBook Pro 16-inch M2 Max (32GB RAM, 1TB SSD)",
      slug: "apple-macbook-pro-16-inch-m2-max-32gb-1tb",
      description: "Pristine condition MacBook Pro for graphic design, software engineering, and 4K video editing. Battery condition 98%. Includes original 140W fast charger.",
      category: "Electronics",
      subCategory: "Laptops & Computers",
      condition: ItemCondition.USED_LIKE_NEW,
      price: 24500.0,
      originalPrice: 27000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Aboabo, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: SellerType.REGISTERED_USER,
      sellerId: adminId,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-fash-05",
      title: "Authentic Handwoven Royal Dagbon Smock (Batik Fugu - Size XL)",
      slug: "handwoven-royal-dagbon-smock-fugu-lst103",
      description: "Authentic handspun Northern Ghana heavy cotton fugu. Traditional blue and white stripes with intricate neck embroidery made in Nyohini.",
      category: "Fashion",
      subCategory: "Fugu & Traditional Northern Wear",
      condition: ItemCondition.BRAND_NEW,
      price: 480.0,
      originalPrice: 550.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Nyohini, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: SellerType.REGISTERED_USER,
      sellerId: adminId,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-rep-06",
      title: "Commercial Solar Power Inverter System (5KVA 48V Lithium Battery Bundle)",
      slug: "commercial-solar-power-inverter-system-5kva",
      description: "High performance hybrid solar inverter with 5.12kWh LiFePO4 battery pack and 6x 550W mono solar panels. Ideal for off-grid homes and shops in Northern Ghana.",
      category: "Repair & Construction",
      subCategory: "Solar Panels, Inverters & Energy",
      condition: ItemCondition.BRAND_NEW,
      price: 28500.0,
      originalPrice: 32000.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Sakasaka, Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY"],
      sellerType: SellerType.REGISTERED_USER,
      sellerId: adminId,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
    {
      id: "mock-item-agri-07",
      title: "High Discharge Solar Water Pump (5HP - High Head Irrigation)",
      slug: "commercial-agricultural-solar-water-pump-5hp-lst104",
      description: "High discharge solar surface pump for large scale irrigation, tomato, yam & onion farms in Bolgatanga, Wa, and Tamale.",
      category: "Food, Agriculture & Farming",
      subCategory: "Farm Machinery, Tractors & Implements",
      condition: ItemCondition.BRAND_NEW,
      price: 8500.0,
      originalPrice: 9500.0,
      isNegotiable: true,
      currency: "GHS",
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
      ],
      area: "Bolgatanga / Tamale",
      deliveryOptions: ["PICKUP", "LOCAL_DELIVERY", "SHIPPING"],
      sellerType: SellerType.GUEST,
      guestName: "Zenabu Salifu",
      guestPhone: "+233247778899",
      guestWhatsApp: "+233247778899",
      isGuestVerified: true,
      status: ProductListingStatus.ACTIVE,
      isFeatured: true,
    },
  ];

  for (const item of mockItems) {
    await prisma.productListing.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        condition: item.condition,
        price: item.price,
        originalPrice: item.originalPrice,
        isNegotiable: item.isNegotiable,
        currency: item.currency,
        images: item.images,
        area: item.area,
        deliveryOptions: item.deliveryOptions,
        sellerType: item.sellerType,
        sellerId: item.sellerId || null,
        guestName: item.guestName || null,
        guestPhone: item.guestPhone || null,
        guestWhatsApp: item.guestWhatsApp || null,
        isGuestVerified: item.isGuestVerified || false,
        status: item.status,
        isFeatured: item.isFeatured,
      },
      create: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        condition: item.condition,
        price: item.price,
        originalPrice: item.originalPrice,
        isNegotiable: item.isNegotiable,
        currency: item.currency,
        images: item.images,
        area: item.area,
        deliveryOptions: item.deliveryOptions,
        sellerType: item.sellerType,
        sellerId: item.sellerId || null,
        guestName: item.guestName || null,
        guestPhone: item.guestPhone || null,
        guestWhatsApp: item.guestWhatsApp || null,
        isGuestVerified: item.isGuestVerified || false,
        status: item.status,
        isFeatured: item.isFeatured,
      },
    });
    console.log(` ✅ Seeded classified listing: "${item.category}" -> ${item.title}`);
  }

  console.log("🎉 Successfully seeded Category Taxonomy & Classified Listings!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
