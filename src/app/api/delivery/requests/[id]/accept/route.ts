import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/delivery/requests/[id]/accept - Provider accepts job
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id: deliveryId } = await params;

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      include: { vehicles: true },
    });

    if (!provider || provider.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved verified providers can accept delivery jobs." },
        { status: 403 }
      );
    }

    const delivery = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery request not found." }, { status: 404 });
    }

    if (delivery.assignedProviderId && delivery.assignedProviderId !== provider.id) {
      return NextResponse.json(
        { error: "This delivery job has already been accepted by another provider." },
        { status: 409 }
      );
    }

    const activeVehicleId = provider.activeVehicleId || provider.vehicles[0]?.id;

    // Atomically accept delivery
    const updated = await prisma.deliveryRequest.update({
      where: { id: deliveryId },
      data: {
        assignedProviderId: provider.id,
        assignedVehicleId: activeVehicleId || null,
        status: "PROVIDER_ASSIGNED",
        acceptedAt: new Date(),
        statusHistory: {
          create: {
            status: "PROVIDER_ASSIGNED",
            note: `Accepted by delivery provider.`,
            actorId: session.id,
            actorRole: "PROVIDER",
          },
        },
      },
      include: {
        assignedProvider: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
    });

    // Notify Customer via Notification model
    await prisma.notification.create({
      data: {
        userId: delivery.customerId,
        title: "Delivery Provider Assigned! 🚚",
        message: `Your delivery request #${delivery.trackingNumber} was accepted by a nearby provider. Track progress live!`,
        link: `/delivery/track/${delivery.id}`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Delivery job accepted! Navigate to pickup location.",
      delivery: updated,
    });
  } catch (error: any) {
    console.error("POST Accept Delivery Job Error:", error);
    return NextResponse.json({ error: "Failed to accept delivery job." }, { status: 500 });
  }
}
