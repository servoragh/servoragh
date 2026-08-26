import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllProductListings } from "@/lib/productListingsStore";
import { ProductListingStatus, SellerType } from "@/lib/productListingTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as ProductListingStatus | "ALL") || "ALL";
    const sellerType = (searchParams.get("sellerType") as SellerType | "ALL") || "ALL";
    const category = searchParams.get("category") || "ALL";

    // 1. Fetch all listings matching search/category to calculate total tab counts
    const { listings: allListings } = await getAllProductListings({
      search,
      category,
    });

    const counts = {
      pending: allListings.filter((l) => l.status === "PENDING_APPROVAL").length,
      active: allListings.filter((l) => l.status === "ACTIVE").length,
      rejected: allListings.filter((l) => l.status === "REJECTED").length,
      sold: allListings.filter((l) => l.status === "SOLD").length,
      suspended: allListings.filter((l) => l.status === "SUSPENDED").length,
      guestCount: allListings.filter((l) => l.sellerType === "GUEST").length,
    };

    // 2. Filter listings for active tab display
    let filteredListings = allListings;
    if (status && status !== "ALL") {
      filteredListings = filteredListings.filter((l) => l.status === status);
    }
    if (sellerType && sellerType !== "ALL") {
      filteredListings = filteredListings.filter((l) => l.sellerType === sellerType);
    }

    return NextResponse.json({
      success: true,
      listings: filteredListings,
      total: filteredListings.length,
      counts,
    });
  } catch (error: any) {
    console.error("Admin Product Listings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch product moderation queue." }, { status: 500 });
  }
}
