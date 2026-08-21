import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({ query: "", totalCount: 0, results: [] });
    }

    const queryLower = query.toLowerCase();

    // 1. Search Customers & Users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { id: { contains: query } },
        ],
      },
      take: 10,
    });

    // 2. Search Provider Profiles (Artisans)
    const providers = await prisma.providerProfile.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: "insensitive" } },
          { serviceArea: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { user: { select: { name: true, phone: true, email: true } } },
      take: 10,
    });

    // 3. Search Business Profiles
    const businesses = await prisma.businessProfile.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: "insensitive" } },
          { zone: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { idCardNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // 4. Search Deliveries
    const deliveries = await prisma.deliveryRequest.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { trackingNumber: { contains: query, mode: "insensitive" } },
          { pickupContactName: { contains: query, mode: "insensitive" } },
          { pickupContactPhone: { contains: query, mode: "insensitive" } },
          { recipientName: { contains: query, mode: "insensitive" } },
          { recipientPhone: { contains: query, mode: "insensitive" } },
          { pickupAddress: { contains: query, mode: "insensitive" } },
          { destinationAddress: { contains: query, mode: "insensitive" } },
          { status: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { customer: { select: { name: true, phone: true } } },
      take: 10,
    });

    // 5. Search Products & Listings
    const listings = await prisma.productListing.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { area: { contains: query, mode: "insensitive" } },
          { guestName: { contains: query, mode: "insensitive" } },
          { guestPhone: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // 6. Search Service Requests
    const serviceRequests = await prisma.serviceRequest.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { customCategory: { contains: query, mode: "insensitive" } },
          { streetAddress: { contains: query, mode: "insensitive" } },
          { guestName: { contains: query, mode: "insensitive" } },
          { guestPhone: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { customer: { select: { name: true, phone: true } } },
      take: 10,
    });

    // 7. Search Tool Rentals
    const rentals = await prisma.toolRentalListing.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }).catch(() => []);

    // 8. Search Payments & Quotes
    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { message: { contains: query, mode: "insensitive" } },
          { status: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { provider: { select: { name: true, phone: true } } },
      take: 10,
    }).catch(() => []);

    // 9. Search Reports & Disputes
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { reason: { contains: query, mode: "insensitive" } },
          { details: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        reporter: { select: { name: true, phone: true } },
        target: { select: { name: true, phone: true } },
      },
      take: 10,
    }).catch(() => []);

    // 10. Search Verification Records
    const verifications = await prisma.verificationRequest.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { idNumber: { contains: query, mode: "insensitive" } },
          { idType: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { user: { select: { name: true, phone: true } } },
      take: 10,
    }).catch(() => []);

    // 11. Search Audit Logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { action: { contains: query, mode: "insensitive" } },
          { details: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    // Format all matches into unified Admin Global Search results array
    const formattedResults: any[] = [];

    // Customers
    users.forEach((u) => {
      formattedResults.push({
        id: `usr-${u.id}`,
        entityType: "CUSTOMER",
        title: u.name || "Customer Account",
        subtitle: `Phone: ${u.phone || "N/A"} • Role: ${u.role}`,
        details: `Email: ${u.email} • ID: ${u.id}`,
        badgeColor: "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30",
        rawRecord: u,
      });
    });

    // Providers
    providers.forEach((p) => {
      formattedResults.push({
        id: `prv-${p.id}`,
        entityType: "PROVIDER",
        title: p.businessName,
        subtitle: `Owner: ${p.user?.name} (${p.user?.phone}) • ${p.serviceArea}`,
        details: `Status: ${p.verificationStatus} • Rating: ${p.ratingAverage}⭐`,
        badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
        rawRecord: p,
      });
    });

    // Businesses
    businesses.forEach((b) => {
      formattedResults.push({
        id: `biz-${b.id}`,
        entityType: "BUSINESS",
        title: b.businessName,
        subtitle: `Zone: ${b.zone} • Ghana Card: ${b.idCardNumber || "Recorded"}`,
        details: `Status: ${b.verificationStatus}`,
        badgeColor: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30",
        rawRecord: b,
      });
    });

    // Deliveries
    deliveries.forEach((d) => {
      formattedResults.push({
        id: `del-${d.id}`,
        entityType: "DELIVERY",
        title: `Delivery ${d.trackingNumber || d.id}`,
        subtitle: `Sender: ${d.pickupContactName} (${d.pickupContactPhone}) ➔ Recipient: ${d.recipientName} (${d.recipientPhone})`,
        details: `From ${d.pickupAddress} to ${d.destinationAddress} • Status: ${d.status} • GHS ${Number(d.deliveryFee)}`,
        badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
        rawRecord: d,
      });
    });

    // Products
    listings.forEach((prod) => {
      formattedResults.push({
        id: `prd-${prod.id}`,
        entityType: "PRODUCT",
        title: prod.title,
        subtitle: `Price: GHS ${prod.price} • Category: ${prod.category}`,
        details: `Area: ${prod.area} • Seller: ${prod.guestName || "Merchant"}`,
        badgeColor: "bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/30",
        rawRecord: prod,
      });
    });

    // Service Requests
    serviceRequests.forEach((sr) => {
      formattedResults.push({
        id: `req-${sr.id}`,
        entityType: "SERVICE_REQUEST",
        title: sr.title,
        subtitle: `Customer: ${sr.customer?.name || sr.guestName} • Status: ${sr.status}`,
        details: `Category: ${sr.customCategory || "Service Call"} • Urgency: ${sr.urgency}`,
        badgeColor: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
        rawRecord: sr,
      });
    });

    // Rentals
    rentals.forEach((r: any) => {
      formattedResults.push({
        id: `rnt-${r.id}`,
        entityType: "TOOL_RENTAL",
        title: r.title,
        subtitle: `Daily Rate: GHS ${r.dailyRate} • Category: ${r.category}`,
        details: `Description: ${r.description}`,
        badgeColor: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
        rawRecord: r,
      });
    });

    // Quotes / Payment Offers
    quotes.forEach((q: any) => {
      formattedResults.push({
        id: `qts-${q.id}`,
        entityType: "TRANSACTION",
        title: `Quote Offer GHS ${q.price}`,
        subtitle: `Provider: ${q.provider?.name} (${q.provider?.phone})`,
        details: `Status: ${q.status} • Est Hours: ${q.estimatedHours || "N/A"}`,
        badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
        rawRecord: q,
      });
    });

    // Disputes
    reports.forEach((rp: any) => {
      formattedResults.push({
        id: `dsp-${rp.id}`,
        entityType: "DISPUTE",
        title: rp.reason,
        subtitle: `Complainant: ${rp.reporter?.name} ➔ Target: ${rp.target?.name}`,
        details: `Details: ${rp.details}`,
        badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
        rawRecord: rp,
      });
    });

    // Verifications
    verifications.forEach((vr: any) => {
      formattedResults.push({
        id: `vrf-${vr.id}`,
        entityType: "VERIFICATION",
        title: `${vr.idType}: ${vr.idNumber}`,
        subtitle: `Applicant: ${vr.user?.name} (${vr.user?.phone})`,
        details: `Status: ${vr.status}`,
        badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
        rawRecord: vr,
      });
    });

    // Audit Logs
    auditLogs.forEach((al) => {
      formattedResults.push({
        id: `log-${al.id}`,
        entityType: "AUDIT_LOG",
        title: al.action,
        subtitle: `Details: ${al.details}`,
        details: `IP: ${al.ipAddress || "127.0.0.1"} • Created: ${new Date(al.createdAt).toLocaleString()}`,
        badgeColor: "bg-stone-500/20 text-stone-600 dark:text-stone-300 border-stone-500/30",
        rawRecord: al,
      });
    });

    return NextResponse.json({
      query,
      totalCount: formattedResults.length,
      results: formattedResults,
    });
  } catch (error: any) {
    console.error("Global Admin Search Error:", error);
    return NextResponse.json({ error: "Failed to perform global admin search." }, { status: 500 });
  }
}
