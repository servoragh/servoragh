import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const locationArea = searchParams.get("area");
    const status = searchParams.get("status");
    const urgencyFilter = searchParams.get("urgency");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    } else {
      // Default to requests that are open or published for bidding
      whereClause.status = { in: ["PUBLISHED", "OPEN", "QUOTED", "OFFER_ACCEPTED", "IN_PROGRESS"] };
    }

    if (locationArea) {
      whereClause.OR = [
        { location: { area: { contains: locationArea } } },
        { landmark: { contains: locationArea } },
        { streetAddress: { contains: locationArea } },
      ];
    }

    if (categorySlug) {
      whereClause.OR = [
        { service: { category: { slug: categorySlug } } },
        { customCategory: { contains: categorySlug } },
      ];
    }

    if (urgencyFilter) {
      whereClause.urgency = urgencyFilter;
    }

    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatarUrl: true,
          },
        },
        service: {
          include: {
            category: true,
          },
        },
        location: true,
        media: true,
        quotes: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                providerProfile: {
                  select: {
                    businessName: true,
                    slug: true,
                    logoUrl: true,
                    ratingAverage: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask privacy sensitive details (exact address & phone numbers) on public job lists
    const sanitizedRequests = requests.map((req) => {
      const isOwner = session?.id === req.customerId;
      const isAcceptedProvider = req.quotes.some(
        (q) => q.providerId === session?.id && q.status === "ACCEPTED"
      );

      const canSeeExactDetails = isOwner || isAcceptedProvider || session?.role === "ADMIN";

      return {
        ...req,
        // Privacy Masking
        streetAddress: canSeeExactDetails ? req.streetAddress : null,
        accessInstructions: canSeeExactDetails ? req.accessInstructions : null,
        customer: {
          ...req.customer,
          phone: canSeeExactDetails ? req.customer.phone : `${req.customer.phone.slice(0, 6)}****`,
        },
        guestPhone: canSeeExactDetails ? req.guestPhone : req.guestPhone ? `${req.guestPhone.slice(0, 6)}****` : null,
        guestEmail: canSeeExactDetails ? req.guestEmail : null,
      };
    });

    return NextResponse.json({ requests: sanitizedRequests });
  } catch (error: any) {
    console.error("Fetch Service Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch service requests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      // Service & Problem
      serviceId,
      customCategory,
      tags,
      title,
      description,
      images,
      media,

      // Dual Geolocation & GPS
      locationId,
      streetAddress,
      landmark,
      latitude,
      longitude,
      accuracyRadius,
      isLiveTrackingOptIn,

      // Timing & Urgency
      urgency,
      scheduledDateTime,
      timezone,

      // Budget & Pricing
      pricingType,
      budgetMin,
      budgetMax,
      currency,

      // Safety, Access & Privacy
      accessInstructions,
      preferredContactMethod,
      visibility,

      // Guest Onboarding
      isGuestPost,
      guestName,
      guestPhone,
      guestEmail,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Job title and problem description are required." }, { status: 400 });
    }

    let customerId: string;
    let isVerifiedGuest = false;
    let guestClaimToken: string | null = null;
    let guestOtpCode: string | null = null;
    let initialStatus = "PUBLISHED";
    let authCookieToSet: string | null = null;

    if (session) {
      customerId = session.id;
    } else {
      // Unauthenticated Guest Submission Workflow
      if (!guestPhone || !guestName) {
        return NextResponse.json({ error: "Guest users must provide their Full Name and WhatsApp Phone number." }, { status: 400 });
      }

      // Check if user already exists with this phone
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ phone: guestPhone }, { email: guestEmail || undefined }] },
      });

      if (existingUser) {
        customerId = existingUser.id;
      } else {
        // Lightweight Temporary Account Creation
        const tempPasswordHash = crypto.randomBytes(16).toString("hex");
        const referralCode = `GST-${Math.floor(100000 + Math.random() * 900000)}`;
        const newGuestUser = await prisma.user.create({
          data: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail || null,
            passwordHash: tempPasswordHash,
            role: "CUSTOMER",
            referralCode,
          },
        });
        customerId = newGuestUser.id;

        // Auto-generate session cookie so guest seamlessly tracks their job!
        await setSessionCookie({
          id: newGuestUser.id,
          name: newGuestUser.name,
          phone: newGuestUser.phone,
          role: "CUSTOMER",
          isPhoneVerified: false,
        });
      }

      // Generate 4-digit OTP & Claim Token
      guestOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
      guestClaimToken = `claim-${crypto.randomBytes(12).toString("hex")}`;
      initialStatus = "OPEN"; // Immediately public & syndicated to community board!
    }

    // Default or Fallback Location
    let targetLocationId = locationId;
    if (!targetLocationId) {
      const defaultLoc = await prisma.location.findFirst({ where: { area: "Tamale Central" } });
      targetLocationId = defaultLoc?.id || (await prisma.location.findFirst())?.id;
    }

    // Create Service Request Record
    const newRequest = await prisma.serviceRequest.create({
      data: {
        customerId,
        serviceId: serviceId || null,
        customCategory: customCategory || null,
        tags: JSON.stringify(tags || []),
        locationId: targetLocationId,

        // Dual Geolocation & GPS
        streetAddress: streetAddress || null,
        landmark: landmark || "Tamale",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        accuracyRadius: accuracyRadius ? Number(accuracyRadius) : null,
        isLiveTrackingOptIn: Boolean(isLiveTrackingOptIn),

        title,
        description,
        images: JSON.stringify(images || []),

        // Timing & Urgency
        urgency: urgency || "SAME_DAY",
        scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime) : null,
        timezone: timezone || "Africa/Accra",

        // Budget & Pricing
        pricingType: pricingType || "OPEN_FOR_QUOTES",
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        currency: currency || "GHS",

        // Safety, Access & Privacy
        accessInstructions: accessInstructions || null,
        preferredContactMethod: preferredContactMethod || "WHATSAPP_SMS",
        visibility: visibility || "PUBLIC_ALL",

        // Guest Onboarding
        isGuestPost: Boolean(isGuestPost),
        guestName: guestName || null,
        guestPhone: guestPhone || null,
        guestEmail: guestEmail || null,
        guestClaimToken,
        guestOtpCode,
        isVerifiedGuest: session ? true : false,

        status: initialStatus,
      },
      include: {
        service: { include: { category: true } },
        location: true,
      },
    });

    // Save Media Attachments (Photos, Videos, PDFs)
    if (Array.isArray(media) && media.length > 0) {
      for (const m of media) {
        if (m.mediaUrl) {
          await prisma.serviceRequestMedia.create({
            data: {
              requestId: newRequest.id,
              mediaUrl: m.mediaUrl,
              mediaType: m.mediaType || "IMAGE",
              fileName: m.fileName || "attachment",
              fileSize: m.fileSize ? Number(m.fileSize) : null,
            },
          });
        }
      }
    }

    // Geofenced / Category Notification Dispatch & Auto-Syndication to Community Board
    if (initialStatus === "PUBLISHED" || initialStatus === "OPEN") {
      // 1. Auto-syndicate to Community Board Feed
      try {
        await prisma.communityPost.create({
          data: {
            serviceRequestId: newRequest.id,
            category: "SERVICE_CALL" as any,
            title: title,
            content: description,
            zone: "ALL_NORTHERN_GH" as any,
            authorId: session ? session.id : null,
            guestName: isGuestPost ? guestName : null,
            guestPhone: isGuestPost ? guestPhone : null,
          },
        });
      } catch (err) {
        console.error("Auto-syndicate CommunityPost Error:", err);
      }

      // 2. Dispatch Provider Notifications
      const matchingProviders = await prisma.providerProfile.findMany({
        select: { userId: true },
      });

      for (const p of matchingProviders) {
        await prisma.notification.create({
          data: {
            userId: p.userId,
            title: `New ${urgency === "EMERGENCY_ASAP" ? "🚨 EMERGENCY" : "Job"} Request in Tamale!`,
            message: `New request: "${title}" (${landmark || "Tamale"}). Submit your price quote now!`,
            link: `/requests/${newRequest.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      request: newRequest,
      guestClaimToken,
      otpCode: guestOtpCode, // Returned for dev/test verification simulation
      isPendingVerification: initialStatus === "PENDING_VERIFICATION",
    });
  } catch (error: any) {
    console.error("Universal Request Engine Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit request." }, { status: 500 });
  }
}
