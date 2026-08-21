import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/verifications - Admin queue for provider & vehicle verifications
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const pendingProviders = await prisma.deliveryProviderProfile.findMany({
      include: {
        user: {
          select: { name: true, phone: true, email: true, avatarUrl: true, createdAt: true },
        },
        vehicles: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingVehicles = await prisma.deliveryVehicle.findMany({
      include: {
        provider: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      providers: pendingProviders,
      vehicles: pendingVehicles,
    });
  } catch (error: any) {
    console.error("GET Admin Delivery Verifications Queue Error:", error);
    return NextResponse.json({ error: "Failed to load verifications queue." }, { status: 500 });
  }
}
