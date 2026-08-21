import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      include: {
        services: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    // Fetch existing CRM leads for this business
    const leads = await prisma.businessLead.findMany({
      where: { businessId: profile.id },
      include: {
        quotes: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Stream incoming open service calls matching business trade tags or zone
    const incomingCalls = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ["OPEN", "PUBLISHED"] },
      },
      include: {
        customer: { select: { name: true, phone: true, avatarUrl: true } },
        service: true,
        location: true,
        quotes: { where: { providerId: session.id } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ leads, incomingCalls });
  } catch (error: any) {
    console.error("GET Business Leads Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessId, customerName, customerPhone, customerWhatsApp, serviceRequestId, notes } = body;

    if (!businessId || !customerName || !customerPhone) {
      return NextResponse.json({ error: "Business ID, customer name, and phone are required." }, { status: 400 });
    }

    const lead = await prisma.businessLead.create({
      data: {
        businessId,
        customerName,
        customerPhone,
        customerWhatsApp: customerWhatsApp || null,
        serviceRequestId: serviceRequestId || null,
        status: "NEW_INQUIRY",
        notes: notes || "Inquiry received via digital storefront.",
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("POST Business Lead Error:", error);
    return NextResponse.json({ error: "Failed to create lead inquiry." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { userId: session.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const { leadId, status, notes, quoteAmount } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required." }, { status: 400 });
    }

    const existingLead = await prisma.businessLead.findFirst({
      where: { id: leadId, businessId: profile.id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (quoteAmount !== undefined) updateData.quoteAmount = quoteAmount ? parseFloat(quoteAmount) : null;

    const lead = await prisma.businessLead.update({
      where: { id: leadId },
      data: updateData,
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("PATCH Business Lead Error:", error);
    return NextResponse.json({ error: "Failed to update lead." }, { status: 500 });
  }
}
