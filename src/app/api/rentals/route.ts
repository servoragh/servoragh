import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const rentals = await prisma.rentalTool.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            businessName: true,
            slug: true,
            serviceArea: true,
            ratingAverage: true,
            logoUrl: true,
            user: { select: { phone: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rentals });
  } catch (error: any) {
    console.error("Fetch Rentals Error:", error);
    return NextResponse.json({ error: "Failed to fetch rental tools." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to list equipment for rent." }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, dailyRate, description, images, locationArea } = body;

    if (!title || !dailyRate) {
      return NextResponse.json({ error: "Title and daily rate are required." }, { status: 400 });
    }

    // Check if user has a provider profile, else find or create one
    let provider = await prisma.providerProfile.findFirst({
      where: { userId: session.id },
    });

    if (!provider) {
      const slug = `artisan-${session.id.slice(0, 8)}`;
      provider = await prisma.providerProfile.create({
        data: {
          userId: session.id,
          businessName: session.name,
          slug,
          bio: "Verified Equipment Supplier",
          serviceArea: locationArea || "Sakasaka, Tamale",
        },
      });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newRental = await prisma.rentalTool.create({
      data: {
        providerId: provider.id,
        title,
        slug,
        category: category || "Heavy Equipment",
        dailyRate: Number(dailyRate),
        description: description || "",
        images: JSON.stringify(images || []),
        isAvailable: true,
      },
      include: {
        provider: {
          select: {
            businessName: true,
            serviceArea: true,
            user: { select: { phone: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, rental: newRental });
  } catch (error: any) {
    console.error("Create Rental Equipment Error:", error);
    return NextResponse.json({ error: "Failed to list rental equipment." }, { status: 500 });
  }
}
