import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/delivery/requests/[id]/status - Update delivery status lifecycle
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id: deliveryId } = await params;
    const { status, note, proofPhotoUrl, cancellationReason } = await req.json();

    const delivery = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found." }, { status: 404 });
    }

    const updateData: any = {
      status,
      ...(proofPhotoUrl ? { proofPhotoUrl } : {}),
      ...(cancellationReason ? { cancellationReason } : {}),
    };

    if (status === "PACKAGE_COLLECTED") {
      updateData.collectedAt = new Date();
    } else if (status === "DELIVERED" || status === "COMPLETED") {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.deliveryRequest.update({
      where: { id: deliveryId },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status,
            note: note || `Status updated to ${status}`,
            actorId: session.id,
            actorRole: session.role === "CUSTOMER" ? "CUSTOMER" : "PROVIDER",
          },
        },
      },
    });

    // Notify customer on key milestones
    if (["AT_PICKUP", "PACKAGE_COLLECTED", "IN_TRANSIT", "ARRIVING_AT_DESTINATION"].includes(status)) {
      await prisma.notification.create({
        data: {
          userId: delivery.customerId,
          title: `Delivery Update: ${status.replace(/_/g, " ")}`,
          message: `Your package #${delivery.trackingNumber} status is now: ${status.replace(/_/g, " ")}.`,
          link: `/delivery/track/${delivery.id}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery: updated,
    });
  } catch (error: any) {
    console.error("PATCH Delivery Status Error:", error);
    return NextResponse.json({ error: "Failed to update delivery status." }, { status: 500 });
  }
}
