import { NextResponse } from "next/server";
import { executeUniversalSearch } from "@/lib/search/hybridSearchEngine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const zone = searchParams.get("zone") || undefined;
    const category = searchParams.get("category") || undefined;
    const entity = (searchParams.get("entity") as any) || "all";
    const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
    const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const verifiedOnly = searchParams.get("verified") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 24;
    const deviceType = (searchParams.get("device") as any) || "WEB";
    const userId = searchParams.get("userId") || undefined;

    const result = await executeUniversalSearch(q, {
      zone,
      category,
      entity,
      minPrice,
      maxPrice,
      verifiedOnly,
      limit,
      deviceType,
      userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Universal Search API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute universal search query.",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}
