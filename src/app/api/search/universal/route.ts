import { NextResponse } from "next/server";
import { searchUniversalMarketplace } from "@/lib/search/universalSearch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const city = searchParams.get("city") || undefined;
    const categorySlug = searchParams.get("category") || undefined;
    const transactionType = searchParams.get("type") || undefined;
    const verifiedOnly = searchParams.get("verified") === "true";

    const searchData = await searchUniversalMarketplace(query, {
      city,
      categorySlug,
      transactionType,
      verifiedOnly,
      limit: 30,
    });

    return NextResponse.json(searchData);
  } catch (error: any) {
    console.error("Universal Search API Error:", error);
    return NextResponse.json({ error: "Failed to execute universal search query." }, { status: 500 });
  }
}
