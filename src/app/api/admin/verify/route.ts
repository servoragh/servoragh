import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const [businessProfiles, verificationRequests, deliveryProfiles, providerProfiles] = await Promise.all([
      prisma.businessProfile.findMany({
        where: {
          OR: [
            { idCardNumber: { not: null } },
            { idCardPhotoUrl: { not: null } },
            { businessCertUrl: { not: null } },
            { storefrontPhotoUrl: { not: null } },
            { verificationStatus: { in: ["PENDING_REVIEW", "TIER_2_VERIFIED_ARTISAN", "TIER_3_REGISTERED_ENTERPRISE", "REJECTED"] } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.verificationRequest.findMany({
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.deliveryProviderProfile.findMany({
        where: {
          OR: [
            { idNumber: { not: null } },
            { idDocumentUrl: { not: null } },
            { selfieUrl: { not: null } },
            { verificationStatus: { in: ["UNDER_REVIEW", "SUBMITTED", "APPROVED", "REJECTED"] } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.providerProfile.findMany({
        where: {
          verificationStatus: { in: ["PENDING", "VERIFIED", "REJECTED"] },
        },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const queue: any[] = [];
    const seenUserIds = new Set<string>();

    // 1. Business Profiles
    for (const b of businessProfiles) {
      seenUserIds.add(b.userId);
      const isVerified = b.verificationStatus === "TIER_2_VERIFIED_ARTISAN" || b.verificationStatus === "TIER_3_REGISTERED_ENTERPRISE";
      const isRejected = b.verificationStatus === "REJECTED";
      const status = isVerified ? "VERIFIED" : isRejected ? "REJECTED" : "PENDING";

      queue.push({
        id: b.id,
        userId: b.userId,
        targetType: "BUSINESS",
        name: b.businessName,
        phone: b.phone || b.whatsappNumber || b.user?.phone || "",
        idType: b.businessCertUrl ? "Business Cert (RGD/ORC)" : b.idCardNumber ? "Ghana Card (National ID)" : "Business KYC",
        idNumber: b.idCardNumber || b.tinNumber || "Not Specified",
        documentUrl: b.idCardPhotoUrl || b.businessCertUrl || b.storefrontPhotoUrl || null,
        selfieUrl: b.user?.avatarUrl || null,
        businessCertUrl: b.businessCertUrl || null,
        storefrontPhotoUrl: b.storefrontPhotoUrl || null,
        area: b.zone || "Tamale",
        status,
        createdAt: b.createdAt.toISOString(),
      });
    }

    // 2. Verification Requests (General)
    for (const vr of verificationRequests) {
      if (seenUserIds.has(vr.userId)) continue;
      seenUserIds.add(vr.userId);

      queue.push({
        id: vr.id,
        userId: vr.userId,
        targetType: "REQUEST",
        name: vr.user?.name || "User Account",
        phone: vr.user?.phone || "",
        idType: vr.idType || "Ghana Card",
        idNumber: vr.idNumber || "Not Specified",
        documentUrl: vr.documentUrl || null,
        selfieUrl: vr.user?.avatarUrl || null,
        businessCertUrl: null,
        storefrontPhotoUrl: null,
        area: "Tamale",
        status: vr.status || "PENDING",
        createdAt: vr.createdAt.toISOString(),
      });
    }

    // 3. Delivery Providers (Riders)
    for (const d of deliveryProfiles) {
      if (seenUserIds.has(d.userId)) continue;
      seenUserIds.add(d.userId);

      const status = d.verificationStatus === "APPROVED" ? "VERIFIED" : d.verificationStatus === "REJECTED" ? "REJECTED" : "PENDING";
      queue.push({
        id: d.id,
        userId: d.userId,
        targetType: "DELIVERY",
        name: d.user?.name || "Delivery Courier",
        phone: d.user?.phone || "",
        idType: d.idType || "Ghana Card & Driver License",
        idNumber: d.idNumber || "Not Specified",
        documentUrl: d.idDocumentUrl || null,
        selfieUrl: d.selfieUrl || d.user?.avatarUrl || null,
        businessCertUrl: null,
        storefrontPhotoUrl: null,
        area: d.residentialAddress || "Tamale",
        status,
        createdAt: d.createdAt.toISOString(),
      });
    }

    // 4. Provider Profiles (Artisans)
    for (const p of providerProfiles) {
      if (seenUserIds.has(p.userId)) continue;
      seenUserIds.add(p.userId);

      queue.push({
        id: p.id,
        userId: p.userId,
        targetType: "PROVIDER",
        name: p.businessName || p.user?.name || "Artisan",
        phone: p.user?.phone || "",
        idType: "Artisan Profile",
        idNumber: "Not Specified",
        documentUrl: null,
        selfieUrl: p.user?.avatarUrl || null,
        businessCertUrl: null,
        storefrontPhotoUrl: null,
        area: p.serviceArea || "Tamale",
        status: p.verificationStatus || "PENDING",
        createdAt: p.createdAt.toISOString(),
      });
    }

    return NextResponse.json({ success: true, queue });
  } catch (error: any) {
    console.error("GET Admin Verification Queue Error:", error);
    return NextResponse.json({ error: "Failed to load verification queue." }, { status: 500 });
  }
}

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
