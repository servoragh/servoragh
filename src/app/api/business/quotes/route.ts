import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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
      return NextResponse.json({ error: "Business profile required to send quotes." }, { status: 400 });
    }

    const body = await req.json();
    const { leadId, serviceRequestId, laborCost, materialsCost, estimatedTimeline, notes } = body;

    if (!laborCost || !estimatedTimeline) {
      return NextResponse.json({ error: "Labor cost and estimated timeline are required." }, { status: 400 });
    }

    const labor = parseFloat(laborCost);
    const materials = materialsCost ? parseFloat(materialsCost) : 0;
    const totalAmount = labor + materials;

    const quote = await prisma.serviceQuote.create({
      data: {
        businessId: profile.id,
        leadId: leadId || null,
        serviceRequestId: serviceRequestId || null,
        laborCost: labor,
        materialsCost: materials,
        totalAmount,
        estimatedTimeline,
        notes: notes || null,
        status: "SENT",
      },
    });

    // Update associated lead status if leadId was provided
    if (leadId) {
      await prisma.businessLead.update({
        where: { id: leadId },
        data: {
          status: "QUOTE_SENT",
          quoteAmount: totalAmount,
        },
      });
    }

    // Also create legacy Service Request Quote if serviceRequestId is provided
    if (serviceRequestId) {
      const existingQuote = await prisma.quote.findFirst({
        where: { requestId: serviceRequestId, providerId: session.id },
      });

      if (!existingQuote) {
        await prisma.quote.create({
          data: {
            requestId: serviceRequestId,
            providerId: session.id,
            price: totalAmount,
            estimatedHours: 4,
            completionTime: estimatedTimeline,
            message: notes || `Itemized Quote: Labor GHS ${labor} + Materials GHS ${materials}`,
            status: "PENDING",
          },
        });
      }
    }

    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    console.error("POST Service Quote Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create quote proposal." }, { status: 500 });
  }
}
