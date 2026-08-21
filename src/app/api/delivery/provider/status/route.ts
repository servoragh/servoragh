import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/delivery/provider/status - Toggle GO ONLINE / GO OFFLINE & update GPS location
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      include: { vehicles: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Delivery Provider Profile not found. Please complete registration first." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { isOnline, latitude, longitude, activeVehicleId } = body;

    // Strict Business Rule Enforcement
    if (isOnline === true) {
      if (provider.verificationStatus !== "APPROVED") {
        return NextResponse.json(
          {
            error: "Cannot Go Online. Your delivery provider profile is under review or requires verification.",
            verificationStatus: provider.verificationStatus,
            rejectionReason: provider.rejectionReason,
            requiresVerification: true,
          },
          { status: 403 }
        );
      }

      if (!provider.vehicles || provider.vehicles.length === 0) {
        return NextResponse.json(
          { error: "Cannot Go Online. Please register at least one delivery vehicle." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.deliveryProviderProfile.update({
      where: { id: provider.id },
      data: {
        isOnline: isOnline ?? provider.isOnline,
        currentLatitude: latitude ? parseFloat(latitude) : provider.currentLatitude,
        currentLongitude: longitude ? parseFloat(longitude) : provider.currentLongitude,
        lastLocationUpdate: new Date(),
        activeVehicleId: activeVehicleId || provider.activeVehicleId || provider.vehicles[0]?.id,
      },
    });

    return NextResponse.json({
      success: true,
      isOnline: updated.isOnline,
      message: updated.isOnline ? "You are now ONLINE and ready to receive delivery jobs!" : "You are now OFFLINE.",
      provider: updated,
    });
  } catch (error: any) {
    console.error("PATCH Provider Online Status Error:", error);
    return NextResponse.json({ error: "Failed to update online status." }, { status: 500 });
  }
}
