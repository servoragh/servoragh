import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Universal 18-Category Taxonomy into PostgreSQL...");

  const categories = [
    {
      name: "Food & Dining",
      slug: "food-dining",
      description: "Restaurants, food vendors, caterers, bakeries, food delivery, and agricultural produce.",
      icon: "Utensils",
      capabilities: JSON.stringify(["PRODUCTS", "ORDERS", "DELIVERY", "BOOKINGS"]),
      verificationRequirement: "NONE",
      disclaimerText: "Food vendors must comply with national food safety and hygiene guidelines.",
      displayOrder: 1,
      subcategories: [
        { name: "Restaurants & Fast Food", slug: "restaurants-fast-food", description: "Dine-in and takeout restaurants" },
        { name: "Local Food Vendors & Chop Bars", slug: "local-food-vendors", description: "Traditional Ghanaian local cuisine" },
        { name: "Catering Services", slug: "catering-services", description: "Event and bulk food catering" },
        { name: "Bakeries & Confectionery", slug: "bakeries", description: "Cakes, bread, and pastries" },
        { name: "Groceries & Fresh Meat/Fish", slug: "groceries-meat-fish", description: "Fresh farm produce, butchery, and market groceries" },
      ],
    },
    {
      name: "Retail & Shopping",
      slug: "retail-shopping",
      description: "Clothing, electronics, home appliances, building materials, and general stores.",
      icon: "ShoppingBag",
      capabilities: JSON.stringify(["PRODUCTS", "ORDERS", "DELIVERY"]),
      verificationRequirement: "NONE",
      displayOrder: 2,
      subcategories: [
        { name: "Clothing & Apparel", slug: "clothing-apparel", description: "Men's, women's, and children's wear" },
        { name: "Electronics & Smartphones", slug: "electronics-smartphones", description: "Phones, computers, and household gadgets" },
        { name: "Furniture & Home Appliances", slug: "furniture-appliances", description: "Living room, office, and kitchen furniture" },
        { name: "Building Materials & Hardware", slug: "building-hardware", description: "Cement, roofing, plumbing, and electrical hardware" },
        { name: "Cosmetics & Beauty Products", slug: "cosmetics-beauty-products", description: "Skincare, perfume, and hair products" },
      ],
    },
    {
      name: "Professional Services",
      slug: "professional-services",
      description: "Accountants, lawyers, architects, IT consultants, photographers, and agencies.",
      icon: "Briefcase",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "APPOINTMENTS", "CONSULTATION"]),
      verificationRequirement: "PROFESSIONAL_LICENSE",
      disclaimerText: "Service providers must hold valid professional certifications where required by law.",
      displayOrder: 3,
      subcategories: [
        { name: "Architects & Engineering Consultants", slug: "architects-engineers", description: "Building designs, structural plans, and surveying" },
        { name: "Software Developers & IT Support", slug: "software-it-support", description: "Web development, app development, and network support" },
        { name: "Photographers & Media Production", slug: "photographers-media", description: "Event photography, portraits, and video editing" },
        { name: "Marketing & Graphic Design", slug: "marketing-graphic-design", description: "Branding, logos, and digital marketing" },
      ],
    },
    {
      name: "Home & Property",
      slug: "home-property",
      description: "Real estate sales, house rentals, plumbers, electricians, carpenters, and cleaners.",
      icon: "Home",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "RENTALS", "BOOKINGS", "APPOINTMENTS"]),
      verificationRequirement: "ID_VERIFIED",
      displayOrder: 4,
      subcategories: [
        { name: "Real Estate Sales & Rentals", slug: "real-estate-rentals", description: "Houses, apartments, and commercial space" },
        { name: "Plumbing & Drainage", slug: "plumbing-services", description: "Pipe repair, borehole installation, and septic tanks" },
        { name: "Electrical Wiring & Solar Installation", slug: "electrical-solar-services", description: "House wiring, solar panels, and inverter setups" },
        { name: "Carpentry & Furniture Works", slug: "carpentry-woodwork", description: "Custom furniture, roofing trusses, and doors" },
        { name: "Cleaning & Pest Control", slug: "cleaning-pest-control", description: "Residential cleaning, fumigation, and office maintenance" },
      ],
    },
    {
      name: "Automotive & Transport",
      slug: "automotive-transport",
      description: "Mechanics, car washes, spare parts, vehicle rentals, towing, and freight delivery.",
      icon: "Truck",
      capabilities: JSON.stringify(["SERVICES", "DELIVERY", "RENTALS", "QUOTES"]),
      verificationRequirement: "VEHICLE_VERIFIED",
      displayOrder: 5,
      subcategories: [
        { name: "Auto Mechanics & Electricians", slug: "auto-mechanics", description: "Engine diagnostics, repairs, and auto wiring" },
        { name: "Vehicle Rentals & Car Hire", slug: "vehicle-rentals", description: "Sedans, SUVs, trucks, and tricycle rentals" },
        { name: "Auto Spare Parts & Tires", slug: "spare-parts-tires", description: "Engine parts, batteries, and tire sales" },
        { name: "Freight, Logistics & Moving", slug: "freight-logistics-moving", description: "Inter-city cargo delivery, haulage, and house moving" },
      ],
    },
    {
      name: "Health & Wellness",
      slug: "health-wellness",
      description: "Clinics, pharmacies, diagnostic labs, fitness centers, and wellness providers.",
      icon: "HeartPulse",
      capabilities: JSON.stringify(["SERVICES", "APPOINTMENTS", "CONSULTATION"]),
      verificationRequirement: "PROFESSIONAL_LICENSE",
      disclaimerText: "IMPORTANT DISCLAIMER: Servora is an appointment discovery platform. Servora does not provide medical advice or guarantee medical outcomes. Always consult a licensed healthcare practitioner for emergency care.",
      displayOrder: 6,
      subcategories: [
        { name: "Licensed Clinics & Diagnostic Labs", slug: "clinics-diagnostic-labs", description: "Health checkups, blood tests, and medical consultations" },
        { name: "Pharmacies & Medical Supplies", slug: "pharmacies-medical-supplies", description: "Over-the-counter medication and medical equipment" },
        { name: "Fitness Centers & Gyms", slug: "fitness-gyms", description: "Gym memberships, personal trainers, and aerobics" },
      ],
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Barbers, hair salons, makeup artists, nail technicians, and spa treatments.",
      icon: "Scissors",
      capabilities: JSON.stringify(["SERVICES", "APPOINTMENTS", "BOOKINGS"]),
      verificationRequirement: "NONE",
      displayOrder: 7,
      subcategories: [
        { name: "Barbershops & Grooming", slug: "barbershops", description: "Men's haircuts, beard trims, and styling" },
        { name: "Hair Salons & Braiding", slug: "hair-salons-braiding", description: "Hair washing, wigs, weaving, and braiding" },
        { name: "Makeup Artists & Nail Technicians", slug: "makeup-nail-care", description: "Bridal makeup, manicure, and pedicure" },
      ],
    },
    {
      name: "Education & Training",
      slug: "education",
      description: "Schools, private tutors, vocational training centers, and skill courses.",
      icon: "GraduationCap",
      capabilities: JSON.stringify(["SERVICES", "APPOINTMENTS", "COURSES", "CONSULTATION"]),
      verificationRequirement: "ID_VERIFIED",
      displayOrder: 8,
      subcategories: [
        { name: "Private Tutors & Exam Prep", slug: "private-tutors-prep", description: "WASSCE, BECE, University, and STEM tutors" },
        { name: "Computer & Technical Training", slug: "computer-vocational-training", description: "Coding Bootcamps, graphic design, and ICT skills" },
      ],
    },
    {
      name: "Agriculture & Produce",
      slug: "agriculture",
      description: "Farmers, livestock, grain sellers, fertilizer, seeds, and farm equipment rental.",
      icon: "Wheat",
      capabilities: JSON.stringify(["PRODUCTS", "ORDERS", "RENTALS", "DELIVERY", "QUOTES"]),
      verificationRequirement: "NONE",
      displayOrder: 9,
      subcategories: [
        { name: "Farm Produce & Grains Bulk", slug: "farm-produce-grains", description: "Rice, maize, yam, shea butter, and soy beans" },
        { name: "Livestock & Poultry", slug: "livestock-poultry", description: "Cattle, goats, sheep, and poultry farming" },
        { name: "Tractor & Farm Equipment Rentals", slug: "tractor-farm-rentals", description: "Tractor plowing, harvesters, and irrigation pumps" },
      ],
    },
    {
      name: "Construction & Heavy Duty",
      slug: "construction",
      description: "Building contractors, masonry, excavators, surveyors, and heavy machinery.",
      icon: "HardHat",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "RENTALS", "APPOINTMENTS"]),
      verificationRequirement: "BUSINESS_LICENSE",
      displayOrder: 10,
      subcategories: [
        { name: "General Building Contractors", slug: "building-contractors", description: "Residential and commercial building construction" },
        { name: "Heavy Machinery Rentals", slug: "heavy-machinery-rentals", description: "Excavators, concrete mixers, and scaffolding" },
      ],
    },
    {
      name: "Travel & Hospitality",
      slug: "travel-hospitality",
      description: "Hotels, guest houses, tour operators, car hire, and short-term apartments.",
      icon: "Hotel",
      capabilities: JSON.stringify(["BOOKINGS", "RENTALS", "APPOINTMENTS"]),
      verificationRequirement: "BUSINESS_LICENSE",
      displayOrder: 11,
      subcategories: [
        { name: "Hotels & Guest Houses", slug: "hotels-guest-houses", description: "Hotel rooms, suites, and lodge reservations" },
        { name: "Short-Stay Apartments", slug: "short-stay-apartments", description: "Furnished apartments for short visits" },
        { name: "Tour Operators & Guides", slug: "tour-operators-guides", description: "Mole National Park tours, cultural heritage visits" },
      ],
    },
    {
      name: "Events & Entertainment",
      slug: "events-entertainment",
      description: "Event planners, DJs, live musicians, venue rentals, and event decor.",
      icon: "Sparkles",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "RENTALS", "BOOKINGS"]),
      verificationRequirement: "NONE",
      displayOrder: 12,
      subcategories: [
        { name: "Event Planners & Decorators", slug: "event-planners-decorators", description: "Wedding, funeral, and corporate event management" },
        { name: "DJs, Sound Systems & MCs", slug: "djs-sound-mcs", description: "Public address sound systems, DJs, and event hosts" },
      ],
    },
    {
      name: "Fashion & Custom Tailoring",
      slug: "fashion",
      description: "African wear designers, smock/fugu weavers, custom tailors, and jewelry.",
      icon: "Tag",
      capabilities: JSON.stringify(["PRODUCTS", "SERVICES", "QUOTES", "ORDERS"]),
      verificationRequirement: "NONE",
      displayOrder: 13,
      subcategories: [
        { name: "Traditional Fugu & Smock Weavers", slug: "traditional-fugu-smocks", description: "Authentic Northern Ghanaian hand-woven smocks" },
        { name: "Custom Tailors & Fashion Designers", slug: "custom-tailors-designers", description: "Custom suits, dresses, and alterations" },
      ],
    },
    {
      name: "Technology & Digital Services",
      slug: "technology",
      description: "Computer repair, phone fixing, web design, cybersecurity, and digital marketing.",
      icon: "Monitor",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "PRODUCTS"]),
      verificationRequirement: "NONE",
      displayOrder: 14,
      subcategories: [
        { name: "Smartphone & Laptop Repairs", slug: "phone-laptop-repairs", description: "Screen replacements, motherboard fixing, and flashing" },
        { name: "Web & Mobile App Development", slug: "web-app-development", description: "Custom websites, e-commerce, and software solutions" },
      ],
    },
    {
      name: "Legal & Government Advisory",
      slug: "legal-government",
      description: "Legal consultants, notaries, document processing, and business incorporation.",
      icon: "Scale",
      capabilities: JSON.stringify(["SERVICES", "CONSULTATION", "QUOTES"]),
      verificationRequirement: "PROFESSIONAL_LICENSE",
      disclaimerText: "DISCLAIMER: Servora provides listing discovery. Servora is not a government agency or law firm.",
      displayOrder: 15,
      subcategories: [
        { name: "Lawyers & Legal Consultants", slug: "lawyers-legal-consultants", description: "Land litigation, contracts, and business legal advice" },
        { name: "Business Registration Advisory", slug: "business-registration-advisory", description: "RGD business setup, GRA tax compliance support" },
      ],
    },
    {
      name: "Finance & Accounting",
      slug: "finance-business",
      description: "Bookkeeping, auditing, tax filing, insurance agencies, and financial advice.",
      icon: "DollarSign",
      capabilities: JSON.stringify(["SERVICES", "CONSULTATION", "QUOTES"]),
      verificationRequirement: "PROFESSIONAL_LICENSE",
      displayOrder: 16,
      subcategories: [
        { name: "Accounting & Tax Filing Services", slug: "accounting-tax-services", description: "Bookkeeping, financial statements, and GRA tax filing" },
      ],
    },
    {
      name: "Jobs & Freelance Gigs",
      slug: "jobs-freelance",
      description: "Full-time jobs, temporary labor, freelance contracts, and local gig work.",
      icon: "Users",
      capabilities: JSON.stringify(["SERVICES", "QUOTES", "APPOINTMENTS"]),
      verificationRequirement: "NONE",
      displayOrder: 17,
      subcategories: [
        { name: "Skilled Artisan Labor & Gigs", slug: "artisan-gigs", description: "Day labor, masonry hands, and site assistance" },
      ],
    },
    {
      name: "Community & NGOs",
      slug: "community-organizations",
      description: "Non-profits, community clubs, religious institutions, and local associations.",
      icon: "ShieldAlert",
      capabilities: JSON.stringify(["EVENTS", "COMMUNITY"]),
      verificationRequirement: "NONE",
      displayOrder: 18,
      subcategories: [
        { name: "Community Associations & NGOs", slug: "community-ngos", description: "Local development associations, charities, and clubs" },
      ],
    },
  ];

  for (const catData of categories) {
    const { subcategories, ...catInfo } = catData;

    const category = await prisma.category.upsert({
      where: { slug: catInfo.slug },
      update: { ...catInfo },
      create: { ...catInfo },
    });

    console.log(`✓ Category: ${category.name} (${category.slug})`);

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: { ...sub, categoryId: category.id },
        create: { ...sub, categoryId: category.id },
      });
      console.log(`   └ Subcategory: ${sub.name}`);
    }
  }

  console.log("🎉 Successfully seeded 18 Universal Industry Categories & Subcategories into PostgreSQL!");
}

main()
  .catch((e) => {
    console.error("Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
