import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let product: any = await prisma.product.findUnique({
      where: { slug },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            bio: true,
            serviceArea: true,
            ratingAverage: true,
            reviewCount: true,
            verificationStatus: true,
            user: {
              select: {
                name: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      const listing = await prisma.productListing.findUnique({
        where: { slug },
        include: {
          seller: {
            select: {
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
          business: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              logoUrl: true,
              description: true,
              zone: true,
              ratingAverage: true,
              reviewsCount: true,
              verificationStatus: true,
            },
          },
        },
      });

      if (listing) {
        const parsedImages = Array.isArray(listing.images)
          ? listing.images
          : typeof listing.images === "string"
          ? JSON.parse(listing.images || "[]")
          : [];

        product = {
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          price: Number(listing.price),
          originalPrice: listing.originalPrice ? Number(listing.originalPrice) : null,
          stockQuantity: listing.stockQuantity || 1,
          category: listing.category,
          images: JSON.stringify(parsedImages),
          isAvailable: listing.status === "ACTIVE" || listing.status === "PENDING_APPROVAL",
          provider: {
            id: listing.business?.id || listing.sellerId || "business",
            businessName: listing.business?.businessName || listing.seller?.name || "Verified Enterprise",
            slug: listing.business?.slug || "biz",
            logoUrl: listing.business?.logoUrl || listing.seller?.avatarUrl || null,
            bio: listing.business?.description || "Verified merchant on Servora.",
            serviceArea: listing.area || listing.business?.zone || "Tamale",
            ratingAverage: listing.business?.ratingAverage || 5.0,
            reviewCount: listing.business?.reviewsCount || 0,
            verificationStatus: listing.business?.verificationStatus || "TIER_1_BASIC",
            user: {
              name: listing.seller?.name || listing.business?.businessName || "Artisan Merchant",
              phone: listing.seller?.phone || "",
              avatarUrl: listing.seller?.avatarUrl || null,
            },
          },
        };

        // Increment views count on product listing
        await prisma.productListing.update({
          where: { id: listing.id },
          data: { viewsCount: { increment: 1 } },
        });

        return NextResponse.json({ product });
      }
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Increment view count on legacy product
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Get Product Error:", error);
    return NextResponse.json({ error: "Failed to load product details." }, { status: 500 });
  }
}
