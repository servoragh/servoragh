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

    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isAvailable = true;
    }

    if (category) {
      whereClause.category = category;
    }

    if (providerSlug) {
      whereClause.provider = { slug: providerSlug };
    }

    if (area) {
      whereClause.provider = {
        ...(whereClause.provider || {}),
        serviceArea: { contains: area },
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
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

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch marketplace products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PROVIDER") {
      return NextResponse.json({ error: "Only registered businesses/providers can post products for sale." }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, originalPrice, stockQuantity, category, images } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json({ error: "Product title, description, price, and category are required." }, { status: 400 });
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.id },
    });

    if (!providerProfile) {
      return NextResponse.json({ error: "Please complete your business profile before posting products." }, { status: 400 });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(100 + Math.random() * 900)}`;

    const product = await prisma.product.create({
      data: {
        providerId: providerProfile.id,
        title,
        slug,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stockQuantity: Number(stockQuantity) || 1,
        category,
        images: JSON.stringify(images || []),
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: "Failed to post product." }, { status: 500 });
  }
}
