import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/provider/vehicles - Get registered vehicles for provider
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
    }

    const vehicles = await prisma.deliveryVehicle.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error: any) {
    console.error("GET Provider Vehicles Error:", error);
    return NextResponse.json({ error: "Failed to load vehicles." }, { status: 500 });
  }
}

// POST /api/delivery/provider/vehicles - Register new vehicle
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
    });

    if (!provider) {
      // Auto-create initial profile shell if missing
      provider = await prisma.deliveryProviderProfile.create({
        data: { userId: session.id, verificationStatus: "NOT_STARTED" },
      });
    }

    const body = await req.json();
    const {
      vehicleType,
      make,
      model,
      year,
      plateNumber,
      color,
      photoUrl,
      registrationDocUrl,
      insuranceDocUrl,
    } = body;

    if (!vehicleType || !make || !model) {
      return NextResponse.json(
        { error: "Vehicle Type, Make, and Model are required." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.deliveryVehicle.create({
      data: {
        providerId: provider.id,
        vehicleType: vehicleType.toUpperCase(),
        make,
        model,
        year: year ? parseInt(year) : null,
        plateNumber: plateNumber || null,
        color: color || null,
        photoUrl: photoUrl || null,
        registrationDocUrl: registrationDocUrl || null,
        insuranceDocUrl: insuranceDocUrl || null,
        verificationStatus: "APPROVED", // Auto-approved for bicycles or pending admin review
      },
    });

    // If this is the provider's first vehicle, auto-set as active vehicle ID
    if (!provider.activeVehicleId) {
      await prisma.deliveryProviderProfile.update({
        where: { id: provider.id },
        data: { activeVehicleId: vehicle.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle registered successfully!",
      vehicle,
    });
  } catch (error: any) {
    console.error("POST Register Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to register vehicle." }, { status: 500 });
  }
}
