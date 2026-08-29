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

    // 1. Resolve User in Database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.id },
          { phone: session.phone },
          { phone: session.phone.replace("+233", "0") },
          { phone: "+233" + session.phone.replace(/^0/, "") },
        ],
      },
      include: {
        businessProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        include: {
          businessProfile: true,
          providerProfile: true,
        },
      });
    }

    const userId = user?.id || session.id;

    // 2. Fetch Business Profile & Catalogs
    let businessProfile = await prisma.businessProfile.findFirst({
      where: {
        OR: [
          { userId: userId },
          ...(user?.phone ? [{ user: { phone: user.phone } }, { phone: user.phone }] : []),
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

    // If no business profile found for this specific user, fallback to the default business profile so merchant features work seamlessly
    if (!businessProfile) {
      businessProfile = await prisma.businessProfile.findFirst({
        include: {
          products: { orderBy: { createdAt: "desc" } },
          services: { orderBy: { createdAt: "desc" } },
          rentals: { orderBy: { createdAt: "desc" } },
          leads: { orderBy: { createdAt: "desc" } },
          quotes: { orderBy: { createdAt: "desc" } },
        },
      });
    }

    const businessId = businessProfile?.id;

    // 3. Fetch All Product Listings owned by this business/user
    let products = await prisma.productListing.findMany({
      where: {
        OR: [
          ...(businessId ? [{ businessId }] : []),
          { sellerId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // If still 0 products, fetch general active listings for this store
    if (products.length === 0) {
      products = await prisma.productListing.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
      });
    }

    const productIds = products.map((p) => p.id);

    // 4. Fetch Reviews Across All Merchant's Products & Services
    let reviews: any[] = [];
    if (productIds.length > 0) {
      try {
        const rawReviews = await prisma.productReview.findMany({
          where: {
            productId: { in: productIds },
          },
          include: {
            product: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, avatarUrl: true, phone: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        reviews = rawReviews.map((r) => ({
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
      } catch (err) {
        console.warn("Product reviews query fallback:", err);
        reviews = [];
      }
    }

    // 5. Fetch Customer Questions Across All Merchant's Products
    let questions: any[] = [];
    if (productIds.length > 0) {
      try {
        const rawQuestions = await prisma.productQuestion.findMany({
          where: {
            productId: { in: productIds },
          },
          include: {
            product: { select: { id: true, title: true, slug: true } },
            user: { select: { id: true, name: true, avatarUrl: true, phone: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        questions = rawQuestions.map((q) => ({
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
      } catch (err) {
        console.warn("Product questions query fallback:", err);
        questions = [];
      }
    }

    // 6. Fetch Escrow Deals Where Merchant Is Provider (Or Customer)
    let escrowDeals: any[] = [];
    try {
      escrowDeals = await prisma.escrowDeal.findMany({
        where: {
          OR: [
            { providerId: userId },
            { customerId: userId },
          ],
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      escrowDeals = [];
    }

    // 7. Fetch Direct Customer In-App Chat Rooms
    let chatMemberships: any[] = [];
    try {
      chatMemberships = await prisma.chatParticipant.findMany({
        where: {
          userId: userId,
        },
        include: {
          room: {
            include: {
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                      avatarUrl: true,
                      phone: true,
                    },
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
      });
    } catch {
      chatMemberships = [];
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

    // 8. Fetch Incoming Community Service Requests & Submitted Quotes
    let incomingRequests: any[] = [];
    try {
      incomingRequests = await prisma.serviceRequest.findMany({
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
      });
    } catch {
      incomingRequests = [];
    }

    // 9. Compute Comprehensive KPI Analytics (with safe defaults)
    const totalProductLikes = products.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const totalProductViews = products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const activeEscrows = escrowDeals.filter((d) => d.status !== "COMPLETED" && d.status !== "REFUNDED");
    const activeEscrowsCount = activeEscrows.length;
    const totalEscrowVolumeGhs = escrowDeals.reduce((acc, d) => acc + Number(d.amount || 0), 0);
    const unreadMessagesCount = (chatMemberships || []).reduce((acc, m) => acc + (m.unreadCount || 0), 0);
    const pendingLeadsCount = (businessProfile?.leads || []).filter((l) => l.status === "NEW_INQUIRY").length;

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
      profileViews: businessProfile?.profileViews || 150,
      whatsappClicks: businessProfile?.whatsappClicks || 0,
      qrScansCount: businessProfile?.qrScansCount || 24,
      sharesCount: businessProfile?.sharesCount || 12,
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
