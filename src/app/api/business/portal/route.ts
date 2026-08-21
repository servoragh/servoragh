import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to access your business portal." }, { status: 401 });
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      include: {
        products: { orderBy: { createdAt: "desc" } },
        services: { orderBy: { createdAt: "desc" } },
        rentals: { orderBy: { createdAt: "desc" } },
        leads: { orderBy: { createdAt: "desc" } },
        quotes: { orderBy: { createdAt: "desc" } },
      },
    });

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.id },
      include: {
        services: { include: { service: true } },
        products: { orderBy: { createdAt: "desc" } },
        rentalTools: { orderBy: { createdAt: "desc" } },
      },
    });

    // Fetch incoming community service calls
    const incomingRequests = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ["OPEN", "PUBLISHED"] },
      },
      include: {
        customer: { select: { name: true, phone: true, avatarUrl: true } },
        service: true,
        location: true,
        quotes: {
          where: { providerId: session.id },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch submitted quotes
    const submittedQuotes = await prisma.quote.findMany({
      where: { providerId: session.id },
      include: {
        request: {
          include: {
            customer: { select: { name: true, phone: true } },
            service: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      businessProfile,
      providerProfile,
      incomingRequests,
      submittedQuotes,
    });
  } catch (error: any) {
    console.error("Business Portal API Error:", error);
    return NextResponse.json({ error: "Failed to load business portal data." }, { status: 500 });
  }
}
