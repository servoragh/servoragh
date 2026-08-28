import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: session.id }, { phone: session.phone }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile = await prisma.customerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          defaultZone: zone,
        },
      });
    }

    // If marked default, unset others
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerProfileId: profile.id,
        label,
        zone,
        streetDetails: streetDetails || null,
        landmark: landmark || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isDefault: isDefault ?? false,
      },
    });

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

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.id },
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
