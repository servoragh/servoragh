import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllProductListings, createProductListing } from "@/lib/productListingsStore";
import { ItemCondition, SellerType } from "@/lib/productListingTypes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || "ALL";
    const area = searchParams.get("area") || "ALL";
    const condition = (searchParams.get("condition") as ItemCondition | "ALL") || "ALL";
    const isFeaturedParam = searchParams.get("isFeatured");
    const isFeatured = isFeaturedParam === "true" ? true : undefined;

    // By default, public API returns only ACTIVE listings
    const { listings, total } = await getAllProductListings({
      search,
      status: "ACTIVE",
      category,
      area,
      condition,
      isFeatured,
    });

    return NextResponse.json({
      success: true,
      listings,
      total,
    });
  } catch (error: any) {
    console.error("Public Listings GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch product listings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSession();
    const body = await request.json();

    const {
      title,
      description,
      category,
      subCategory,
      condition,
      price,
      isNegotiable,
      currency,
      images,
      videoUrl,
      area,
      deliveryOptions,
      sellerType,
      guestName,
      guestPhone,
      guestWhatsApp,
      guestEmail,
    } = body;

    if (!title || !description || !category || !price || !area) {
      return NextResponse.json(
        { error: "Title, description, category, price, and location area are required." },
        { status: 400 }
      );
    }

    const newListing = await createProductListing(
      {
        title,
        description,
        category,
        subCategory,
        condition: condition || "USED_GOOD",
        price: Number(price),
        isNegotiable: !!isNegotiable,
        currency: currency || "GHS",
        images: Array.isArray(images) ? images : [],
        videoUrl,
        area,
        deliveryOptions: Array.isArray(deliveryOptions) ? deliveryOptions : ["PICKUP"],
        sellerType: sellerType || (sessionUser ? "REGISTERED_USER" : "GUEST"),
        guestName,
        guestPhone,
        guestWhatsApp,
        guestEmail,
      },
      sessionUser
    );

    return NextResponse.json({
      success: true,
      message: "Product listing submitted successfully for admin moderation.",
      listing: newListing,
      magicLink: newListing.guestAccessKey
        ? `/products/manage?key=${newListing.guestAccessKey}`
        : null,
    });
  } catch (error: any) {
    console.error("Submit Product Listing Error:", error);
    return NextResponse.json({ error: "Failed to submit product listing." }, { status: 500 });
  }
}
