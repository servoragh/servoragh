import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        providerProfile: {
          include: {
            services: { include: { service: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ error: "Failed to load user profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      avatarUrl,
      logoUrl,
      businessName,
      bio,
      serviceArea,
      websiteUrl,
      yearsExperience,
      pricingHourly,
      portfolioUrls,
      idDocumentUrl,
      businessCertUrl,
    } = body;

    const chosenLogo = logoUrl || avatarUrl;

    // Update User Avatar / Name
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(name !== undefined && { name }),
        ...(chosenLogo !== undefined && { avatarUrl: chosenLogo }),
      },
      include: {
        providerProfile: true,
      },
    });

    // Update Business Provider Profile if user is PROVIDER
    if (updatedUser.providerProfile) {
      await prisma.providerProfile.update({
        where: { id: updatedUser.providerProfile.id },
        data: {
          ...(businessName !== undefined && { businessName }),
          ...(bio !== undefined && { bio }),
          ...(serviceArea !== undefined && { serviceArea }),
          ...(websiteUrl !== undefined && { websiteUrl: websiteUrl ? (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`) : null }),
          ...(yearsExperience !== undefined && { yearsExperience: Number(yearsExperience) }),
          ...(pricingHourly !== undefined && { pricingHourly: Number(pricingHourly) }),
          ...(chosenLogo !== undefined && { logoUrl: chosenLogo }),
          ...(portfolioUrls !== undefined && { portfolioUrls: JSON.stringify(portfolioUrls) }),
          ...(idDocumentUrl !== undefined && { idDocumentUrl }),
          ...(businessCertUrl !== undefined && { businessCertUrl }),
        },
      });
    }

    const reloadedUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: { providerProfile: true },
    });

    return NextResponse.json({ success: true, user: reloadedUser });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
