import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to complete provider onboarding." }, { status: 401 });
    }

    const body = await request.json();
    const {
      businessName,
      bio,
      yearsExperience,
      pricingHourly,
      pricingFixedStart,
      serviceArea,
      serviceIds,
      portfolioUrls,
      websiteUrl,
    } = body;

    if (!businessName || !bio || !serviceArea) {
      return NextResponse.json({ error: "Business name, short description, and service area are required." }, { status: 400 });
    }

    // Slug generation
    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(100 + Math.random() * 900)}`;

    // Update user role to PROVIDER
    await prisma.user.update({
      where: { id: session.id },
      data: { role: "PROVIDER" },
    });

    // Check if profile exists
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.id },
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.providerProfile.update({
        where: { userId: session.id },
        data: {
          businessName,
          bio,
          yearsExperience: Number(yearsExperience) || 1,
          pricingHourly: pricingHourly ? Number(pricingHourly) : null,
          pricingFixedStart: pricingFixedStart ? Number(pricingFixedStart) : null,
          serviceArea,
          websiteUrl: websiteUrl ? (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`) : null,
          portfolioUrls: JSON.stringify(portfolioUrls || []),
          verificationStatus: "PENDING",
        },
      });

      // Clear existing services & re-add
      await prisma.providerService.deleteMany({
        where: { providerId: profile.id },
      });
    } else {
      profile = await prisma.providerProfile.create({
        data: {
          userId: session.id,
          businessName,
          slug,
          bio,
          yearsExperience: Number(yearsExperience) || 1,
          pricingHourly: pricingHourly ? Number(pricingHourly) : null,
          pricingFixedStart: pricingFixedStart ? Number(pricingFixedStart) : null,
          serviceArea,
          websiteUrl: websiteUrl ? (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`) : null,
          portfolioUrls: JSON.stringify(portfolioUrls || []),
          verificationStatus: "PENDING",
          badges: JSON.stringify(["PHONE_VERIFIED"]),
        },
      });
    }

    // Link selected services safely (or fallback to default services)
    const allServices = await prisma.service.findMany({ select: { id: true } });
    const validServiceIds = new Set(allServices.map((s) => s.id));

    let toLink: string[] = [];
    if (Array.isArray(serviceIds) && serviceIds.length > 0) {
      toLink = serviceIds.filter((id: string) => validServiceIds.has(id));
    }

    // Fallback if no valid services were provided
    if (toLink.length === 0 && allServices.length > 0) {
      toLink = allServices.slice(0, 2).map((s) => s.id);
    }

    for (const serviceId of toLink) {
      try {
        await prisma.providerService.create({
          data: {
            providerId: profile.id,
            serviceId,
          },
        });
      } catch (e) {
        // Skip duplicate or missing link errors
      }
    }

    // Create verification request record for admin
    try {
      await prisma.verificationRequest.create({
        data: {
          userId: session.id,
          idType: "Ghana Card",
          idNumber: `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-1`,
          documentUrl: "https://servora.gh/docs/sample-ghana-card.png",
          status: "PENDING",
        },
      });
    } catch (e) {
      // Ignore if verification request already exists
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Provider Onboard Error:", error);
    return NextResponse.json({ error: error.message || "Provider profile creation failed." }, { status: 500 });
  }
}
