import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerCache, setServerCache } from "@/lib/serverCache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const cacheKey = `auth_me_${session.id}`;
    const cachedUser = getServerCache(cacheKey);
    if (cachedUser) {
      return NextResponse.json({ user: cachedUser }, {
        headers: { "X-Servora-Cache": "HIT" }
      });
    }

    try {
      if (prisma.user) {
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

        if (dbUser) {
          setServerCache(cacheKey, dbUser, 30);
          return NextResponse.json({ user: dbUser });
        }
      }
    } catch (e) {
      // DB offline fallback
    }

    // Fallback to session user data
    return NextResponse.json({ user: session });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}
