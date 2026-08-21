import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/provider/onboard - Fetch delivery provider profile & verification status
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      include: {
        vehicles: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      hasProviderProfile: !!provider,
      provider,
    });
  } catch (error: any) {
    console.error("GET Delivery Provider Profile Error:", error);
    return NextResponse.json({ error: "Failed to load provider profile." }, { status: 500 });
  }
}

// POST /api/delivery/provider/onboard - Register / Update delivery provider verification data
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      idType,
      idNumber,
      idDocumentUrl,
      selfieUrl,
      emergencyContactName,
      emergencyContactPhone,
      dateOfBirth,
      residentialAddress,
    } = body;

    if (!idType || !idNumber || !idDocumentUrl || !selfieUrl) {
      return NextResponse.json(
        { error: "Identity Document type, ID Number, ID photo, and Selfie photo are required for verification." },
        { status: 400 }
      );
    }

    const existing = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
    });

    let provider;
    if (existing) {
      provider = await prisma.deliveryProviderProfile.update({
        where: { id: existing.id },
        data: {
          idType,
          idNumber,
          idDocumentUrl,
          selfieUrl,
          emergencyContactName: emergencyContactName || existing.emergencyContactName,
          emergencyContactPhone: emergencyContactPhone || existing.emergencyContactPhone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
          residentialAddress: residentialAddress || existing.residentialAddress,
          verificationStatus: "UNDER_REVIEW", // Submitted for admin review
        },
      });
    } else {
      provider = await prisma.deliveryProviderProfile.create({
        data: {
          userId: session.id,
          idType,
          idNumber,
          idDocumentUrl,
          selfieUrl,
          emergencyContactName: emergencyContactName || "",
          emergencyContactPhone: emergencyContactPhone || "",
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          residentialAddress: residentialAddress || "",
          verificationStatus: "UNDER_REVIEW",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification documents submitted successfully! Your account is under review by administrators.",
      provider,
    });
  } catch (error: any) {
    console.error("POST Delivery Provider Onboarding Error:", error);
    return NextResponse.json({ error: "Failed to submit provider onboarding verification." }, { status: 500 });
  }
}
