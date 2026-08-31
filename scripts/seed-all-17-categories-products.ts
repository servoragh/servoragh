import { PrismaClient, ProductListingStatus, ItemCondition, SellerType } from "@prisma/client";
import { CLASSIFIED_CATEGORIES } from "../src/lib/categoriesData";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding for ALL 17 Marketplace Categories...");

  // Fetch Business Profiles
  const savannahBiz = await prisma.businessProfile.findFirst({
    where: { slug: "savannah-fresh-farms" },
  });

  const kwameBiz = await prisma.businessProfile.findFirst({
    where: { slug: "kwame-electrical-tamale" },
  });

  if (!savannahBiz || !kwameBiz) {
    console.error("❌ Required business profiles not found.");
    return;
  }

  console.log(`✅ Savannah Business ID: ${savannahBiz.id} (${savannahBiz.userId})`);
  console.log(`✅ Kwame Business ID: ${kwameBiz.id} (${kwameBiz.userId})`);

  // Prepare full database items for all 17 categories
  const productsToSeed = [
    // 1. Vehicles
    {
      title: "Toyota Hilux Double Cabin 4x4 (2021 Model - Clean Engine)",
      category: "Vehicles",
      subCategory: "Cars",
      price: 245000,
      originalPrice: 270000,
      description: "2021 Toyota Hilux 4x4 pickup truck in excellent condition. Automatic transmission, clean leather interior, cold AC, and low mileage. Registered in Tamale.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Royal 150cc Heavy Duty Cargo Motorbike (Brand New)",
      category: "Vehicles",
      subCategory: "Motorbikes & Scooters",
      price: 14500,
      originalPrice: 16000,
      description: "Brand new Royal 150cc motorcycle equipped with rear cargo box. Highly durable for dispatch and local transport across Northern Ghana.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 2. Property
    {
      title: "Modern 4-Bedroom Gated Villa for Sale in Kalpohin Estate",
      category: "Property",
      subCategory: "Houses & Apartments for Sale",
      price: 580000,
      originalPrice: 620000,
      description: "Spacious 4-bedroom self-contained house built on 100x100ft plot in prime Kalpohin Estate, Tamale. Fitted kitchen, paved compound, standby solar power.",
      area: "Kalpohin",
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Commercial Acre Plot for Sale near Tamale Airport Highway",
      category: "Property",
      subCategory: "Land & Plots for Sale",
      price: 120000,
      originalPrice: 135000,
      description: "Demarcated commercial plot with valid land commission documentation. Located along the main Tamale Airport highway, perfect for warehouses or gas stations.",
      area: "Nyohini",
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 3. Phones & Tablets
    {
      title: "Samsung Galaxy S23 Ultra 5G (256GB - Phantom Black)",
      category: "Phones & Tablets",
      subCategory: "Mobile Phones",
      price: 9200,
      originalPrice: 10500,
      description: "Original Samsung Galaxy S23 Ultra with 200MP camera, built-in S-Pen, 12GB RAM, 256GB storage. Factory unlocked with full box accessories.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Apple iPad Pro 11-inch M2 (WiFi + Cellular, 128GB)",
      category: "Phones & Tablets",
      subCategory: "Tablets",
      price: 8800,
      originalPrice: 9600,
      description: "Apple iPad Pro 11-inch powered by M2 chip. Supports Apple Pencil 2 and Magic Keyboard. Pristine condition with 100% battery health.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 4. Electronics
    {
      title: "Apple MacBook Pro 16-inch M2 Max (32GB RAM, 1TB SSD)",
      category: "Electronics",
      subCategory: "Laptops & Computers",
      price: 26500,
      originalPrice: 29000,
      description: "High performance workstation for video editing and software engineering. Liquid Retina XDR display, M2 Max 38-core GPU, Space Gray.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "5KVA 48V Commercial Hybrid Solar Power Inverter System",
      category: "Electronics",
      subCategory: "Solar Power & Inverters",
      price: 18500,
      originalPrice: 21000,
      description: "Complete hybrid solar inverter system bundle with MPPT charger, 4x 200Ah Gel batteries, and surge protection panel. Ideal for homes and shops.",
      area: "Tamale Industrial Area",
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 5. Home, Furniture & Appliances
    {
      title: "LG 450L Frost-Free Double Door Refrigerator (Smart Inverter)",
      category: "Home, Furniture & Appliances",
      subCategory: "Home Appliances",
      price: 6800,
      originalPrice: 7500,
      description: "Energy efficient LG double door fridge freezer. Features linear cooling, door cooling+, and smart inverter compressor with 10-year warranty.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80"
      ],
      biz: savannahBiz,
    },
    {
      title: "Executive L-Shaped Royal Velvet Sofa Set with Center Table",
      category: "Home, Furniture & Appliances",
      subCategory: "Furniture",
      price: 7400,
      originalPrice: 8500,
      description: "Luxurious 7-seater sectional sofa handcrafted with high-density foam and stain-resistant emerald green velvet. Includes matching marble top table.",
      area: "Aboabo",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 6. Fashion
    {
      title: "Authentic Royal Dagbon Handwoven Heavy Cotton Fugu Smock",
      category: "Fashion",
      subCategory: "Traditional Fugu & Northern Wear",
      price: 1250,
      originalPrice: 1400,
      description: "100% handwoven Northern Ghana Fugu smock crafted with heavy traditional cotton thread. Tailored for chieftaincy ceremonies, weddings, and special events.",
      area: "Nyohini",
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80"
      ],
      biz: savannahBiz,
    },
    {
      title: "Bespoke Senator Kaftan Suit Set (Premium Italian Wool)",
      category: "Fashion",
      subCategory: "Clothing",
      price: 850,
      originalPrice: 980,
      description: "Tailored 2-piece executive Senator kaftan suit with embroidery accents. High grade cashmere wool fabric available in navy blue, white, and black.",
      area: "Aboabo",
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 7. Beauty & Personal Care
    {
      title: "100% Raw Unrefined Organic Northern Shea Butter (25kg Bucket)",
      category: "Beauty & Personal Care",
      subCategory: "Organic Shea Butter & Cosmetics",
      price: 450,
      originalPrice: 520,
      description: "Grade-A pure unrefined shea butter sourced directly from women cooperatives in Northern Ghana. Rich in Vitamin A & E for skin hydration and haircare.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1608248597379-e07443236417?w=800&q=80"
      ],
      biz: savannahBiz,
    },
    {
      title: "Professional Salon Standing Hair Dryer & Steamer Station",
      category: "Beauty & Personal Care",
      subCategory: "Barbing & Salon Equipment",
      price: 2400,
      originalPrice: 2800,
      description: "Heavy duty salon hood dryer with adjustable temperature, timer, and rolling stand. Essential equipment for beauty parlors and hairdressers.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 8. Services
    {
      title: "Master Electrical Wiring & Solar Installation Services",
      category: "Services",
      subCategory: "Electrical & Solar Installation",
      price: 500,
      originalPrice: 650,
      description: "Certified electrical contractor service for residential building wiring, circuit breaker maintenance, and off-grid solar system setup across Tamale.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Deep Well Borehole Drilling & Submersible Pump Service",
      category: "Services",
      subCategory: "Plumbing & Borehole Drilling",
      price: 8500,
      originalPrice: 9500,
      description: "Geological survey, high pressure borehole drilling, casing installation, and installation of Grundfos solar/electric water pumps for commercial farms and estates.",
      area: "Tamale Industrial Area",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 9. Repair & Construction
    {
      title: "Commercial Grade Portland Cement (50kg Bag - Elephant Brand)",
      category: "Repair & Construction",
      subCategory: "Building Materials & Cement",
      price: 105,
      originalPrice: 115,
      description: "Grade 42.5N high strength Portland cement. Superior setting power for block manufacturing, columns, and heavy concrete structures.",
      area: "Tamale Industrial Area",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Heavy Gauge Galvanized Roofing Sheets (Pack of 20 Sheets)",
      category: "Repair & Construction",
      subCategory: "Roofing Sheets & Trusses",
      price: 1850,
      originalPrice: 2000,
      description: "Rust resistant 0.45mm thick corrugated roofing sheets. Ideal for residential houses, school buildings, and warehouse roofing.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 10. Commercial Equipment & Tools
    {
      title: "DeWalt 20V Max Brushless Cordless Rotary Hammer Drill Set",
      category: "Commercial Equipment & Tools",
      subCategory: "Tool Rentals & Power Tools",
      price: 1850,
      originalPrice: 2100,
      description: "Heavy duty cordless rotary hammer drill with 2x 5Ah lithium batteries, fast charger, SDS bit set, and hard case. High impact power for concrete drilling.",
      area: "Choggu",
      images: [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "15HP Diesel Powered Corn & Grain Grinding Mill Machine",
      category: "Commercial Equipment & Tools",
      subCategory: "Agro-Processing Machines & Mills",
      price: 14500,
      originalPrice: 16200,
      description: "Industrial grade grain milling machine powered by 15HP Changfa diesel engine. High hourly capacity for maize, millet, and sorghum grinding.",
      area: "Aboabo",
      images: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 11. Leisure & Activities
    {
      title: "Yamaha FG800 Solid Top Acoustic Guitar (Natural Finish)",
      category: "Leisure & Activities",
      subCategory: "Musical Instruments",
      price: 2100,
      originalPrice: 2400,
      description: "Solid Sitka spruce top acoustic guitar with nato back and sides. Rich resonant sound, perfect for church musicians and acoustic performers.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80"
      ],
      biz: kwameBiz,
    },
    {
      title: "Pro Match Size-5 Leather Football & Agility Training Set",
      category: "Leisure & Activities",
      subCategory: "Sports Gear & Fitness",
      price: 450,
      originalPrice: 520,
      description: "Official match weight synthetic leather soccer ball complete with training cones, agility ladder, and hand pump.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 12. Babies & Kids
    {
      title: "Ergonomic 3-in-1 Foldable Baby Stroller & Car Seat Combo",
      category: "Babies & Kids",
      subCategory: "Baby Gear & Strollers",
      price: 2600,
      originalPrice: 2950,
      description: "Lightweight aluminum frame baby stroller with detachable infant car seat, canopy shade, and storage basket. Smooth suspension wheels.",
      area: "Central Market",
      images: [
        "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 13. Food, Agriculture & Farming
    {
      title: "High-Discharge Solar Water Pump Set (5HP - High Head Irrigation)",
      category: "Food, Agriculture & Farming",
      subCategory: "Irrigation Systems & Pumps",
      price: 12500,
      originalPrice: 14000,
      description: "Solar powered water pumping system for dry season vegetable farming. 5HP stainless steel submersible pump, solar MPPT controller, and float switch.",
      area: "Tamale Central",
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80"
      ],
      biz: savannahBiz,
    },
    {
      title: "Premium White Northern Yam Tubers (Batch of 100 Large Tubers)",
      category: "Food, Agriculture & Farming",
      subCategory: "Tubers, Yam & Vegetables",
      price: 1800,
      originalPrice: 2100,
      description: "Freshly harvested Pona yams straight from Aboabo market farms. Sweet texture, long shelf life, ideal for wholesale caterers and households.",
      area: "Aboabo",
      images: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 14. Animals & Pets
    {
      title: "Healthy Northern Sahelian Breeding Bull (3-Year-Old Male)",
      category: "Animals & Pets",
      subCategory: "Cattle, Sheep & Goats",
      price: 7800,
      originalPrice: 8500,
      description: "Well fed white Sahelian bull raised on organic pasture in Savelugu. Full veterinary vaccination records, ideal for breeding or festival slaughter.",
      area: "Gumani",
      images: [
        "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80"
      ],
      biz: savannahBiz,
    },

    // 15. Jobs
    {
      title: "Senior Electrical & Solar Systems Engineer (Full-Time Vacancy)",
      category: "Jobs",
      subCategory: "Artisan & Trade Vacancies",
      price: 3500,
      originalPrice: null,
      description: "Urgent opening for a qualified solar technician and electrical engineer in Sakasaka, Tamale. Competitive salary, commission, and company transport.",
      area: "Sakasaka",
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 16. Seeking Work - CVs
    {
      title: "Certified Solar PV Installer & Master Electrician CV Profile",
      category: "Seeking Work - CVs",
      subCategory: "Artisan & Technical CVs",
      price: 0,
      originalPrice: null,
      description: "NABPTEX certified electrician with 6+ years experience in inverter sizing, solar array wiring, and three-phase building installation seeking job opportunities.",
      area: "Choggu",
      images: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
      ],
      biz: kwameBiz,
    },

    // 17. Business & Industry
    {
      title: "Wholesale Agrochemical & Organic Fertilizer Distribution Partnership",
      category: "Business & Industry",
      subCategory: "Wholesale & Bulk Goods",
      price: 45000,
      originalPrice: 50000,
      description: "Bulk agrochemical agency franchise opportunity for Northern Region. Includes initial stock of NPK fertilizer, weedicides, and pest control sprays.",
      area: "Tamale Industrial Area",
      images: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
      ],
      biz: savannahBiz,
    },
  ];

  console.log(`📦 Seeding ${productsToSeed.length} database products across ALL 17 categories...`);

  let count = 0;
  for (const item of productsToSeed) {
    const slug = `${item.title.toLowerCase().trim().replace(/[^a-z0-9]/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

    await prisma.productListing.upsert({
      where: { slug },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        originalPrice: item.originalPrice,
        area: item.area,
        images: item.images,
        status: ProductListingStatus.ACTIVE,
        sellerType: SellerType.REGISTERED_USER,
        sellerId: item.biz.userId,
        businessId: item.biz.id,
      },
      create: {
        title: item.title,
        slug,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        originalPrice: item.originalPrice,
        area: item.area,
        images: item.images,
        status: ProductListingStatus.ACTIVE,
        condition: ItemCondition.USED_GOOD,
        sellerType: SellerType.REGISTERED_USER,
        sellerId: item.biz.userId,
        businessId: item.biz.id,
      },
    });

    count++;
    console.log(`  [${count}/${productsToSeed.length}] ✅ Seeded "${item.title}" under [${item.category} › ${item.subCategory}] for ${item.biz.businessName}`);
  }

  console.log("🎉 Successfully seeded products for ALL 17 categories in PostgreSQL database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
