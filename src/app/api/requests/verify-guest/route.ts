import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, claimToken, otpCode } = body;

    if (!requestId || (!claimToken && !otpCode)) {
      return NextResponse.json({ error: "Request ID and OTP code or claim token are required." }, { status: 400 });
    }

    const serviceReq = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { customer: true },
    });

    if (!serviceReq) {
      return NextResponse.json({ error: "Service request not found." }, { status: 404 });
    }

    // Validate OTP Code or Claim Token
    const isOtpMatch = otpCode && serviceReq.guestOtpCode === otpCode.trim();
    const isTokenMatch = claimToken && serviceReq.guestClaimToken === claimToken.trim();

    if (!isOtpMatch && !isTokenMatch) {
      return NextResponse.json({ error: "Invalid verification code or claim token." }, { status: 400 });
    }

    // Publish job request & verify guest
    const updatedReq = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: "PUBLISHED",
        isVerifiedGuest: true,
      },
    });

    // Auto-syndicate to Community Board Feed
    try {
      await prisma.communityPost.upsert({
        where: { serviceRequestId: updatedReq.id },
        update: { status: "OPEN" },
        create: {
          serviceRequestId: updatedReq.id,
          category: "SERVICE_REQUEST",
          title: updatedReq.title,
          content: updatedReq.description,
          area: updatedReq.landmark || "ALL_TAMALE",
          authorId: serviceReq.customer.id,
          allowWhatsApp: true,
          allowDirectCall: true,
        },
      });
    } catch (e) {}

    // Notify matching service providers
    const providers = await prisma.providerProfile.findMany({ select: { userId: true } });
    for (const p of providers) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          title: "New Verified Job Request in Tamale!",
          message: `Verified Request: "${updatedReq.title}". View details and quote!`,
          link: `/requests/${updatedReq.id}`,
        },
      });
    }

    // Generate Session Cookie for Guest User
    await setSessionCookie({
      id: serviceReq.customer.id,
      name: serviceReq.customer.name,
      phone: serviceReq.customer.phone,
      role: (serviceReq.customer.role as "CUSTOMER" | "PROVIDER" | "ADMIN") || "CUSTOMER",
      isPhoneVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: "Guest request verified and published successfully!",
      request: updatedReq,
      user: serviceReq.customer,
    });
  } catch (error: any) {
    console.error("Verify Guest Request Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify guest request." }, { status: 500 });
  }
}
