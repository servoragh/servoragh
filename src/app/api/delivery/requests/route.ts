import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDeliveryPrice, calculateDistanceKm } from "@/lib/delivery/pricingEngine";
import { generateTrackingNumber } from "@/lib/delivery/matchingEngine";
import { generateDeliveryPin } from "@/lib/delivery/otpGenerator";

export const dynamic = "force-dynamic";

// GET /api/delivery/requests - Customer delivery history
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Resolve user ID in DB
    let user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user && session.email) {
      user = await prisma.user.findFirst({ where: { email: session.email } });
    }

    const customerId = user?.id || session.id;

    const deliveries = await prisma.deliveryRequest.findMany({
      where: { customerId },
      include: {
        assignedProvider: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
            vehicles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, deliveries });
  } catch (error: any) {
    console.error("GET Customer Deliveries Error:", error);
    return NextResponse.json({ error: "Failed to load delivery history." }, { status: 500 });
  }
}

// POST /api/delivery/requests - Create new delivery request
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Ensure session user exists in DB to prevent foreign key error
    let user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user && session.email) {
      user = await prisma.user.findFirst({ where: { email: session.email } });
    }
    if (!user) {
      // Fallback: pick any existing user or create temporary user record
      user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: session.name || "Customer",
            email: session.email || `user-${Date.now()}@servora.gh`,
            phone: session.phone || `+233${Math.floor(100000000 + Math.random() * 900000000)}`,
            passwordHash: "demo",
            role: "CUSTOMER",
          },
        });
      }
    }

    const validCustomerId = user.id;

    const body = await req.json();
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupContactName,
      pickupContactPhone,
      destinationAddress,
      destinationLat,
      destinationLng,
      recipientName,
      recipientPhone,
      packageCategory,
      packageDescription,
      packageWeightKg,
      packageSize,
      packageQuantity,
      specialInstructions,
      requiredVehicleType,
      paymentMethod,
    } = body;

    if (
      !pickupAddress ||
      !destinationAddress ||
      !pickupContactName ||
      !pickupContactPhone ||
      !recipientName ||
      !recipientPhone ||
      !packageDescription
    ) {
      return NextResponse.json(
        { error: "Pickup location, Destination, contacts, and package description are required." },
        { status: 400 }
      );
    }

    // Coordinates fallback (e.g. Tamale Central coordinates if not provided)
    const pLat = pickupLat ? parseFloat(pickupLat) : 9.4075;
    const pLng = pickupLng ? parseFloat(pickupLng) : -0.8533;
    const dLat = destinationLat ? parseFloat(destinationLat) : 9.4180;
    const dLng = destinationLng ? parseFloat(destinationLng) : -0.8380;

    // Calculate Distance & Pricing
    const distanceKm = calculateDistanceKm(pLat, pLng, dLat, dLng);
    const vehicleType = requiredVehicleType || "MOTORCYCLE";

    const pricing = calculateDeliveryPrice({
      vehicleType,
      distanceKm,
      packageWeightKg: packageWeightKg ? parseFloat(packageWeightKg) : 1.0,
      packageSize: packageSize || "MEDIUM",
    });

    const trackingNumber = generateTrackingNumber();
    const deliveryPin = generateDeliveryPin();

    const delivery = await prisma.deliveryRequest.create({
      data: {
        trackingNumber,
        customerId: validCustomerId,
        pickupAddress,
        pickupLatitude: pLat,
        pickupLongitude: pLng,
        pickupContactName,
        pickupContactPhone,
        destinationAddress,
        destinationLatitude: dLat,
        destinationLongitude: dLng,
        recipientName,
        recipientPhone,
        packageCategory: packageCategory || "PARCEL",
        packageDescription,
        packageWeightKg: packageWeightKg ? parseFloat(packageWeightKg) : 1.0,
        packageSize: packageSize || "MEDIUM",
        packageQuantity: packageQuantity ? parseInt(packageQuantity) : 1,
        specialInstructions: specialInstructions || null,
        requiredVehicleType: vehicleType,
        estimatedDistanceKm: distanceKm,
        estimatedDurationMins: pricing.estimatedDurationMins,
        deliveryFee: pricing.deliveryFee,
        platformCommission: pricing.platformCommission,
        providerEarnings: pricing.providerEarnings,
        paymentMethod: paymentMethod || "MOBILE_MONEY",
        paymentStatus: paymentMethod === "CASH" ? "CASH_ON_DELIVERY" : "PENDING",
        deliveryPin,
        status: "SEARCHING_FOR_PROVIDER",
        statusHistory: {
          create: {
            status: "REQUESTED",
            note: "Delivery request submitted by customer.",
            actorId: session.id,
            actorRole: "CUSTOMER",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery request created! Finding suitable nearby verified providers...",
      delivery,
      pricing,
    });
  } catch (error: any) {
    console.error("POST Delivery Request Error:", error);
    return NextResponse.json({ error: "Failed to create delivery request." }, { status: 500 });
  }
}
