import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalProviders = await prisma.providerProfile.count();
    const verifiedProviders = await prisma.providerProfile.count({ where: { verificationStatus: "VERIFIED" } });
    const pendingVerifications = await prisma.providerProfile.count({ where: { verificationStatus: "PENDING" } });

    const totalRequests = await prisma.serviceRequest.count();
    const openRequests = await prisma.serviceRequest.count({ where: { status: "OPEN" } });
    const completedJobs = await prisma.serviceRequest.count({ where: { status: "COMPLETED" } });
    const totalQuotes = await prisma.quote.count();
    const acceptedQuotes = await prisma.quote.count({ where: { status: "ACCEPTED" } });
    const totalProducts = await prisma.product.count();

    // Storage Usage Statistics
    const allProducts = await prisma.product.findMany({ select: { images: true } });
    let totalProductImages = 0;
    allProducts.forEach((p) => {
      try {
        const imgs = JSON.parse(p.images || "[]");
        if (Array.isArray(imgs)) totalProductImages += imgs.length;
      } catch (e) {}
    });

    const allProfiles = await prisma.providerProfile.findMany({ select: { portfolioUrls: true } });
    let totalPortfolioImages = 0;
    allProfiles.forEach((p) => {
      try {
        const imgs = JSON.parse(p.portfolioUrls || "[]");
        if (Array.isArray(imgs)) totalPortfolioImages += imgs.length;
      } catch (e) {}
    });

    const totalVerificationDocs = await prisma.verificationRequest.count();

    // Storage Calculations (Cloudinary 25GB + Scaleway 75GB = 100GB Free)
    const cloudinaryUsedMB = Number(((totalProductImages + totalPortfolioImages) * 0.085).toFixed(2));
    const cloudinaryMaxMB = 25 * 1024;
    const cloudinaryPercent = Number(((cloudinaryUsedMB / cloudinaryMaxMB) * 100).toFixed(3));

    const scalewayUsedMB = Number((totalVerificationDocs * 0.45).toFixed(2));
    const scalewayMaxMB = 75 * 1024;
    const scalewayPercent = Number(((scalewayUsedMB / scalewayMaxMB) * 100).toFixed(3));

    const totalStorageUsedMB = Number((cloudinaryUsedMB + scalewayUsedMB).toFixed(2));
    const totalStorageLimitGB = 100;

    // North Star Metric: Successful Connections (Accepted Quotes + Completed Jobs)
    const northStarWeeklyConnections = acceptedQuotes + completedJobs;

    // Feature Flags
    const featureFlags = await prisma.featureFlag.findMany();

    // Audit logs
    const auditLogs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    // All Provider / Business Profiles
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        products: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // All Products
    const products = await prisma.product.findMany({
      include: {
        provider: {
          select: {
            businessName: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // All Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // All Categories & Services
    const categories = await prisma.category.findMany({
      include: {
        services: {
          include: {
            providers: true,
            requests: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // All Service Requests
    const serviceRequests = await prisma.serviceRequest.findMany({
      include: {
        customer: {
          select: { name: true, phone: true },
        },
        service: {
          select: { name: true },
        },
        location: {
          select: { area: true },
        },
        quotes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        totalRequests,
        openRequests,
        completedJobs,
        totalQuotes,
        acceptedQuotes,
        totalProducts,
        northStarWeeklyConnections,
      },
      storageStats: {
        cloudinaryUsedMB,
        cloudinaryMaxMB,
        cloudinaryPercent,
        scalewayUsedMB,
        scalewayMaxMB,
        scalewayPercent,
        totalStorageUsedMB,
        totalStorageLimitGB,
        totalProductImages,
        totalPortfolioImages,
        totalVerificationDocs,
      },
      featureFlags,
      auditLogs,
      providers,
      products,
      users,
      categories,
      serviceRequests,
    });
  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics." }, { status: 500 });
  }
}
