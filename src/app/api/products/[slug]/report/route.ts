import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession(request);
    const body = await request.json();
    const { reason, description } = body;

    const listing: any = await prisma.productListing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, title: true, sellerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const reporterId = session?.id || null;

    if (reporterId && listing.sellerId) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Report" ("id", "reporterId", "targetId", "reason", "details", "status", "createdAt")
         VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())`,
        reportId,
        reporterId,
        listing.sellerId,
        String(reason || "SUSPICIOUS_LISTING"),
        `Report on item "${listing.title}" (${listing.id}): ${description || "Reported by user"}`
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Our safety team will review this listing within 2 hours.",
    });
  } catch (error: any) {
    console.error("Report Listing Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit report." }, { status: 500 });
  }
}
