import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLASSIFIED_CATEGORIES, formatAdsCount } from "@/lib/categoriesData";

export async function GET() {
  try {
    // 1. Group active product listings by category
    const portalListingCounts = await prisma.productListing.groupBy({
      by: ["category"],
      where: {
        status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
      },
      _count: {
        _all: true,
      },
    });

    // 2. Group legacy products by category
    const legacyProductCounts = await prisma.product.groupBy({
      by: ["category"],
      where: {
        isAvailable: true,
      },
      _count: {
        _all: true,
      },
    });

    // Create a map of category lowercase name -> count
    const countsMap = new Map<string, number>();

    for (const item of portalListingCounts) {
      if (item.category) {
        const key = item.category.trim().toLowerCase();
        countsMap.set(key, (countsMap.get(key) || 0) + item._count._all);
      }
    }

    for (const item of legacyProductCounts) {
      if (item.category) {
        const key = item.category.trim().toLowerCase();
        countsMap.set(key, (countsMap.get(key) || 0) + item._count._all);
      }
    }

    // 3. Map CLASSIFIED_CATEGORIES with dynamic live counts
    const categoriesWithLiveCounts = CLASSIFIED_CATEGORIES.map((cat) => {
      const catKey = cat.name.toLowerCase();
      // Match exact or partial category name in countsMap
      let totalCount = 0;
      for (const [key, count] of countsMap.entries()) {
        if (key.includes(catKey) || catKey.includes(key)) {
          totalCount += count;
        }
      }

      return {
        ...cat,
        adsCount: totalCount,
        adsCountText: formatAdsCount(totalCount),
      };
    });

    return NextResponse.json({
      categories: categoriesWithLiveCounts,
      totalListings: Array.from(countsMap.values()).reduce((a, b) => a + b, 0),
    });
  } catch (error: any) {
    console.error("GET /api/categories Error:", error);
    // Fallback to CLASSIFIED_CATEGORIES if DB query fails
    return NextResponse.json({ categories: CLASSIFIED_CATEGORIES });
  }
}
