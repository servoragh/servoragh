import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/delivery/requests/[id]/verify-otp - Recipient PIN OTP Verification & Earnings Settlement
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id: deliveryId } = await params;
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: "4-Digit Delivery PIN OTP is required." }, { status: 400 });
    }

    const delivery = await prisma.deliveryRequest.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery request not found." }, { status: 404 });
    }

    if (delivery.deliveryPin.trim() !== pin.toString().trim()) {
      return NextResponse.json(
        { error: "Invalid Delivery PIN. Please ask the recipient for the 4-digit verification code." },
        { status: 400 }
      );
    }

    // OTP Validated! Update delivery to DELIVERED & COMPLETED
    const completedDelivery = await prisma.deliveryRequest.update({
      where: { id: deliveryId },
      data: {
        status: "COMPLETED",
        paymentStatus: "PAID",
        deliveredAt: new Date(),
        statusHistory: {
          create: {
            status: "COMPLETED",
            note: "Recipient PIN OTP verified successfully by provider.",
            actorId: session.id,
            actorRole: "PROVIDER",
          },
        },
      },
    });

    // Credit Provider Wallet & Earnings
    if (delivery.assignedProviderId) {
      const netEarnings = Number(delivery.providerEarnings || 0);
      await prisma.deliveryProviderProfile.update({
        where: { id: delivery.assignedProviderId },
        data: {
          walletBalance: { increment: netEarnings },
          totalEarnings: { increment: netEarnings },
          completedDeliveriesCount: { increment: 1 },
        },
      }).catch(() => {});
    }

    // Notify Customer
    await prisma.notification.create({
      data: {
        userId: delivery.customerId,
        title: "Package Delivered Successfully! 🎉",
        message: `Your package #${delivery.trackingNumber} has been delivered and confirmed with OTP PIN. Please rate your delivery provider!`,
        link: `/delivery/track/${delivery.id}`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Delivery PIN verified! Package marked COMPLETED and earnings credited to your wallet balance.",
      delivery: completedDelivery,
    });
  } catch (error: any) {
    console.error("POST Verify Delivery OTP Error:", error);
    return NextResponse.json({ error: "Failed to verify delivery OTP PIN." }, { status: 500 });
  }
}
