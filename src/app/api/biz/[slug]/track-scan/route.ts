import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/biz/[slug]/track-scan - Increment QR code scans counter
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.replace(/^(%40|@)/, "");

    const profile = await prisma.businessProfile.findUnique({
      where: { slug },
      select: { id: true, qrScansCount: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    const updated = await prisma.businessProfile.update({
      where: { id: profile.id },
      data: { qrScansCount: { increment: 1 } },
      select: { qrScansCount: true },
    });

    return NextResponse.json({
      success: true,
      qrScansCount: updated.qrScansCount,
    });
  } catch (error: any) {
    console.error("POST Track Scan API Error:", error);
    return NextResponse.json({ error: "Failed to record QR scan event." }, { status: 500 });
  }
}
