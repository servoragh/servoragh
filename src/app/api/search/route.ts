import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenizeText, calculateRelevanceScore } from "@/lib/searchEngine";

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

    // -----------------------------------------------------------------
    // 1. Search Products with Token & Fuzzy Relevance Scoring
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "products") {
      const allProducts = await prisma.product.findMany({
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
              user: { select: { name: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let filteredProducts = allProducts.map((prod) => {
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

      // Filter by category if specified
      if (category && category !== "all") {
        filteredProducts = filteredProducts.filter((p) =>
          p.category?.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Filter by area if specified
      if (area && area !== "all") {
        filteredProducts = filteredProducts.filter((p) =>
          p.provider?.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      // If query entered, keep items with score > 0 and sort by score
      if (queryTokens.length > 0) {
        filteredProducts = filteredProducts
          .filter((p) => p._score > 0)
          .sort((a, b) => b._score - a._score);
      }

      results.products = filteredProducts.slice(0, 15);
    }

    // -----------------------------------------------------------------
    // 2. Search Services with Token & Fuzzy Relevance Scoring
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "services") {
      const allServices = await prisma.service.findMany({
        include: {
          category: true,
          providers: {
            include: {
              provider: {
                select: {
                  businessName: true,
                  slug: true,
                  serviceArea: true,
                  ratingAverage: true,
                  verificationStatus: true,
                },
              },
            },
          },
        },
      });

      let filteredServices = allServices.map((serv) => {
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
        filteredServices = filteredServices.filter((s) =>
          s.category?.name?.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filteredServices = filteredServices
          .filter((s) => s._score > 0)
          .sort((a, b) => b._score - a._score);
      }

      results.services = filteredServices.slice(0, 15);
    }

    // -----------------------------------------------------------------
    // 3. Search Providers / Artisans / Businesses
    // -----------------------------------------------------------------
    if (scope === "all" || scope === "providers") {
      const allProviders = await prisma.providerProfile.findMany({
        include: {
          user: { select: { name: true, phone: true, avatarUrl: true } },
          services: { include: { service: true } },
          products: { take: 3 },
        },
        orderBy: { ratingAverage: "desc" },
      });

      let filteredProviders = allProviders.map((prov) => {
        const serviceNames = prov.services.map((s) => s.service.name).join(" ");
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
        filteredProviders = filteredProviders.filter((p) =>
          p.serviceArea?.toLowerCase().includes(area.toLowerCase())
        );
      }

      if (queryTokens.length > 0) {
        filteredProviders = filteredProviders
          .filter((p) => p._score > 0)
          .sort((a, b) => b._score - a._score);
      }

      results.providers = filteredProviders.slice(0, 15);
    }

    let totalCount =
      results.products.length + results.services.length + results.providers.length;
    let isFallback = false;

    // FALLBACK DISCOVERY: If zero exact matches found for a query, provide top recommended items
    if (queryTokens.length > 0 && totalCount === 0) {
      isFallback = true;
      const fallbackProducts = await prisma.product.findMany({
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
        take: 6,
        orderBy: { createdAt: "desc" },
      });

      const fallbackServices = await prisma.service.findMany({
        include: { category: true },
        take: 6,
      });

      const fallbackProviders = await prisma.providerProfile.findMany({
        take: 6,
        orderBy: { ratingAverage: "desc" },
      });

      results.products = fallbackProducts;
      results.services = fallbackServices;
      results.providers = fallbackProviders;
      totalCount = fallbackProducts.length + fallbackServices.length + fallbackProviders.length;
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
