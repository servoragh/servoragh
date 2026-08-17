import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") || "";
    const query = rawQuery.trim();
    const scope = searchParams.get("scope") || "all"; // all, products, services, providers
    const category = searchParams.get("category");
    const area = searchParams.get("area");

    const results: {
      products: any[];
      services: any[];
      providers: any[];
    } = {
      products: [],
      services: [],
      providers: [],
    };

    // Variations for SQLite case-insensitive fallback matching
    const qLower = query.toLowerCase();
    const qUpper = query.toUpperCase();
    const qCap = query ? query.charAt(0).toUpperCase() + query.slice(1).toLowerCase() : "";

    // 1. Search Products
    if (scope === "all" || scope === "products") {
      const productWhere: any = { isAvailable: true };

      if (query) {
        productWhere.OR = [
          { title: { contains: query } },
          { title: { contains: qLower } },
          { title: { contains: qUpper } },
          { title: { contains: qCap } },
          { description: { contains: query } },
          { description: { contains: qLower } },
          { category: { contains: query } },
          { category: { contains: qLower } },
        ];
      }

      if (category && category !== "all") {
        productWhere.category = { contains: category };
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
              user: { select: { name: true, phone: true } },
            },
          },
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      });
    }

    // 2. Search Services
    if (scope === "all" || scope === "services") {
      const serviceWhere: any = {};

      if (query) {
        serviceWhere.OR = [
          { name: { contains: query } },
          { name: { contains: qLower } },
          { name: { contains: qUpper } },
          { name: { contains: qCap } },
          { description: { contains: query } },
          { description: { contains: qLower } },
          { category: { name: { contains: query } } },
          { category: { name: { contains: qLower } } },
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
        take: 15,
      });
    }

    // 3. Search Providers / Businesses / Artisans
    if (scope === "all" || scope === "providers") {
      const providerWhere: any = {};

      if (query) {
        providerWhere.OR = [
          { businessName: { contains: query } },
          { businessName: { contains: qLower } },
          { businessName: { contains: qUpper } },
          { businessName: { contains: qCap } },
          { bio: { contains: query } },
          { bio: { contains: qLower } },
          { serviceArea: { contains: query } },
          { serviceArea: { contains: qLower } },
        ];
      }

      if (area && area !== "all") {
        providerWhere.serviceArea = { contains: area };
      }

      results.providers = await prisma.providerProfile.findMany({
        where: providerWhere,
        include: {
          user: { select: { name: true, phone: true, avatarUrl: true } },
          services: { include: { service: true } },
          products: { take: 3 },
        },
        take: 15,
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
