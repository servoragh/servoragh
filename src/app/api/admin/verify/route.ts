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
    const { providerId, status, badges, notes } = body; // status = VERIFIED, REJECTED

    if (!providerId || !status) {
      return NextResponse.json({ error: "Provider ID and verification status are required." }, { status: 400 });
    }

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
    }

    const existingBadges = JSON.parse(provider.badges || "[]");
    let updatedBadges = [...existingBadges];

    if (status === "VERIFIED") {
      if (!updatedBadges.includes("IDENTITY_VERIFIED")) updatedBadges.push("IDENTITY_VERIFIED");
      if (!updatedBadges.includes("BUSINESS_VERIFIED")) updatedBadges.push("BUSINESS_VERIFIED");
    }

    if (badges && Array.isArray(badges)) {
      updatedBadges = Array.from(new Set([...updatedBadges, ...badges]));
    }

    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        verificationStatus: status,
        badges: JSON.stringify(updatedBadges),
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: `VERIFY_PROVIDER_${status}`,
        details: `Provider "${provider.businessName}" (${provider.id}) verification status updated to ${status}. Notes: ${notes || "None"}`,
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        title: status === "VERIFIED" ? "🎉 Verification Approved!" : "Verification Update",
        message: status === "VERIFIED" 
          ? "Congratulations! Your artisan identity profile has been verified on Servora." 
          : `Your verification request was reviewed. Notes: ${notes || "Contact admin for details."}`,
        link: `/provider/${provider.slug}`,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Admin Verify Error:", error);
    return NextResponse.json({ error: "Verification update failed." }, { status: 500 });
  }
}
