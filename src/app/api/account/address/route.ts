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

function isValidUuid(s?: string | null): boolean {
  return !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { label, zone, streetDetails, landmark, latitude, longitude, isDefault } = body;

    if (!label || !zone) {
      return NextResponse.json({ error: "Label and zone are required." }, { status: 400 });
    }

    const cleanPhone = (session.phone || "").trim();
    const phoneVariants = [
      cleanPhone,
      cleanPhone.replace("+233", "0"),
      cleanPhone.startsWith("0") ? "+233" + cleanPhone.slice(1) : null,
    ].filter(Boolean) as string[];

    const orConditions: any[] = [];
    if (isValidUuid(session.id)) orConditions.push({ id: session.id });
    phoneVariants.forEach((p) => orConditions.push({ phone: p }));
    if (session.email) orConditions.push({ email: session.email });

    // 1. Resolve User in PostgreSQL
    let user = await prisma.user.findFirst({
      where: orConditions.length > 0 ? { OR: orConditions } : undefined,
    });

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            name: session.name || "Customer Member",
            phone: cleanPhone || `+233${Math.floor(200000000 + Math.random() * 700000000)}`,
            email: session.email || null,
            role: session.role || "CUSTOMER",
            passwordHash: crypto.randomBytes(16).toString("hex"),
            isPhoneVerified: session.isPhoneVerified ?? true,
            referralCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        });
      } catch {
        user = await prisma.user.findFirst();
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unable to resolve user profile." }, { status: 404 });
    }

    // 2. Resolve Customer Profile
    let profile: any = null;
    if ((prisma as any).customerProfile?.findFirst) {
      profile = await (prisma as any).customerProfile.findFirst({
        where: { userId: user.id },
      });
    } else {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT * FROM "CustomerProfile" WHERE "userId" = $1 LIMIT 1`,
        user.id
      ).catch(() => []);
      if (Array.isArray(rows) && rows.length > 0) profile = rows[0];
    }

    if (!profile) {
      if ((prisma as any).customerProfile?.create) {
        try {
          profile = await (prisma as any).customerProfile.create({
            data: {
              userId: user.id,
              defaultZone: String(zone).trim() || "Tamale Central",
              defaultCurrency: "GHS",
              preferredPayment: "MOMO_ESCROW",
              profileVisibility: "RESTRICTED",
              status: "ACTIVE",
              verificationTier: user.isPhoneVerified ? "TIER_1_BASIC" : "UNVERIFIED",
            },
          });
        } catch {
          profile = await (prisma as any).customerProfile.findFirst({
            where: { userId: user.id },
          });
        }
      } else {
        const profId = `prof_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const rows: any = await prisma.$queryRawUnsafe(
          `INSERT INTO "CustomerProfile" ("id", "userId", "defaultZone", "defaultCurrency", "preferredPayment", "profileVisibility", "status", "verificationTier", "riskLevel", "riskScore", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, 'GHS', 'MOMO_ESCROW', 'RESTRICTED', 'ACTIVE', 'TIER_1_BASIC', 'LOW', 0.0, NOW(), NOW())
           ON CONFLICT ("userId") DO UPDATE SET "updatedAt" = NOW()
           RETURNING *`,
          profId,
          user.id,
          String(zone).trim() || "Tamale Central"
        ).catch(() => []);
        profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : { id: profId, userId: user.id };
      }
    }

    if (!profile) {
      return NextResponse.json({ error: "Unable to create customer profile." }, { status: 500 });
    }

    // 3. If marked default, unset others
    if (isDefault) {
      if ((prisma as any).customerAddress?.updateMany) {
        await (prisma as any).customerAddress.updateMany({
          where: { customerProfileId: profile.id },
          data: { isDefault: false },
        }).catch(() => null);
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "CustomerAddress" SET "isDefault" = false WHERE "customerProfileId" = $1`,
          profile.id
        ).catch(() => null);
      }
    }

    const parsedLat = parseCoordinate(latitude);
    const parsedLng = parseCoordinate(longitude);

    // 4. Create Saved Address
    let address: any = null;
    if ((prisma as any).customerAddress?.create) {
      address = await (prisma as any).customerAddress.create({
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
    } else {
      const addrId = `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const rows: any = await prisma.$queryRawUnsafe(
        `INSERT INTO "CustomerAddress" ("id", "customerProfileId", "label", "zone", "streetDetails", "landmark", "latitude", "longitude", "isDefault", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        addrId,
        profile.id,
        String(label).trim(),
        String(zone).trim(),
        streetDetails ? String(streetDetails).trim() : null,
        landmark ? String(landmark).trim() : null,
        parsedLat,
        parsedLng,
        Boolean(isDefault)
      );
      address = Array.isArray(rows) && rows.length > 0 ? rows[0] : { id: addrId, label, zone };
    }

    // 5. Log activity
    if ((prisma as any).userActivityLog?.create) {
      await (prisma as any).userActivityLog.create({
        data: {
          userId: user.id,
          actionType: "SAVED_ADDRESS_ADDED",
          description: `Added address: ${address.label} (${address.zone})`,
          entityType: "ADDRESS",
        },
      }).catch(() => null);
    }

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

    const cleanPhone = (session.phone || "").trim();
    const phoneVariants = [
      cleanPhone,
      cleanPhone.replace("+233", "0"),
      cleanPhone.startsWith("0") ? "+233" + cleanPhone.slice(1) : null,
    ].filter(Boolean) as string[];

    const orConditions: any[] = [];
    if (isValidUuid(session.id)) orConditions.push({ id: session.id });
    phoneVariants.forEach((p) => orConditions.push({ phone: p }));

    const user = await prisma.user.findFirst({
      where: orConditions.length > 0 ? { OR: orConditions } : undefined,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.customerProfile.findFirst({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if ((prisma as any).customerAddress?.deleteMany) {
      await (prisma as any).customerAddress.deleteMany({
        where: {
          id: addressId,
          customerProfileId: profile.id,
        },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "CustomerAddress" WHERE "id" = $1 AND "customerProfileId" = $2`,
        addressId,
        profile.id
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
