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
        products: { orderBy: { createdAt: "desc" } },
        services: { orderBy: { createdAt: "desc" } },
        rentals: { orderBy: { createdAt: "desc" } },
        leads: { orderBy: { createdAt: "desc" }, take: 20 },
        quotes: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("GET Business Profile Error:", error);
    return NextResponse.json({ error: "Failed to fetch business profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      slug,
      tagline,
      description,
      businessType,
      logoUrl,
      bannerUrl,
      zone,
      addressDetails,
      landmark,
      latitude,
      longitude,
      phone,
      whatsappNumber,
      email,
      businessHours,
      idCardNumber,
      idCardPhotoUrl,
      selfieUrl,
      businessCertUrl,
      tinNumber,
      tradeAssociation,
      storefrontPhotoUrl,
      instagramUrl,
      facebookUrl,
    } = body;

    if (!businessName || !phone || !whatsappNumber) {
      return NextResponse.json(
        { error: "Business name, phone, and WhatsApp numbers are required." },
        { status: 400 }
      );
    }

    if (selfieUrl) {
      await prisma.user.update({
        where: { id: session.id },
        data: { avatarUrl: selfieUrl },
      }).catch(() => null);
    }

    // Generate or format slug
    const cleanSlug = (slug || businessName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness if changed
    const existing = await prisma.businessProfile.findFirst({
      where: {
        slug: cleanSlug,
        NOT: { userId: session.id },
      },
    });

    const finalSlug = existing ? `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}` : cleanSlug;

    // Determine verification status based on submitted documents
    let verificationStatus: "UNVERIFIED" | "TIER_1_BASIC" | "TIER_2_VERIFIED_ARTISAN" | "TIER_3_REGISTERED_ENTERPRISE" | "PENDING_REVIEW" = "TIER_1_BASIC";

    if (idCardNumber || idCardPhotoUrl || businessCertUrl || tinNumber) {
      verificationStatus = "PENDING_REVIEW";
    }

    const profile = await prisma.businessProfile.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        businessName,
        slug: finalSlug,
        tagline: tagline || null,
        description: description || "",
        businessType: businessType || "SOLO_ARTISAN",
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        zone: zone || "Tamale Central",
        addressDetails: addressDetails || null,
        landmark: landmark || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        whatsappNumber,
        email: email || session.email || null,
        businessHours: businessHours || null,
        verificationStatus,
        idCardNumber: idCardNumber || null,
        idCardPhotoUrl: idCardPhotoUrl || null,
        businessCertUrl: businessCertUrl || null,
        tinNumber: tinNumber || null,
        tradeAssociation: tradeAssociation || null,
        storefrontPhotoUrl: storefrontPhotoUrl || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
      },
      update: {
        businessName,
        slug: finalSlug,
        tagline: tagline || null,
        description: description || "",
        businessType: businessType || "SOLO_ARTISAN",
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        zone: zone || "Tamale Central",
        addressDetails: addressDetails || null,
        landmark: landmark || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        whatsappNumber,
        email: email || null,
        businessHours: businessHours || null,
        verificationStatus,
        idCardNumber: idCardNumber || null,
        idCardPhotoUrl: idCardPhotoUrl || null,
        businessCertUrl: businessCertUrl || null,
        tinNumber: tinNumber || null,
        tradeAssociation: tradeAssociation || null,
        storefrontPhotoUrl: storefrontPhotoUrl || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
      },
    });

    // Also sync verification request record
    if (idCardNumber || idCardPhotoUrl || businessCertUrl) {
      const existingReq = await prisma.verificationRequest.findFirst({
        where: { userId: session.id },
      });
      if (existingReq) {
        await prisma.verificationRequest.update({
          where: { id: existingReq.id },
          data: {
            idType: businessCertUrl ? "Business Cert (RGD/ORC)" : "Ghana Card",
            idNumber: idCardNumber || tinNumber || "Submitted",
            documentUrl: idCardPhotoUrl || businessCertUrl || existingReq.documentUrl || "",
            status: "PENDING",
          },
        });
      } else {
        await prisma.verificationRequest.create({
          data: {
            userId: session.id,
            idType: businessCertUrl ? "Business Cert (RGD/ORC)" : "Ghana Card",
            idNumber: idCardNumber || tinNumber || "Submitted",
            documentUrl: idCardPhotoUrl || businessCertUrl || "",
            status: "PENDING",
          },
        });
      }
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("POST Business Profile Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save business profile." }, { status: 500 });
  }
}
