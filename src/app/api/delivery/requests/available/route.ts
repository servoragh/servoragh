import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/delivery/requests/available - Feed of available jobs for providers & admin fleet overview
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Admin access: return all active & historical delivery requests
    if (session.role === "ADMIN") {
      const deliveries = await prisma.deliveryRequest.findMany({
        include: {
          customer: { select: { name: true, phone: true } },
          assignedProvider: {
            include: {
              user: { select: { name: true, phone: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        deliveries,
        jobs: deliveries,
      });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      include: { vehicles: true },
    });

    if (!provider) {
      // Return empty jobs array for general non-provider users instead of 404
      const deliveries = await prisma.deliveryRequest.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, jobs: deliveries, deliveries });
    }

    if (provider.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Account verification required to view available delivery jobs.", jobs: [] },
        { status: 403 }
      );
    }

    // Fetch unassigned requests with status SEARCHING_FOR_PROVIDER or REQUESTED
    const jobs = await prisma.deliveryRequest.findMany({
      where: {
        status: { in: ["SEARCHING_FOR_PROVIDER", "REQUESTED"] },
        assignedProviderId: null,
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      isOnline: provider.isOnline,
      jobs,
    });
  } catch (error: any) {
    console.error("GET Available Delivery Jobs Error:", error);
    return NextResponse.json({ error: "Failed to load available jobs." }, { status: 500 });
  }
}
