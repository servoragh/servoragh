import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllProductListings } from "@/lib/productListingsStore";
import { ProductListingStatus, SellerType } from "@/lib/productListingTypes";

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

    const { listings, total } = await getAllProductListings({
      search,
      status,
      sellerType,
      category,
    });

    const counts = {
      pending: listings.filter((l) => l.status === "PENDING_APPROVAL").length,
      active: listings.filter((l) => l.status === "ACTIVE").length,
      rejected: listings.filter((l) => l.status === "REJECTED").length,
      sold: listings.filter((l) => l.status === "SOLD").length,
      suspended: listings.filter((l) => l.status === "SUSPENDED").length,
      guestCount: listings.filter((l) => l.sellerType === "GUEST").length,
    };

    return NextResponse.json({
      success: true,
      listings,
      total,
      counts,
    });
  } catch (error: any) {
    console.error("Admin Product Listings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch product moderation queue." }, { status: 500 });
  }
}
