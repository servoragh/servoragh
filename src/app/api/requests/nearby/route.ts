import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Haversine formula to compute distance in kilometers between two GPS coordinates
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusKm = Number(searchParams.get("radiusKm")) || 25; // default 25km radius in Tamale

    // Default Tamale Central coordinates if not provided
    const targetLat = latParam ? Number(latParam) : 9.4075;
    const targetLng = lngParam ? Number(lngParam) : -0.8392;

    const allRequests = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ["PUBLISHED", "OPEN", "QUOTED"] },
      },
      include: {
        service: { include: { category: true } },
        location: true,
        media: true,
        customer: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        quotes: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute distance for each request that has lat/lng or default to landmark center
    const requestsWithDistance = allRequests
      .map((req) => {
        const reqLat = req.latitude || 9.4075;
        const reqLng = req.longitude || -0.8392;
        const distanceKm = getHaversineDistanceKm(targetLat, targetLng, reqLat, reqLng);

        return {
          ...req,
          distanceKm: Math.round(distanceKm * 10) / 10,
          // Privacy masking
          streetAddress: null,
          customer: {
            ...req.customer,
            phone: "****",
          },
        };
      })
      .filter((req) => req.distanceKm <= radiusKm)
      .sort((a, b) => {
        // Prioritize Emergency/ASAP jobs, then nearest distance
        if (a.urgency === "EMERGENCY_ASAP" && b.urgency !== "EMERGENCY_ASAP") return -1;
        if (b.urgency === "EMERGENCY_ASAP" && a.urgency !== "EMERGENCY_ASAP") return 1;
        return a.distanceKm - b.distanceKm;
      });

    return NextResponse.json({
      center: { lat: targetLat, lng: targetLng, radiusKm },
      count: requestsWithDistance.length,
      requests: requestsWithDistance,
    });
  } catch (error: any) {
    console.error("Fetch Nearby Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch nearby requests." }, { status: 500 });
  }
}
