import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const FALLBACK_TRENDING = [
  { tag: "⚡ Solar Inverter Sakasaka", query: "Solar Inverter Sakasaka", category: "Solar & Electrical", volume: 48 },
  { tag: "🧵 Dagbon Royal Fugu", query: "Fugu Smock Nyohini", category: "Fashion & Tailoring", volume: 42 },
  { tag: "🚜 Borehole Drilling Machine", query: "Borehole Drilling Machine", category: "Equipment Rentals", volume: 36 },
  { tag: "🔧 Auto Electrician Fitter", query: "Auto Electrician Fitter", category: "Mechanics", volume: 32 },
  { tag: "🚰 Plumber Choggu", query: "Plumber Choggu", category: "Plumbing", volume: 28 },
  { tag: "🔨 Welder Metal Gate", query: "Welder Metal Gate Fabrication", category: "Welding", volume: 25 },
  { tag: "🚚 Kia Haulage Truck", query: "Heavy Drill Generator Rental", category: "Transport & Logistics", volume: 22 },
  { tag: "📱 iPhone Screen Repair", query: "iPhone Screen Repair", category: "Electronics", volume: 20 },
];

export async function GET() {
  try {
    // Fetch aggregated top searches from SearchQueryTelemetry
    const rows = await prisma.$queryRaw<Array<{ query: string; total_count: bigint; avg_hits: number }>>`
      SELECT 
        "query",
        COUNT(*)::bigint as total_count,
        AVG("hitsCount")::numeric as avg_hits
      FROM "SearchQueryTelemetry"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        AND LENGTH("query") >= 3
      GROUP BY "query"
      ORDER BY total_count DESC, avg_hits DESC
      LIMIT 10
    `.catch(() => []);

    if (rows && rows.length > 0) {
      const trending = rows.map((r, idx) => ({
        tag: r.query,
        query: r.query,
        volume: Number(r.total_count) * 10 + 15,
        category: "Trending in Tamale",
        rank: idx + 1,
      }));

      return NextResponse.json({
        success: true,
        region: "Northern Ghana",
        trending,
      });
    }

    return NextResponse.json({
      success: true,
      region: "Northern Ghana",
      trending: FALLBACK_TRENDING,
    });
  } catch (error: any) {
    console.error("Search Trending API Error:", error);
    return NextResponse.json({
      success: true,
      region: "Northern Ghana",
      trending: FALLBACK_TRENDING,
    });
  }
}
