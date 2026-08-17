import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenizeText, calculateRelevanceScore } from "@/lib/searchEngine";

// Static Default Catalog for Serverless Environments (Vercel) when DB is empty
const MOCK_PRODUCTS = [
  {
    id: "prod-fugu-1",
    title: "Hand-Woven Heavy Northern Ghana Fugu Smock",
    slug: "hand-woven-northern-fugu-smock",
    description: "Authentic hand-woven traditional Fugu from Aboabo Market. Premium thread, custom embroidery.",
    price: 450.0,
    category: "Fashion & Fugu",
    provider: { businessName: "Northern Grace Fugu & Tailoring Hub", serviceArea: "Aboabo, Tamale Central, Bolgatanga" },
  },
  {
    id: "prod-elec-1",
    title: "Original 1.5mm Pure Copper Wiring Cable (100m Roll)",
    slug: "copper-wiring-cable-100m",
    description: "High quality copper cable for household wiring and socket installations. High heat resistance.",
    price: 350.0,
    category: "Electrical Supplies",
    provider: { businessName: "Kwame Electrical & AC Experts", serviceArea: "Sakasaka, Tamale Central, Nyohini" },
  },
  {
    id: "prod-solar-1",
    title: "Solar Rechargeable LED Emergency Bulb (30W)",
    slug: "solar-led-emergency-bulb-30w",
    description: "Bright solar rechargeable bulb for homes & shops during power outages. Long battery life.",
    price: 45.0,
    category: "Electrical Supplies",
    provider: { businessName: "Kwame Electrical & AC Experts", serviceArea: "Sakasaka, Tamale Central, Nyohini" },
  },
  {
    id: "prod-phone-1",
    title: "Original Samsung Galaxy A54 AMOLED Screen Replacement",
    slug: "samsung-a54-amoled-screen",
    description: "Genuine OEM AMOLED replacement display with glass touch digitizer. Sakasaka phone hub.",
    price: 280.0,
    category: "Electronics",
    provider: { businessName: "Fuseini Mobile Phone & Laptop Hospital", serviceArea: "Sakasaka, Aboabo, Central Market" },
  },
  {
    id: "prod-charger-1",
    title: "Fast Charging 67W Type-C Adapter & Cable",
    slug: "fast-charging-67w-typec",
    description: "Ultra-fast charger compatible with Xiaomi, Tecno, Infinix, Samsung. Over-voltage protection.",
    price: 65.0,
    category: "Electronics",
    provider: { businessName: "Fuseini Mobile Phone & Laptop Hospital", serviceArea: "Sakasaka, Aboabo, Central Market" },
  },
  {
    id: "prod-gen-1",
    title: "Heavy Duty 15kVA Soundproof Generator Rental (Daily)",
    slug: "15kva-generator-rental",
    description: "Heavy duty soundproof diesel generator rental for site projects, events, and emergency backup power across Northern Ghana.",
    price: 600.0,
    category: "Tools & Equipment",
    provider: { businessName: "Northern Heavy Tool & Generator Rentals", serviceArea: "Tamale, Bolgatanga, Wa, Yendi" },
  },
];

const MOCK_SERVICES = [
  {
    id: "serv-elec",
    name: "Electrician & Wiring",
    slug: "electricians",
    description: "Fault detection, house wiring, breaker repair, ceiling fan installation.",
    category: { name: "Electrical & Home Maintenance" },
  },
  {
    id: "serv-fugu",
    name: "Fugu & Traditional Smock Weaving",
    slug: "fugu-tailors",
    description: "Authentic handmade Northern Ghanaian Fugu, smock embroidery, custom sizing.",
    category: { name: "Tailoring & Fashion Design" },
  },
  {
    id: "serv-phone",
    name: "Phone & Tablet Repair",
    slug: "phone-repair",
    description: "Screen replacements, battery changes, charging port repair, software flashing.",
    category: { name: "Electronics & Device Repair" },
  },
  {
    id: "serv-ac",
    name: "AC & Fridge Servicing",
    slug: "ac-fridge-repair",
    description: "Air conditioner gas refill, cooling repairs, refrigerator compressor fixing.",
    category: { name: "Electrical & Home Maintenance" },
  },
  {
    id: "serv-plumb",
    name: "Plumbing & Drainage",
    slug: "plumbers",
    description: "Water pipe leaks, borehole pump installation, bathroom fixtures.",
    category: { name: "Electrical & Home Maintenance" },
  },
  {
    id: "serv-tool",
    name: "Heavy Equipment & Generator Rentals",
    slug: "equipment-rentals",
    description: "Soundproof generators, concrete mixers, scaffoldings, power tools for hire.",
    category: { name: "Tools & Equipment" },
  },
];

