import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const providerSlug = searchParams.get("provider");
    const area = searchParams.get("area");
    const search = searchParams.get("q");
    const includeInactive = searchParams.get("all") === "true";

    // 1. Fetch from legacy `prisma.product`
    const productWhere: any = {};
    if (!includeInactive) productWhere.isAvailable = true;
    if (category && category !== "all") productWhere.category = category;
    if (providerSlug) {
      productWhere.OR = [
        { provider: { slug: providerSlug } },
        { provider: { user: { businessProfile: { slug: providerSlug } } } },
      ];
    }
    if (area && area !== "all") {
      productWhere.provider = {
        ...(productWhere.provider || {}),
        serviceArea: { contains: area, mode: "insensitive" },
      };
    }
    if (search) {
      productWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const legacyProducts = await prisma.product.findMany({
      where: productWhere,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            serviceArea: true,
            ratingAverage: true,
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
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch from new `prisma.productListing` (posted via Business Portal)
    const listingWhere: any = {};
    if (!includeInactive) {
      listingWhere.status = { in: ["ACTIVE", "PENDING_APPROVAL"] };
    }
    if (providerSlug) {
      listingWhere.OR = [
        { business: { slug: providerSlug } },
        { seller: { businessProfile: { slug: providerSlug } } },
        { seller: { providerProfile: { slug: providerSlug } } },
      ];
    }
    if (category && category !== "all") {
      listingWhere.category = { contains: category, mode: "insensitive" };
    }
    if (area && area !== "all") {
      listingWhere.area = { contains: area, mode: "insensitive" };
    }
    if (search) {
      listingWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const portalListings = await prisma.productListing.findMany({
      where: listingWhere,
      include: {
        seller: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
            businessProfile: { select: { slug: true, businessName: true, logoUrl: true, zone: true } },
            providerProfile: { select: { slug: true, businessName: true, logoUrl: true, serviceArea: true } },
          },
        },
        business: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            zone: true,
            verificationStatus: true,
            ratingAverage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format ProductListing records to match Product structure
    const formattedPortalProducts = portalListings.map((item) => {
      const parsedImages = Array.isArray(item.images)
        ? item.images
        : typeof item.images === "string"
        ? JSON.parse(item.images || "[]")
        : [];

      const providerSlug =
        item.business?.slug ||
        item.seller?.businessProfile?.slug ||
        item.seller?.providerProfile?.slug ||
        "savannah-fresh-farms";

      const providerName =
        item.business?.businessName ||
        item.seller?.businessProfile?.businessName ||
        item.seller?.providerProfile?.businessName ||
        item.seller?.name ||
        "Verified Enterprise";

      const providerLogo =
        item.business?.logoUrl ||
        item.seller?.businessProfile?.logoUrl ||
        item.seller?.avatarUrl ||
        null;

      const providerArea =
        item.area ||
        item.business?.zone ||
        item.seller?.businessProfile?.zone ||
        "Tamale";

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
        stockQuantity: item.stockQuantity || 1,
        category: item.category,
        images: JSON.stringify(parsedImages),
        isAvailable: item.status === "ACTIVE" || item.status === "PENDING_APPROVAL",
        createdAt: item.createdAt,
        provider: {
          id: item.business?.id || item.sellerId || "business",
          businessName: providerName,
          slug: providerSlug,
          logoUrl: providerLogo,
          serviceArea: providerArea,
          ratingAverage: item.business?.ratingAverage || 5.0,
          verificationStatus: item.business?.verificationStatus || "TIER_1_BASIC",
          user: {
            name: item.seller?.name || providerName,
            phone: item.seller?.phone || "",
            avatarUrl: item.seller?.avatarUrl || null,
          },
        },
      };
    });

    // Merge legacy and portal products (deduplicate by slug)
    const slugSet = new Set<string>();
    const combinedProducts: any[] = [];

    for (const p of [...formattedPortalProducts, ...legacyProducts]) {
      if (!slugSet.has(p.slug)) {
        slugSet.add(p.slug);
        combinedProducts.push(p);
      }
    }

    // Sort by newest first
    combinedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ products: combinedProducts });
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch marketplace products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to post products for sale." }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, originalPrice, stockQuantity, category, images, area } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json({ error: "Product title, description, price, and category are required." }, { status: 400 });
    }

    const cleanSlug = `${title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(100 + Math.random() * 900)}`;

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
    });

    const parsedImages = Array.isArray(images) ? images : [];

    const productListing = await prisma.productListing.create({
      data: {
        title,
        slug: cleanSlug,
        description,
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stockQuantity: Number(stockQuantity) || 1,
        images: parsedImages,
        area: area || businessProfile?.zone || "Tamale Central",
        sellerType: "REGISTERED_USER",
        sellerId: session.id,
        businessId: businessProfile?.id || null,
        status: "ACTIVE",
        inventoryStatus: "IN_STOCK",
      },
    });

    return NextResponse.json({ success: true, product: productListing });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: "Failed to post product." }, { status: 500 });
  }
}
