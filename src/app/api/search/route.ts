import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const scope = searchParams.get("scope") || "all"; // all, products, services, providers
    const category = searchParams.get("category");
    const area = searchParams.get("area");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const results: {
      products: any[];
      services: any[];
      providers: any[];
    } = {
      products: [],
      services: [],
      providers: [],
    };

    // 1. Search Products
    if (scope === "all" || scope === "products") {
      const productWhere: any = { isAvailable: true };

      if (query.trim()) {
        productWhere.OR = [
          { title: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
        ];
      }

      if (category && category !== "all") {
        productWhere.category = { contains: category };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        productWhere.price = {};
        if (minPrice !== undefined) productWhere.price.gte = minPrice;
        if (maxPrice !== undefined) productWhere.price.lte = maxPrice;
      }

      if (area && area !== "all") {
        productWhere.provider = { serviceArea: { contains: area } };
      }

      results.products = await prisma.product.findMany({
        where: productWhere,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              slug: true,
              serviceArea: true,
              verificationStatus: true,
              ratingAverage: true,
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        take: 12,
        orderBy: { createdAt: "desc" },
      });
    }

    // 2. Search Services
    if (scope === "all" || scope === "services") {
      const serviceWhere: any = {};

      if (query.trim()) {
        serviceWhere.OR = [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
        ];
      }

      if (category && category !== "all") {
        serviceWhere.category = { name: { contains: category } };
      }

      results.services = await prisma.service.findMany({
        where: serviceWhere,
        include: {
          category: true,
          providers: {
            include: {
              provider: {
                select: {
                  businessName: true,
                  slug: true,
                  serviceArea: true,
                  ratingAverage: true,
                  verificationStatus: true,
                },
              },
            },
          },
        },
        take: 12,
      });
    }

    // 3. Search Providers / Businesses
    if (scope === "all" || scope === "providers") {
      const providerWhere: any = {};

      if (query.trim()) {
        providerWhere.OR = [
          { businessName: { contains: query } },
          { bio: { contains: query } },
          { serviceArea: { contains: query } },
        ];
      }

      if (area && area !== "all") {
        providerWhere.serviceArea = { contains: area };
      }

      results.providers = await prisma.providerProfile.findMany({
        where: providerWhere,
        include: {
          user: {
            select: {
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          products: {
            take: 3,
          },
        },
        take: 12,
        orderBy: { ratingAverage: "desc" },
      });
    }

    const totalCount =
      results.products.length + results.services.length + results.providers.length;

    return NextResponse.json({
      query,
      scope,
      totalCount,
      results,
    });
  } catch (error: any) {
    console.error("Unified Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform unified search." },
      { status: 500 }
    );
  }
}