const MOCK_PROVIDERS = [
  {
    id: "prov-fugu",
    businessName: "Northern Grace Fugu & Tailoring Hub",
    slug: "northern-grace-fugu-tamale",
    bio: "Authentic hand-woven Northern Ghana Fugu (Smocks), embroidery, bespoke Senator kaftans, and bridal attire. Located at Aboabo Market.",
    serviceArea: "Aboabo, Tamale Central, Choggu, Bolgatanga, Wa",
    ratingAverage: 5.0,
    services: [{ service: { name: "Fugu & Traditional Smock Weaving" } }],
  },
  {
    id: "prov-kwame",
    businessName: "Kwame Electrical & AC Experts",
    slug: "kwame-electrical-tamale",
    bio: "Certified electrical engineer with over 8 years experience in Tamale. Specialist in household wiring, AC gas refilling, breaker troubleshooting.",
    serviceArea: "Sakasaka, Tamale Central, Nyohini, Choggu",
    ratingAverage: 4.9,
    services: [{ service: { name: "Electrician & Wiring" } }, { service: { name: "AC & Fridge Servicing" } }],
  },
  {
    id: "prov-fuseini",
    businessName: "Fuseini Mobile Phone & Laptop Hospital",
    slug: "fuseini-phone-repair-sakasaka",
    bio: "Sakasaka phone hub master technician. Original screen replacement for iPhone, Samsung, Tecno, Infinix. Battery upgrades, charging port repair.",
    serviceArea: "Sakasaka, Aboabo, Central Market",
    ratingAverage: 4.8,
    services: [{ service: { name: "Phone & Tablet Repair" } }],
  },
  {
    id: "prov-rental",
    businessName: "Northern Heavy Tool & Generator Rentals",
    slug: "northern-heavy-tool-rentals",
    bio: "Heavy machinery, 15kVA diesel generators, scaffoldings, concrete mixers, and industrial power tools for daily/weekly hire across Northern Ghana.",
    serviceArea: "Tamale, Bolgatanga, Wa, Yendi, Damongo",
    ratingAverage: 4.9,
    services: [{ service: { name: "Heavy Equipment & Generator Rentals" } }],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();
    const scope = searchParams.get("scope") || "all"; // all, products, services, providers
    const category = searchParams.get("category");
    const area = searchParams.get("area");

    const queryTokens = tokenizeText(query);

    const results: {
      products: any[];
      services: any[];
      providers: any[];
    } = {
      products: [],
      services: [],
      providers: [],
    };

    // Attempt to fetch from Database
    let dbProducts: any[] = [];
    let dbServices: any[] = [];
    let dbProviders: any[] = [];

    try {
      dbProducts = await prisma.product.findMany({
        where: { isAvailable: true },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              serviceArea: true,
              verificationStatus: true,
              ratingAverage: true,
            },
          },
        },
      });

      dbServices = await prisma.service.findMany({
        include: { category: true },
      });

      dbProviders = await prisma.providerProfile.findMany({
        include: {
          services: { include: { service: true } },
          products: { take: 3 },
        },
      });
    } catch (e) {
      console.warn("DB Query fallback to Mock Catalog:", e);
    }

    // Use DB data if populated, otherwise use Mock Catalog
    const productPool = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;
    const servicePool = dbServices.length > 0 ? dbServices : MOCK_SERVICES;
    const providerPool = dbProviders.length > 0 ? dbProviders : MOCK_PROVIDERS;

    // -----------------------------------------------------------------
    // 1. Search Products
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "products") {
      let filtered = productPool.map((prod) => {
        const score = calculateRelevanceScore(
          {
            titleOrName: prod.title,
            category: prod.category,
            descriptionOrBio: prod.description,
            locationOrArea: prod.provider?.serviceArea || "",
          },
          queryTokens
        );
        return { ...prod, _score: score };
      });

      if (category && category !== "all") {
        filtered = filtered.filter((p) =>
          p.category?.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (area && area !== "all") {
        filtered = filtered.filter((p) =>
          p.provider?.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
      }

      results.products = filtered.slice(0, 15);
    }

    // -----------------------------------------------------------------
    // 2. Search Services
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "services") {
      let filtered = servicePool.map((serv) => {
        const score = calculateRelevanceScore(
          {
            titleOrName: serv.name,
            category: serv.category?.name || "",
            descriptionOrBio: serv.description,
          },
          queryTokens
        );
        return { ...serv, _score: score };
      });

      if (category && category !== "all") {
        filtered = filtered.filter((s) =>
          s.category?.name?.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((s) => s._score > 0).sort((a, b) => b._score - a._score);
      }

      results.services = filtered.slice(0, 15);
    }

    // -----------------------------------------------------------------
    // 3. Search Providers
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "providers") {
      let filtered = providerPool.map((prov) => {
        const serviceNames = prov.services ? prov.services.map((s: any) => s.service?.name).join(" ") : "";
        const score = calculateRelevanceScore(
          {
            titleOrName: prov.businessName,
            category: serviceNames,
            descriptionOrBio: prov.bio || "",
            locationOrArea: prov.serviceArea || "",
          },
          queryTokens
        );
        return { ...prov, _score: score };
      });

      if (area && area !== "all") {
        filtered = filtered.filter((p) =>
          p.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filtered = filtered.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
      }

      results.providers = filtered.slice(0, 15);
    }

    let totalCount =
      results.products.length + results.services.length + results.providers.length;
    let isFallback = false;

    // Discovery Fallback if zero items match specific query
    if (queryTokens.length > 0 && totalCount === 0) {
      isFallback = true;
      results.products = productPool.slice(0, 6);
      results.services = servicePool.slice(0, 6);
      results.providers = providerPool.slice(0, 6);
      totalCount = results.products.length + results.services.length + results.providers.length;
    }

    return NextResponse.json({
      query,
      scope,
      totalCount,
      isFallback,
      results,
    });
  } catch (error: any) {
    console.error("Unified Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform unified search." },
      { status: 500 }
    );
  }
}
