import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            logoUrl: true,
            bio: true,
            serviceArea: true,
            ratingAverage: true,
            reviewCount: true,
            verificationStatus: true,
            user: {
              select: {
                name: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Get Product Error:", error);
    return NextResponse.json({ error: "Failed to load product details." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, description, price, originalPrice, stockQuantity, category, isAvailable, images } = body;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { provider: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({ where: { slug } });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: product.id } });

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
