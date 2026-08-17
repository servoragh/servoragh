import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to access your business portal." }, { status: 401 });
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.id },
      include: {
        services: {
          include: { service: true },
        },
        products: {
          orderBy: { createdAt: "desc" },
        },
        rentalTools: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!providerProfile && session.role !== "ADMIN") {
      return NextResponse.json({ error: "No provider profile found. Please register as a service business." }, { status: 404 });
    }

    // Fetch incoming service requests matching provider's services
    const serviceIds = providerProfile?.services.map((s) => s.serviceId) || [];
    const incomingRequests = await prisma.serviceRequest.findMany({
      where: {
        serviceId: { in: serviceIds },
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
      profile: providerProfile,
      incomingRequests,
      submittedQuotes,
    });
  } catch (error: any) {
    console.error("Business Portal API Error:", error);
    return NextResponse.json({ error: "Failed to load business portal data." }, { status: 500 });
  }
}
