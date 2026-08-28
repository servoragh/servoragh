import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      customCategory,
      urgency,
      budgetMin,
      budgetMax,
      status,
      landmark,
      streetAddress,
    } = body;

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        customCategory: customCategory !== undefined ? customCategory : undefined,
        urgency: urgency !== undefined ? urgency : undefined,
        budgetMin: budgetMin !== undefined ? (budgetMin ? Number(budgetMin) : null) : undefined,
        budgetMax: budgetMax !== undefined ? (budgetMax ? Number(budgetMax) : null) : undefined,
        status: status !== undefined ? status : undefined,
        landmark: landmark !== undefined ? landmark : undefined,
        streetAddress: streetAddress !== undefined ? streetAddress : undefined,
      },
      include: {
        customer: true,
        service: true,
        location: true,
      },
    });

    // Synchronize status with linked Community Board Post
    if (status) {
      await prisma.communityPost.updateMany({
        where: { serviceRequestId: id },
        data: {
          status: status === "CANCELLED" || status === "SUSPENDED" ? "EXPIRED" : "OPEN_ACTIVE",
          title: title !== undefined ? title : undefined,
          content: description !== undefined ? description : undefined,
        },
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("Update Request Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update service request." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete linked community post
    await prisma.communityPost.deleteMany({
      where: { serviceRequestId: id },
    }).catch(() => null);

    // Delete service request
    await prisma.serviceRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Request deleted successfully." });
  } catch (error: any) {
    console.error("Delete Request Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete service request." }, { status: 500 });
  }
}
