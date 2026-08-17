import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
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
        quotes: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
                providerProfile: {
                  select: {
                    businessName: true,
                    slug: true,
                    ratingAverage: true,
                    completedJobsCount: true,
                    verificationStatus: true,
                    badges: true,
                  },
                },
              },
            },
            conversation: {
              include: {
                messages: {
                  include: {
                    sender: {
                      select: { name: true, role: true },
                    },
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: true,
      },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Service request not found." }, { status: 404 });
    }

    return NextResponse.json({ request: serviceRequest });
  } catch (error: any) {
    console.error("Get Request Detail Error:", error);
    return NextResponse.json({ error: "Failed to load request details." }, { status: 500 });
  }
}
