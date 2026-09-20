import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        action: { startsWith: "RECYCLE_BIN" },
        ...(session.role === "ADMIN" ? {} : session.id ? { userId: session.id } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const items = logs
      .map((log) => {
        try {
          const parsed = JSON.parse(log.details);
          return {
            trashId: log.id,
            originalId: parsed.originalId,
            itemType: parsed.itemType || "product",
            title: parsed.title || "Untitled Item",
            category: parsed.category || "General",
            price: parsed.price || 0,
            images: parsed.images || [],
            deletedAt: parsed.deletedAt || log.createdAt.toISOString(),
            deletedBy: parsed.deletedBy || "Merchant",
            snapshot: parsed.snapshot,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("GET Recycle Bin Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load recycle bin." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { action, trashId } = body;

    if (action === "restore" && trashId) {
      const log = await prisma.auditLog.findUnique({
        where: { id: trashId },
      });

      if (!log) {
        return NextResponse.json({ error: "Item not found in Recycle Bin." }, { status: 404 });
      }

      const parsed = JSON.parse(log.details);
      const { itemType, snapshot } = parsed;

      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId: session.id },
      });
      const providerProfile = await prisma.providerProfile.findFirst({
        where: { userId: session.id },
      });

      // Restore based on itemType
      if (itemType === "product") {
        const uniqueSlug = `${(snapshot.slug || snapshot.title || "restored-product")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-4)}`;

        if (businessProfile) {
          await prisma.productListing.create({
            data: {
              title: snapshot.title || "Restored Product",
              slug: uniqueSlug,
              description: snapshot.description || "",
              category: snapshot.category || "General",
              price: Number(snapshot.price || 0),
              originalPrice: snapshot.originalPrice ? Number(snapshot.originalPrice) : null,
              stockQuantity: snapshot.stockQuantity || 1,
              images: Array.isArray(snapshot.images) ? snapshot.images : [],
              area: snapshot.area || "Tamale Central",
              deliveryOptions: snapshot.deliveryOptions || ["PICKUP"],
              businessId: businessProfile.id,
              sellerId: session.id,
              status: "ACTIVE",
            },
          });
        } else if (providerProfile) {
          await prisma.product.create({
            data: {
              providerId: providerProfile.id,
              title: snapshot.title || "Restored Product",
              slug: uniqueSlug,
              description: snapshot.description || "",
              category: snapshot.category || "General",
              price: Number(snapshot.price || 0),
              originalPrice: snapshot.originalPrice ? Number(snapshot.originalPrice) : null,
              stockQuantity: snapshot.stockQuantity || 1,
              images: JSON.stringify(Array.isArray(snapshot.images) ? snapshot.images : []),
              isAvailable: true,
            },
          });
        }
      } else if (itemType === "rental" && businessProfile) {
        const uniqueSlug = `${(snapshot.slug || snapshot.title || "restored-rental")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-4)}`;

        await prisma.toolRentalListing.create({
          data: {
            title: snapshot.title || "Restored Rental",
            slug: uniqueSlug,
            description: snapshot.description || "",
            category: snapshot.category || "Equipment & Tools",
            dailyRate: Number(snapshot.dailyRate || snapshot.price || 0),
            weeklyRate: snapshot.weeklyRate ? Number(snapshot.weeklyRate) : null,
            securityDeposit: snapshot.securityDeposit ? Number(snapshot.securityDeposit) : 0,
            operatorIncluded: Boolean(snapshot.operatorIncluded),
            images: Array.isArray(snapshot.images) ? snapshot.images : [],
            businessId: businessProfile.id,
            status: "ACTIVE",
          },
        });
      } else if (itemType === "service" && businessProfile) {
        await prisma.businessService.create({
          data: {
            businessId: businessProfile.id,
            serviceName: snapshot.serviceName || snapshot.title || "Restored Service",
            description: snapshot.description || "",
            startingPrice: Number(snapshot.startingPrice || snapshot.price || 0),
            estimatedDuration: snapshot.estimatedDuration || "1-2 hours",
            portfolioPhotos: Array.isArray(snapshot.portfolioPhotos)
              ? snapshot.portfolioPhotos
              : Array.isArray(snapshot.images)
              ? snapshot.images
              : [],
            isActive: true,
          },
        });
      }

      // Remove from AuditLog recycle bin
      await prisma.auditLog.delete({
        where: { id: trashId },
      });

      return NextResponse.json({ success: true, message: "Item restored successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("POST Recycle Bin Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process recycle bin action." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trashId = searchParams.get("trashId");
    const action = searchParams.get("action");

    if (action === "empty") {
      await prisma.auditLog.deleteMany({
        where: {
          action: { startsWith: "RECYCLE_BIN" },
          ...(session.role === "ADMIN" ? {} : session.id ? { userId: session.id } : {}),
        },
      });
      return NextResponse.json({ success: true, message: "Recycle bin emptied." });
    }

    if (trashId) {
      await prisma.auditLog.deleteMany({
        where: {
          id: trashId,
          ...(session.role === "ADMIN" ? {} : session.id ? { userId: session.id } : {}),
        },
      });
      return NextResponse.json({ success: true, message: "Item deleted permanently." });
    }

    return NextResponse.json({ error: "trashId or action=empty required." }, { status: 400 });
  } catch (error: any) {
    console.error("DELETE Recycle Bin Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete from recycle bin." }, { status: 500 });
  }
}
