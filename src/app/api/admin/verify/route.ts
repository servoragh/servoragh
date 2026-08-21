import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { targetId, providerId, targetType = "PROVIDER", status, notes } = body; // status = VERIFIED, REJECTED
    const entityId = targetId || providerId;

    if (!entityId || !status) {
      return NextResponse.json({ error: "Target ID and verification status are required." }, { status: 400 });
    }

    let updatedResult: any = null;
    let userIdToNotify: string | null = null;
    let entityName = "User Account";

    // 1. Target: Artisan Provider Profile
    if (targetType === "PROVIDER") {
      const provider = await prisma.providerProfile.findUnique({ where: { id: entityId } });
      if (!provider) return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });

      const existingBadges = JSON.parse(provider.badges || "[]");
      let updatedBadges = [...existingBadges];
      if (status === "VERIFIED") {
        if (!updatedBadges.includes("IDENTITY_VERIFIED")) updatedBadges.push("IDENTITY_VERIFIED");
        if (!updatedBadges.includes("BUSINESS_VERIFIED")) updatedBadges.push("BUSINESS_VERIFIED");
      }

      updatedResult = await prisma.providerProfile.update({
        where: { id: entityId },
        data: {
          verificationStatus: status,
          badges: JSON.stringify(updatedBadges),
        },
      });
      userIdToNotify = provider.userId;
      entityName = provider.businessName;
    }

    // 2. Target: Delivery Provider Profile
    else if (targetType === "DELIVERY") {
      const rider = await prisma.deliveryProviderProfile.findUnique({
        where: { id: entityId },
        include: { user: { select: { name: true } } },
      });
      if (!rider) return NextResponse.json({ error: "Delivery provider profile not found." }, { status: 404 });

      updatedResult = await prisma.deliveryProviderProfile.update({
        where: { id: entityId },
        data: { verificationStatus: status },
      });
      userIdToNotify = rider.userId;
      entityName = rider.user?.name || "Delivery Rider";
    }

    // 3. Target: Business Storefront Profile
    else if (targetType === "BUSINESS") {
      const business = await prisma.businessProfile.findUnique({ where: { id: entityId } });
      if (!business) return NextResponse.json({ error: "Business profile not found." }, { status: 404 });

      updatedResult = await prisma.businessProfile.update({
        where: { id: entityId },
        data: { verificationStatus: status === "VERIFIED" ? "TIER_2_VERIFIED_ARTISAN" : "REJECTED" },
      });
      userIdToNotify = business.userId;
      entityName = business.businessName;
    }

    // 4. Target: General User Verification Request
    else if (targetType === "REQUEST") {
      const req = await prisma.verificationRequest.findUnique({ where: { id: entityId } });
      if (!req) return NextResponse.json({ error: "Verification request not found." }, { status: 404 });

      updatedResult = await prisma.verificationRequest.update({
        where: { id: entityId },
        data: {
          status: status,
          adminNotes: notes || null,
        },
      });

      if (status === "VERIFIED") {
        await prisma.user.update({
          where: { id: req.userId },
          data: { isPhoneVerified: true },
        });
      }
      userIdToNotify = req.userId;
      entityName = "General User Request";
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: `VERIFY_${targetType}_${status}`,
        details: `Verification status for "${entityName}" (${entityId}) updated to ${status}. Notes: ${notes || "None"}`,
      },
    });

    // Notify user
    if (userIdToNotify) {
      await prisma.notification.create({
        data: {
          userId: userIdToNotify,
          title: status === "VERIFIED" ? "🎉 Verification Approved!" : "⚠️ Verification Status Update",
          message: status === "VERIFIED"
            ? `Congratulations! Your identity credentials for "${entityName}" have been approved on Servora.`
            : `Your verification request was reviewed: ${notes || "Documentation rejected. Please resubmit clear Ghana Card ID."}`,
          link: "/dashboard",
        },
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, result: updatedResult });
  } catch (error: any) {
    console.error("Admin Verify Error:", error);
    return NextResponse.json({ error: "Verification update failed." }, { status: 500 });
  }
}
