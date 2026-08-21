import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/biz/[slug]/track-share - Increment profile shares counter
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params;
    const slug = rawSlug.replace(/^(%40|@)/, "");

    const profile = await prisma.businessProfile.findUnique({
      where: { slug },
      select: { id: true, sharesCount: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found." }, { status: 404 });
    }

    const updated = await prisma.businessProfile.update({
      where: { id: profile.id },
      data: { sharesCount: { increment: 1 } },
      select: { sharesCount: true },
    });

    return NextResponse.json({
      success: true,
      sharesCount: updated.sharesCount,
    });
  } catch (error: any) {
    console.error("POST Track Share API Error:", error);
    return NextResponse.json({ error: "Failed to record share event." }, { status: 500 });
  }
}
