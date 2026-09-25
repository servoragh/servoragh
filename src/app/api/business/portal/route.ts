import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Please log in to access your business portal." }, { status: 401 });
    }

    const cleanSessionPhone = (session.phone || "").trim();
    const sessionPhoneVariants = cleanSessionPhone
      ? [
          { phone: cleanSessionPhone },
          { phone: cleanSessionPhone.replace("+233", "0") },
          { phone: "+233" + cleanSessionPhone.replace(/^0/, "") },
        ]
      : [];

    // 1. Resolve User in Database strictly for authenticated session
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.id ? [{ id: session.id }] : []),
          ...sessionPhoneVariants,
        ],
      },
      include: {
        businessProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        businessProfile: null,
        products: [],
        rentals: [],
        services: [],
        reviews: [],
        questions: [],
        escrowDeals: [],
        chatRooms: [],
        leads: [],
        quotes: [],
        incomingRequests: [],
        kpis: {
          totalProductLikes: 0,
          totalProductViews: 0,
          totalProductsCount: 0,
          totalRentalsCount: 0,
          totalServicesCount: 0,
          activeEscrowsCount: 0,
          totalEscrowVolumeGhs: 0,
          unreadMessagesCount: 0,
          pendingLeadsCount: 0,
          reviewsCount: 0,
          averageRating: 5.0,
          profileViews: 0,
          whatsappClicks: 0,
          qrScansCount: 0,
          sharesCount: 0,
          favoritesCount: 0,
        },
      });
    }

    const userId = user?.id || session.id;
    const cleanUserPhone = (user?.phone || session.phone || "").trim();
    const userPhoneVariants = cleanUserPhone
      ? [
          { user: { phone: cleanUserPhone } },
          { phone: cleanUserPhone },
          { phone: cleanUserPhone.replace("+233", "0") },
          { phone: "+233" + cleanUserPhone.replace(/^0/, "") },
        ]
      : [];

    // 2. Fetch Business Profile strictly for this user
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...userPhoneVariants,
        ],
      },
      include: {
        products: {
          orderBy: { createdAt: "desc" },
        },
        services: {
          orderBy: { createdAt: "desc" },
        },
        rentals: {
          orderBy: { createdAt: "desc" },
        },
        leads: {
          orderBy: { createdAt: "desc" },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const businessId = businessProfile?.id;

    // 3. Parallel Query Wave 1: Fetch Products, Escrow Deals, Chat Rooms, and Incoming Requests concurrently
    const [
      productsResult,
      escrowDealsResult,
      chatMembershipsResult,
      incomingRequestsResult
    ] = await Promise.all([
      // Products
      (businessId || userId)
        ? prisma.productListing.findMany({
            where: {
              OR: [
                ...(businessId ? [{ businessId }] : []),
                ...(userId ? [{ sellerId: userId }] : []),
              ],
            },
            orderBy: { createdAt: "desc" },
          }).catch(() => [])
        : Promise.resolve([]),

      // Escrow Deals
      userId
        ? prisma.escrowDeal.findMany({
            where: {
              OR: [
                { providerId: userId },
                { customerId: userId },
              ],
            },
            include: {
              customer: {
                select: { id: true, name: true, phone: true, avatarUrl: true },
              },
              provider: {
                select: { id: true, name: true, phone: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: "desc" },
          }).catch(() => [])
        : Promise.resolve([]),

      // Chat Memberships
      userId
        ? prisma.chatParticipant.findMany({
            where: { userId: userId },
            include: {
              room: {
                include: {
                  participants: {
                    include: {
                      user: {
                        select: { id: true, name: true, role: true, avatarUrl: true, phone: true },
                      },
                    },
                  },
                  messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
              },
            },
            orderBy: { room: { updatedAt: "desc" } },
            take: 20,
          }).catch(() => [])
        : Promise.resolve([]),

      // Incoming Requests
      prisma.serviceRequest.findMany({
        where: {
          status: { in: ["OPEN", "PUBLISHED"] },
        },
        include: {
          customer: { select: { name: true, phone: true, avatarUrl: true } },
          service: true,
          location: true,
          quotes: {
            where: { providerId: userId },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }).catch(() => []),
    ]);

    const products = productsResult || [];
    const escrowDeals = escrowDealsResult || [];
    const chatMemberships = chatMembershipsResult || [];
    const incomingRequests = incomingRequestsResult || [];

    const productIds = products.map((p) => p.id);

    // 4. Parallel Query Wave 2: Reviews and Questions concurrently
    let reviews: any[] = [];
    let questions: any[] = [];

    if (productIds.length > 0) {
      const [rawReviews, rawQuestions] = await Promise.all([
        prisma.productReview.findMany({
          where: { productId: { in: productIds } },
          include: {
            product: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, avatarUrl: true, phone: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
        prisma.productQuestion.findMany({
          where: { productId: { in: productIds } },
          include: {
            product: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, avatarUrl: true, phone: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
      ]);

      reviews = (rawReviews || []).map((r) => ({
        id: r.id,
        productId: r.productId,
        productTitle: r.product?.title || "Product Item",
        productSlug: r.product?.slug || "",
        userId: r.userId,
        authorName: r.user?.name || "Customer",
        authorAvatar: r.user?.avatarUrl || null,
        authorPhone: r.user?.phone || null,
        rating: Number(r.rating) || 5,
        title: r.title || "Customer Review",
        comment: r.comment,
        photos: Array.isArray(r.photos) ? r.photos : [],
        isVerified: Boolean(r.isVerified),
        sellerReply: r.sellerReply || null,
        sellerRepliedAt: r.sellerRepliedAt || null,
        createdAt: r.createdAt.toISOString(),
      }));

      questions = (rawQuestions || []).map((q) => ({
        id: q.id,
        productId: q.productId,
        productTitle: q.product?.title || "Product Item",
        productSlug: q.product?.slug || "",
        userId: q.userId,
        askerName: q.user?.name || "Interested Customer",
        askerAvatar: q.user?.avatarUrl || null,
        askerPhone: q.user?.phone || null,
        question: q.question,
        answer: q.answer || null,
        answeredBy: q.answeredBy || null,
        answeredAt: q.answeredAt || null,
        createdAt: q.createdAt.toISOString(),
      }));
    }

    const chatRooms = (chatMemberships || []).map((m) => {
      const otherPart = m.room?.participants?.find((p: any) => p?.user?.id && p.user.id !== userId);
      return {
        id: m.room?.id,
        scope: m.room?.scope,
        title: m.room?.title || otherPart?.user?.name || "Customer Inquiry",
        status: m.room?.status,
        unreadCount: m.unreadCount || 0,
        updatedAt: m.room?.updatedAt,
        customer: otherPart?.user || null,
        lastMessage: m.room?.messages?.[0] || null,
      };
    });

    // 9. Compute Comprehensive KPI Analytics
    const totalProductLikes = products.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const totalProductViews = products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const activeEscrows = escrowDeals.filter((d) => d.status !== "COMPLETED" && d.status !== "REFUNDED");
    const activeEscrowsCount = activeEscrows.length;
    const totalEscrowVolumeGhs = escrowDeals.reduce((acc, d) => acc + Number(d.amount || 0), 0);
    const unreadMessagesCount = (chatMemberships || []).reduce((acc, m) => acc + (m.unreadCount || 0), 0);
    const pendingLeadsCount = (businessProfile?.leads || []).filter((l: any) => l.status === "NEW_INQUIRY").length;

    const kpis = {
      totalProductLikes,
      totalProductViews,
      totalProductsCount: products.length,
      totalRentalsCount: businessProfile?.rentals?.length || 0,
      totalServicesCount: businessProfile?.services?.length || 0,
      activeEscrowsCount,
      totalEscrowVolumeGhs,
      unreadMessagesCount,
      pendingLeadsCount,
      reviewsCount: reviews.length,
      averageRating: reviews.length > 0 
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : (businessProfile?.ratingAverage || 5.0),
      profileViews: businessProfile?.profileViews || 0,
      whatsappClicks: businessProfile?.whatsappClicks || 0,
      qrScansCount: businessProfile?.qrScansCount || 0,
      sharesCount: businessProfile?.sharesCount || 0,
      favoritesCount: businessProfile?.favoritesCount || 0,
    };

    return NextResponse.json({
      success: true,
      kpis,
      businessProfile,
      products,
      rentals: businessProfile?.rentals || [],
      services: businessProfile?.services || [],
      reviews,
      questions,
      escrowDeals,
      chatRooms,
      leads: businessProfile?.leads || [],
      quotes: businessProfile?.quotes || [],
      incomingRequests,
    });
  } catch (error: any) {
    console.error("Business Portal API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load business portal data." }, { status: 500 });
  }
}
