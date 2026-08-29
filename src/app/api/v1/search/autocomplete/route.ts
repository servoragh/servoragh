import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expandQuery } from "@/lib/search/hybridSearchEngine";
import { GHANAIAN_TRADE_SYNONYMS } from "@/lib/search/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ query: q, suggestions: [] });
    }

    const { cleanQuery, expandedTerms } = expandQuery(q);

    // 1. Suggestions from matching Products
    const matchingProducts = await prisma.productListing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: cleanQuery, mode: "insensitive" } },
          { category: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: { title: true, category: true, slug: true },
      take: 4,
    });

    // 2. Suggestions from matching Providers / Artisans
    const matchingArtisans = await prisma.providerProfile.findMany({
      where: {
        businessName: { contains: cleanQuery, mode: "insensitive" },
      },
      select: { businessName: true, slug: true },
      take: 3,
    });

    // 3. Suggestions from matching Categories
    const matchingCategories = await prisma.category.findMany({
      where: {
        name: { contains: cleanQuery, mode: "insensitive" },
      },
      select: { name: true, slug: true },
      take: 2,
    });

    const suggestions: Array<{
      text: string;
      category: string;
      type: "product" | "artisan" | "category" | "synonym";
      slug?: string;
    }> = [];

    // Category suggestions
    matchingCategories.forEach((cat) => {
      suggestions.push({
        text: cat.name,
        category: "Marketplace Category",
        type: "category",
        slug: cat.slug,
      });
    });

    // Product suggestions
    matchingProducts.forEach((p) => {
      suggestions.push({
        text: p.title,
        category: p.category,
        type: "product",
        slug: p.slug,
      });
    });

    // Artisan suggestions
    matchingArtisans.forEach((art) => {
      suggestions.push({
        text: art.businessName,
        category: "Verified Artisan",
        type: "artisan",
        slug: art.slug,
      });
    });

    // Dialect synonym suggestions
    if (GHANAIAN_TRADE_SYNONYMS[cleanQuery]) {
      GHANAIAN_TRADE_SYNONYMS[cleanQuery].slice(0, 2).forEach((syn) => {
        suggestions.push({
          text: syn,
          category: `Related to "${cleanQuery}"`,
          type: "synonym",
        });
      });
    }

    return NextResponse.json({
      query: q,
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error: any) {
    console.error("Search Autocomplete API Error:", error);
    return NextResponse.json({ query: "", suggestions: [] });
  }
}
