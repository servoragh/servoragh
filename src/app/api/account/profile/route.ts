import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 1. Ensure User exists in PostgreSQL
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { email: session.email || undefined },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: session.name || "Customer Member",
          phone: session.phone || "+233240000000",
          email: session.email || null,
          role: session.role || "CUSTOMER",
          passwordHash: crypto.randomBytes(16).toString("hex"),
          isPhoneVerified: session.isPhoneVerified ?? true,
          referralCode: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });
    }

    const userId = user.id;

    // 2. Fetch or Auto-Initialize Customer Profile with strict default preferences
    let profile: any = null;
    try {
      profile = await prisma.customerProfile.findUnique({
        where: { userId },
        include: {
          savedAddresses: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!profile) {
        profile = await prisma.customerProfile.create({
          data: {
            userId,
            defaultCurrency: "GHS",
            defaultZone: "Tamale Central",
            preferredPayment: "MOMO_ESCROW",
            profileVisibility: "RESTRICTED",
            notifyInApp: true,
            notifyWhatsApp: true,
            notifySms: true,
            notifyMarketingEmail: false,
            sharePhoneWithArtisan: true,
            showNameOnReviews: true,
            status: "ACTIVE",
            verificationTier: user.isPhoneVerified ? "TIER_1_BASIC" : "UNVERIFIED",
            riskLevel: "LOW",
            riskScore: 5.0,
          },
          include: {
            savedAddresses: true,
          },
        });

        // Log initial account setup activity
        await prisma.userActivityLog.create({
          data: {
            userId,
            actionType: "ACCOUNT_INITIALIZED",
            description: "Customer profile and zero-config security preferences initialized",
            entityType: "ACCOUNT",
          },
        }).catch(() => null);
      }
    } catch (profErr) {
      console.warn("Profile fetch/create fallback:", profErr);
    }

    // 3. Queries for 360 Workspace (each individually protected)
    let serviceRequests: any[] = [];
    let escrowDeals: any[] = [];
    let disputes: any[] = [];
    let favorites: any[] = [];
    let reviews: any[] = [];
    let communityPosts: any[] = [];
    let activityLogs: any[] = [];

    const cleanUserPhone = (user.phone || "").trim();
    const phoneVariants = [
      cleanUserPhone,
      cleanUserPhone.replace("+233", "0"),
      cleanUserPhone.startsWith("0") ? "+233" + cleanUserPhone.slice(1) : null,
    ].filter(Boolean);

    try {
      serviceRequests = await prisma.serviceRequest.findMany({
        where: {
          OR: [
            { customerId: userId },
            { customerId: user.id },
            ...phoneVariants.map((p) => ({ guestPhone: p })),
          ],
        },
        include: {
          quotes: {
            include: {
              provider: {
                select: { id: true, name: true, phone: true, avatarUrl: true },
              },
            },
          },
          service: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    } catch (e) {
      console.warn("ServiceRequests query error:", e);
    }

    try {
      escrowDeals = await prisma.escrowDeal.findMany({
        where: {
          OR: [
            { customerId: userId },
            { customerId: user.id },
          ],
        },
        include: {
          provider: {
            select: { id: true, name: true, phone: true, avatarUrl: true },
          },
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("EscrowDeals query error:", e);
    }

    try {
      disputes = await prisma.dispute.findMany({
        where: { customerId: userId },
        include: {
          provider: {
            select: { id: true, name: true, phone: true },
          },
          escrowDeal: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Disputes query error:", e);
    }

    try {
      favorites = await prisma.businessFavorite.findMany({
        where: { userId },
        include: {
          business: {
            include: {
              products: true,
              services: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Favorites query error:", e);
    }

    try {
      reviews = await prisma.review.findMany({
        where: { authorId: userId },
        include: {
          target: {
            select: { name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Reviews query error:", e);
    }

    try {
      communityPosts = await prisma.communityPost.findMany({
        where: {
          OR: [
            { authorId: userId },
            { authorId: user.id },
            ...phoneVariants.map((p) => ({ guestPhone: p })),
          ],
        },
        include: {
          comments: true,
          upvotes: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("CommunityPosts query error:", e);
    }

    try {
      activityLogs = await prisma.userActivityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 25,
      });
    } catch (e) {
      console.warn("ActivityLogs query error:", e);
    }

    // 4. Calculate Live KPI Metrics Strip
    const activeGigsCount = serviceRequests.filter(
      (r) => r.status === "OPEN" || r.status === "OFFER_ACCEPTED" || r.status === "IN_PROGRESS"
    ).length;

    const savedItemsCount = favorites.length;
    const openDisputesCount = disputes.filter(
      (d) => d.status !== "RESOLVED" && d.status !== "REFUND_ISSUED"
    ).length;

    const escrowVaultBalance = escrowDeals
      .filter((e) => e.status === "FUNDS_HELD_IN_VAULT" || e.status === "IN_PROGRESS" || e.status === "AWAITING_RELEASE")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isPhoneVerified: user.isPhoneVerified,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      },
      profile: profile || {
        defaultZone: "Tamale Central",
        defaultCurrency: "GHS",
        preferredPayment: "MOMO_ESCROW",
        profileVisibility: "RESTRICTED",
        verificationTier: "TIER_1_BASIC",
        savedAddresses: [],
      },
      metrics: {
        activeGigsCount,
        savedItemsCount,
        openDisputesCount,
        escrowVaultBalance,
        totalOrdersCount: serviceRequests.length + escrowDeals.length,
      },
      serviceRequests,
      escrowDeals,
      disputes,
      favorites,
      reviews,
      communityPosts,
      activityLogs,
    });
  } catch (error: any) {
    console.error("Customer Profile GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load customer profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      avatarUrl,
      defaultZone,
      defaultCurrency,
      preferredPayment,
      profileVisibility,
      notifyInApp,
      notifyWhatsApp,
      notifySms,
      notifyMarketingEmail,
      sharePhoneWithArtisan,
      showNameOnReviews,
    } = body;

    // Update User core table if name / avatarUrl changed
    if (name !== undefined || avatarUrl !== undefined) {
      await prisma.user.updateMany({
        where: { OR: [{ id: session.id }, { phone: session.phone }] },
        data: {
          name: name !== undefined ? name : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
      });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: session.id }, { phone: session.phone }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update Customer Profile
    const updatedProfile = await prisma.customerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultZone: defaultZone || "Tamale Central",
        defaultCurrency: defaultCurrency || "GHS",
        preferredPayment: preferredPayment || "MOMO_ESCROW",
        profileVisibility: profileVisibility || "RESTRICTED",
        notifyInApp: notifyInApp !== undefined ? notifyInApp : true,
        notifyWhatsApp: notifyWhatsApp !== undefined ? notifyWhatsApp : true,
        notifySms: notifySms !== undefined ? notifySms : true,
        notifyMarketingEmail: notifyMarketingEmail !== undefined ? notifyMarketingEmail : false,
        sharePhoneWithArtisan: sharePhoneWithArtisan !== undefined ? sharePhoneWithArtisan : true,
        showNameOnReviews: showNameOnReviews !== undefined ? showNameOnReviews : true,
      },
      update: {
        defaultZone,
        defaultCurrency,
        preferredPayment,
        profileVisibility,
        notifyInApp,
        notifyWhatsApp,
        notifySms,
        notifyMarketingEmail,
        sharePhoneWithArtisan,
        showNameOnReviews,
      },
      include: {
        savedAddresses: true,
      },
    });

    // Log preference update activity
    await prisma.userActivityLog.create({
      data: {
        userId: user.id,
        actionType: "SETTINGS_UPDATED",
        description: "Updated notification and privacy preferences",
        entityType: "SETTINGS",
      },
    }).catch(() => null);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error("Customer Profile PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile preferences" },
      { status: 500 }
    );
  }
}
