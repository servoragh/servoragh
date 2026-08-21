import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      include: {
        products: { select: { price: true, originalPrice: true, viewsCount: true, inventoryStatus: true, stockQuantity: true } },
        services: { select: { startingPrice: true, isActive: true } },
        rentals: { select: { dailyRate: true, status: true, isAvailable: true } },
        leads: { select: { status: true, quoteAmount: true } },
        quotes: { select: { status: true, totalAmount: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    const totalProductImpressions = profile.products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalLeads = profile.leads.length;
    const acceptedLeads = profile.leads.filter((l) => l.status === "ACCEPTED" || l.status === "COMPLETED");
    const quoteConversionRate = totalLeads > 0 ? ((acceptedLeads.length / totalLeads) * 100).toFixed(1) : "0.0";

    // Estimated Revenue Breakdown
    const productSalesRevenue = profile.products
      .filter((p) => p.inventoryStatus === "SOLD_OUT" || p.stockQuantity === 0)
      .reduce((acc, p) => acc + Number(p.price || 0), 0);

    const serviceRevenue = profile.quotes
      .filter((q) => q.status === "ACCEPTED")
      .reduce((acc, q) => acc + Number(q.totalAmount || 0), 0);

    const rentalIncome = profile.rentals
      .filter((r) => r.status === "RENTED_OUT")
      .reduce((acc, r) => acc + Number(r.dailyRate || 0) * 3, 0); // Estimated 3 day average rental duration

    const totalEstimatedRevenue = productSalesRevenue + serviceRevenue + rentalIncome;

    const sharesCount = profile.sharesCount || 0;
    const qrScansCount = profile.qrScansCount || 0;
    const favoritesCount = profile.favoritesCount || 0;
    const shareConversionRate = sharesCount > 0 ? ((totalLeads / sharesCount) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      metrics: {
        profileViews: profile.profileViews,
        productImpressions: totalProductImpressions,
        whatsappClicks: profile.whatsappClicks,
        sharesCount,
        qrScansCount,
        favoritesCount,
        shareConversionRate,
        ratingAverage: profile.ratingAverage,
        reviewsCount: profile.reviewsCount,
        totalLeads,
        acceptedLeadsCount: acceptedLeads.length,
        quoteConversionRate,
        revenue: {
          productSalesRevenue,
          serviceRevenue,
          rentalIncome,
          totalEstimatedRevenue,
        },
      },
    });

  } catch (error: any) {
    console.error("GET Business Analytics Error:", error);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
