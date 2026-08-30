import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      itemType,
      title,
      description,
      category,
      sku,
      videoUrl,
      images,
      price,
      originalPrice,
      stockQuantity,
      inventoryStatus,
      isAvailable,
      dailyRate,
      weeklyRate,
      securityDeposit,
      operatorIncluded,
      serviceName,
      startingPrice,
      estimatedDuration,
      portfolioPhotos,
      isActive,
    } = body;

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });
    const providerProfile = await prisma.providerProfile.findFirst({
      where: { userId: session.id },
      select: { id: true },
    });

    const isAdmin = session.role === "ADMIN" || (session as any).role === "SUPER_ADMIN";

    if (itemType === "product" || !itemType) {
      const existing = await prisma.productListing.findFirst({
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { sellerId: session.id }),
        },
      });

      if (!existing) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            id,
            ...(isAdmin
              ? {}
              : providerProfile
              ? { providerId: providerProfile.id }
              : { id: "none" }),
          },
        });

        if (existingProduct) {
          const updateData: any = {};
          if (title !== undefined) updateData.title = title;
          if (description !== undefined) updateData.description = description;
          if (category !== undefined) updateData.category = category;
          if (price !== undefined) updateData.price = parseFloat(price);
          if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
          if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
          if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];

          const updatedProd = await prisma.product.update({
            where: { id },
            data: updateData,
          });
          return NextResponse.json({ success: true, item: updatedProd });
        }

        return NextResponse.json({ error: "Product not found or unauthorized." }, { status: 404 });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (sku !== undefined) updateData.sku = sku;
      if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
      if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];
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
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { id: "none" }),
        },
      });

      if (!existing) {
        const existingRentalTool = await prisma.rentalTool.findFirst({
          where: {
            id,
            ...(isAdmin ? {} : providerProfile ? { providerId: providerProfile.id } : { id: "none" }),
          },
        });

        if (existingRentalTool) {
          const updateData: any = {};
          if (title !== undefined) updateData.title = title;
          if (description !== undefined) updateData.description = description;
          if (category !== undefined) updateData.category = category;
          if (dailyRate !== undefined || price !== undefined) updateData.dailyRate = parseFloat(dailyRate || price);
          if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];

          const updatedTool = await prisma.rentalTool.update({
            where: { id },
            data: updateData,
          });
          return NextResponse.json({ success: true, item: updatedTool });
        }

        return NextResponse.json({ error: "Tool rental item not found." }, { status: 404 });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (dailyRate !== undefined || price !== undefined) updateData.dailyRate = parseFloat(dailyRate || price);
      if (weeklyRate !== undefined) updateData.weeklyRate = weeklyRate ? parseFloat(weeklyRate) : null;
      if (securityDeposit !== undefined) updateData.securityDeposit = securityDeposit ? parseFloat(securityDeposit) : null;
      if (operatorIncluded !== undefined) updateData.operatorIncluded = Boolean(operatorIncluded);
      if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];
      if (inventoryStatus !== undefined) updateData.status = inventoryStatus;
      if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

      const updated = await prisma.toolRentalListing.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, item: updated });
    } else if (itemType === "service") {
      const existing = await prisma.businessService.findFirst({
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { id: "none" }),
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Service item not found." }, { status: 404 });
      }

      const updateData: any = {};
      if (serviceName !== undefined || title !== undefined) updateData.serviceName = serviceName || title;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined || startingPrice !== undefined) updateData.startingPrice = parseFloat(price || startingPrice);
      if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
      if (portfolioPhotos !== undefined || images !== undefined) {
        updateData.portfolioPhotos = portfolioPhotos || images;
      }
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
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("itemType") || "product";

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });
    const providerProfile = await prisma.providerProfile.findFirst({
      where: { userId: session.id },
      select: { id: true },
    });

    const isAdmin = session.role === "ADMIN" || (session as any).role === "SUPER_ADMIN";

    if (itemType === "product") {
      await prisma.productListing.deleteMany({
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { sellerId: session.id }),
        },
      });

      await prisma.product.deleteMany({
        where: {
          id,
          ...(isAdmin
            ? {}
            : providerProfile
            ? { providerId: providerProfile.id }
            : { id: "none" }),
        },
      });
    } else if (itemType === "rental") {
      await prisma.toolRentalListing.deleteMany({
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { id: "none" }),
        },
      });

      await prisma.rentalTool.deleteMany({
        where: {
          id,
          ...(isAdmin ? {} : providerProfile ? { providerId: providerProfile.id } : { id: "none" }),
        },
      });
    } else if (itemType === "service") {
      await prisma.businessService.deleteMany({
        where: {
          id,
          ...(isAdmin
            ? {}
            : businessProfile
            ? { businessId: businessProfile.id }
            : { id: "none" }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Business Catalog Item Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete catalog item." }, { status: 500 });
  }
}
