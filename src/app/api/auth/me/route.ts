import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      avatarUrl: true,
      isPhoneVerified: true,
      referralCode: true,
      providerProfile: {
        select: {
          id: true,
          slug: true,
          businessName: true,
          logoUrl: true,
          verificationStatus: true,
          ratingAverage: true,
          completedJobsCount: true,
        },
      },
    },
  });

  return NextResponse.json({ user: dbUser });
}
