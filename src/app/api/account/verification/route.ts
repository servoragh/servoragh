import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Please log in to view verification status." }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { phone: session.phone.replace("+233", "0") },
          { phone: "+233" + session.phone.replace(/^0/, "") },
        ],
      },
      include: {
        customerProfile: true,
        businessProfile: true,
        providerProfile: true,
        verificationRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const latestRequest = user.verificationRequests[0] || null;
    const isVerified =
      user.customerProfile?.verificationTier === "TIER_2_IDENTITY" ||
      user.customerProfile?.verificationTier === "TIER_3_ENTERPRISE" ||
      user.providerProfile?.verificationStatus === "VERIFIED" ||
      user.businessProfile?.verificationStatus === "TIER_2_VERIFIED_ARTISAN" ||
      user.businessProfile?.verificationStatus === "TIER_3_REGISTERED_ENTERPRISE";

    const isPending =
      latestRequest?.status === "PENDING" ||
      user.businessProfile?.verificationStatus === "PENDING_REVIEW" ||
      user.providerProfile?.verificationStatus === "PENDING";

    const tier = isVerified
      ? (user.businessProfile?.verificationStatus === "TIER_3_REGISTERED_ENTERPRISE" || user.customerProfile?.verificationTier === "TIER_3_ENTERPRISE" ? "TIER_3_GOLD" : "TIER_2_VERIFIED")
      : isPending
      ? "PENDING_REVIEW"
      : (user.isPhoneVerified ? "TIER_1_BASIC" : "UNVERIFIED");

    return NextResponse.json({
      success: true,
      tier,
      isVerified,
      isPending,
      latestRequest,
      ghanaCardNumber: user.businessProfile?.idCardNumber || latestRequest?.idNumber || "",
      documentUrl: user.businessProfile?.idCardPhotoUrl || latestRequest?.documentUrl || "",
      businessCertUrl: user.businessProfile?.businessCertUrl || "",
      storefrontPhotoUrl: user.businessProfile?.storefrontPhotoUrl || "",
    });
  } catch (error: any) {
    console.error("Fetch Verification Error:", error);
    return NextResponse.json({ error: "Failed to fetch verification status." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Please log in to submit Ghana Card verification." }, { status: 401 });
    }

    const body = await req.json();
    const {
      idType = "Ghana Card",
      idNumber,
      fullNameOnId,
      documentUrl,
      backDocumentUrl,
      businessCertUrl,
      storefrontPhotoUrl,
    } = body;

    if (!idNumber || !idNumber.trim()) {
      return NextResponse.json({ error: "Please enter your Ghana Card PIN number (e.g. GHA-123456789-0)." }, { status: 400 });
    }

    if (!documentUrl || !documentUrl.trim()) {
      return NextResponse.json({ error: "Please provide a photo URL or upload of your Ghana Card front." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { phone: session.phone.replace("+233", "0") },
          { phone: "+233" + session.phone.replace(/^0/, "") },
        ],
      },
      include: {
        businessProfile: true,
        providerProfile: true,
        customerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const userId = user.id;

    // 1. Create or Update VerificationRequest record in PostgreSQL
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId,
        idType,
        idNumber: idNumber.trim(),
        documentUrl: documentUrl.trim(),
        status: "PENDING",
        adminNotes: fullNameOnId ? `Full Name on ID: ${fullNameOnId}` : undefined,
      },
    });

    // 2. Update CustomerProfile
    await prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        verificationTier: "TIER_1_BASIC",
        defaultZone: "Tamale Central",
      },
      update: {
        verificationTier: "TIER_1_BASIC",
      },
    });

    // 3. Update BusinessProfile if merchant exists
    if (user.businessProfile) {
      await prisma.businessProfile.update({
        where: { id: user.businessProfile.id },
        data: {
          idCardNumber: idNumber.trim(),
          idCardPhotoUrl: documentUrl.trim(),
          businessCertUrl: businessCertUrl ? businessCertUrl.trim() : user.businessProfile.businessCertUrl,
          storefrontPhotoUrl: storefrontPhotoUrl ? storefrontPhotoUrl.trim() : user.businessProfile.storefrontPhotoUrl,
          verificationStatus: "PENDING_REVIEW",
        },
      });
    }

    // 4. Update ProviderProfile if artisan provider exists
    if (user.providerProfile) {
      await prisma.providerProfile.update({
        where: { id: user.providerProfile.id },
        data: {
          idDocumentUrl: documentUrl.trim(),
          businessCertUrl: businessCertUrl ? businessCertUrl.trim() : user.providerProfile.businessCertUrl,
          verificationStatus: "PENDING",
        },
      });
    }

    // 5. Log Activity
    await prisma.userActivityLog.create({
      data: {
        userId,
        actionType: "SUBMITTED_VERIFICATION",
        description: `Submitted Ghana Card ID (${idNumber}) for Admin Verification`,
        entityType: "VERIFICATION",
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "Ghana Card verification submitted successfully. Our Tamale admin team will review within 2-4 hours.",
      verificationRequest,
      tier: "PENDING_REVIEW",
    });
  } catch (error: any) {
    console.error("Verification Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit verification." }, { status: 500 });
  }
}
