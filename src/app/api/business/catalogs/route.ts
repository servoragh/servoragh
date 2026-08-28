import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // products, rentals, services, or all
    const search = searchParams.get("search") || "";

    const products = type === "all" || type === "products"
      ? await prisma.productListing.findMany({
          where: {
            businessId: profile.id,
            ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const rentals = type === "all" || type === "rentals"
      ? await prisma.toolRentalListing.findMany({
          where: {
            businessId: profile.id,
            ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    const services = type === "all" || type === "services"
      ? await prisma.businessService.findMany({
          where: {
            businessId: profile.id,
            ...(search ? { serviceName: { contains: search, mode: "insensitive" } } : {}),
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json({ products, rentals, services });
  } catch (error: any) {
    console.error("GET Business Catalogs Error:", error);
    return NextResponse.json({ error: "Failed to fetch catalogs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile required to add catalog items." }, { status: 400 });
    }

    const body = await req.json();
    const { itemType } = body; // "product" | "rental" | "service"

    if (itemType === "product") {
      const {
        title,
        description,
        category,
        subCategory,
        condition,
        price,
        originalPrice,
        stockQuantity,
        sku,
        deliveryOptions,
        images,
        videoUrl,
        isNegotiable,
      } = body;

      if (!title || !price || !category) {
        return NextResponse.json({ error: "Title, price, and category are required for products." }, { status: 400 });
      }

      const slug = `${title.toLowerCase().trim().replace(/[^a-z0-9]/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const product = await prisma.productListing.create({
        data: {
          title,
          slug,
          description: description || "",
          category,
          subCategory: subCategory || null,
          condition: condition || "USED_GOOD",
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          stockQuantity: stockQuantity ? parseInt(stockQuantity) : 1,
          sku: sku || null,
          deliveryOptions: deliveryOptions || ["PICKUP", "LOCAL_DELIVERY"],
          images: images || [],
          videoUrl: videoUrl || null,
          isNegotiable: isNegotiable || false,
          area: profile.zone,
          sellerType: "REGISTERED_USER",
          sellerId: session.id,
          businessId: profile.id,
          status: "ACTIVE",
          inventoryStatus: stockQuantity === 0 ? "SOLD_OUT" : parseInt(stockQuantity) < 3 ? "LOW_STOCK" : "IN_STOCK",
        },
      });

      // Notify subscribers who favorited this business
      notifyFavoriteSubscribers(profile.id, profile.businessName, title, profile.slug, "product");

      return NextResponse.json({ success: true, item: product, itemType: "product" });
    } else if (itemType === "rental") {
      const {
        title,
        description,
        category,
        dailyRate,
        weeklyRate,
        securityDeposit,
        operatorIncluded,
        images,
      } = body;

      if (!title || !dailyRate || !category) {
        return NextResponse.json({ error: "Title, daily rate, and category are required for equipment rentals." }, { status: 400 });
      }

      const slug = `rental-${title.toLowerCase().trim().replace(/[^a-z0-9]/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const rental = await prisma.toolRentalListing.create({
        data: {
          businessId: profile.id,
          title,
          slug,
          description: description || "",
          category,
          dailyRate: parseFloat(dailyRate),
          weeklyRate: weeklyRate ? parseFloat(weeklyRate) : null,
          securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
          operatorIncluded: Boolean(operatorIncluded),
          images: images || [],
          status: "AVAILABLE",
          isAvailable: true,
        },
      });

      // Notify subscribers who favorited this business
      notifyFavoriteSubscribers(profile.id, profile.businessName, title, profile.slug, "rental equipment");

      return NextResponse.json({ success: true, item: rental, itemType: "rental" });
    } else if (itemType === "service") {
      const {
        serviceName,
        description,
        startingPrice,
        estimatedDuration,
        portfolioPhotos,
      } = body;

      if (!serviceName) {
        return NextResponse.json({ error: "Service name is required." }, { status: 400 });
      }

      const service = await prisma.businessService.create({
        data: {
          businessId: profile.id,
          serviceName,
          description: description || "",
          startingPrice: startingPrice ? parseFloat(startingPrice) : null,
          estimatedDuration: estimatedDuration || null,
          portfolioPhotos: portfolioPhotos || [],
          isActive: true,
        },
      });

      // Notify subscribers who favorited this business
      notifyFavoriteSubscribers(profile.id, profile.businessName, serviceName, profile.slug, "service offering");

      return NextResponse.json({ success: true, item: service, itemType: "service" });
    }

    return NextResponse.json({ error: "Invalid itemType provided." }, { status: 400 });
  } catch (error: any) {
    console.error("POST Business Catalog Item Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create catalog item." }, { status: 500 });
  }
}

async function notifyFavoriteSubscribers(
  businessId: string,
  businessName: string,
  itemTitle: string,
  slug: string,
  itemType: string
) {
  try {
    const subscribers = await prisma.businessFavorite.findMany({
      where: {
        businessId,
        notifyOnNewListing: true,
      },
      select: { userId: true },
    });

    if (!subscribers || subscribers.length === 0) return;

    const notifications = subscribers.map((sub) => ({
      userId: sub.userId,
      title: `New Listing from ${businessName}`,
      message: `${businessName} added a new ${itemType}: "${itemTitle}". Tap to explore!`,
      link: `/biz/${slug}`,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (err) {
    console.error("Failed to dispatch favorite subscriber notifications:", err);
  }
}

