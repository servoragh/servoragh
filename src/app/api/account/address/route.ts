import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function parseCoordinate(val: any): number | null {
  if (val === null || val === undefined || val === "" || val === false) return null;
  const num = typeof val === "number" ? val : parseFloat(String(val).trim());
  return isNaN(num) ? null : num;
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { label, zone, streetDetails, landmark, latitude, longitude, isDefault } = body;

    if (!label || !zone) {
      return NextResponse.json({ error: "Label and zone are required." }, { status: 400 });
    }

    // 1. Ensure User exists in PostgreSQL
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { email: session.email || undefined },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: session.name || "Customer Member",
          phone: session.phone || "+233240000000",
          email: session.email || null,
          role: session.role || "CUSTOMER",
          passwordHash: crypto.randomBytes(16).toString("hex"),
          isPhoneVerified: session.isPhoneVerified ?? true,
          referralCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });
    }

    // 2. Ensure Customer Profile exists
    let profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          defaultZone: zone,
          defaultCurrency: "GHS",
          preferredPayment: "MOMO_ESCROW",
          profileVisibility: "RESTRICTED",
          status: "ACTIVE",
          verificationTier: user.isPhoneVerified ? "TIER_1_BASIC" : "UNVERIFIED",
        },
      });
    }

    // 3. If marked default, unset others
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      }).catch(() => null);
    }

    const parsedLat = parseCoordinate(latitude);
    const parsedLng = parseCoordinate(longitude);

    // 4. Create Saved Address
    const address = await prisma.customerAddress.create({
      data: {
        customerProfileId: profile.id,
        label: String(label).trim(),
        zone: String(zone).trim(),
        streetDetails: streetDetails ? String(streetDetails).trim() : null,
        landmark: landmark ? String(landmark).trim() : null,
        latitude: parsedLat,
        longitude: parsedLng,
        isDefault: Boolean(isDefault),
      },
    });

    // 5. Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        actionType: "SAVED_ADDRESS_ADDED",
        description: `Added address: ${address.label} (${address.zone})`,
        entityType: "ADDRESS",
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("Address POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: session.id }, { phone: session.phone }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.customerAddress.deleteMany({
      where: {
        id: addressId,
        customerProfileId: profile.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
