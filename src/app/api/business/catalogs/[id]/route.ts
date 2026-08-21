import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { itemType, price, originalPrice, stockQuantity, inventoryStatus, isAvailable, isActive, dailyRate, weeklyRate } = body;

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    if (itemType === "product") {
      const existing = await prisma.productListing.findFirst({
        where: { id, businessId: profile.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }

      const updateData: any = {};
      if (price !== undefined) updateData.price = parseFloat(price);
      if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
      if (stockQuantity !== undefined) {
        const stockNum = parseInt(stockQuantity);
        updateData.stockQuantity = stockNum;
        if (inventoryStatus === undefined) {
          updateData.inventoryStatus = stockNum === 0 ? "SOLD_OUT" : stockNum < 3 ? "LOW_STOCK" : "IN_STOCK";
        }
      }
      if (inventoryStatus !== undefined) updateData.inventoryStatus = inventoryStatus;
      if (isAvailable !== undefined) updateData.status = isAvailable ? "ACTIVE" : "EXPIRED";

      const updated = await prisma.productListing.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, item: updated });
    } else if (itemType === "rental") {
      const existing = await prisma.toolRentalListing.findFirst({
        where: { id, businessId: profile.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Tool rental item not found." }, { status: 404 });
      }

      const updateData: any = {};
      if (dailyRate !== undefined) updateData.dailyRate = parseFloat(dailyRate);
      if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate ? parseFloat(weeklyRate) : null;
      if (inventoryStatus !== undefined) updateData.status = inventoryStatus;
      if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

      const updated = await prisma.toolRentalListing.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, item: updated });
    } else if (itemType === "service") {
      const existing = await prisma.businessService.findFirst({
        where: { id, businessId: profile.id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Service item not found." }, { status: 404 });
      }

      const updateData: any = {};
      if (price !== undefined) updateData.startingPrice = parseFloat(price);
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const updated = await prisma.businessService.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "Invalid itemType provided." }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH Business Catalog Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update catalog item." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("itemType") || "product";

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    if (itemType === "product") {
      await prisma.productListing.deleteMany({
        where: { id, businessId: profile.id },
      });
    } else if (itemType === "rental") {
      await prisma.toolRentalListing.deleteMany({
        where: { id, businessId: profile.id },
      });
    } else if (itemType === "service") {
      await prisma.businessService.deleteMany({
        where: { id, businessId: profile.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Business Catalog Item Error:", error);
    return NextResponse.json({ error: "Failed to delete catalog item." }, { status: 500 });
  }
}
