import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery/verifications/[id]/approve - Admin Approve / Reject Provider Verification
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { id: providerId } = await params;
    const { action, rejectionReason, targetType } = await req.json(); // action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE"

    if (!["APPROVE", "REJECT", "SUSPEND", "REACTIVATE"].includes(action)) {
      return NextResponse.json({ error: "Invalid action type." }, { status: 400 });
    }

    if (targetType === "vehicle") {
      const vehicle = await prisma.deliveryVehicle.findUnique({
        where: { id: providerId },
        include: { provider: true },
      });

      if (!vehicle) {
        return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
      }

      const statusMap: Record<string, string> = {
        APPROVE: "APPROVED",
        REJECT: "REJECTED",
        SUSPEND: "REJECTED",
        REACTIVATE: "APPROVED",
      };

      const updatedVehicle = await prisma.deliveryVehicle.update({
        where: { id: vehicle.id },
        data: {
          verificationStatus: statusMap[action],
          rejectionReason: action === "REJECT" ? rejectionReason || "Vehicle document review failed." : null,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: `DELIVERY_VEHICLE_${action}`,
          details: `Admin ${action} vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber || "No Plate"}) for provider ${vehicle.providerId}.`,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Vehicle ${action.toLowerCase()}d successfully!`,
        vehicle: updatedVehicle,
      });
    } else {
      const provider = await prisma.deliveryProviderProfile.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
      }

      const statusMap: Record<string, string> = {
        APPROVE: "APPROVED",
        REJECT: "REJECTED",
        SUSPEND: "SUSPENDED",
        REACTIVATE: "APPROVED",
      };

      const nextStatus = statusMap[action];

      const updatedProvider = await prisma.deliveryProviderProfile.update({
        where: { id: provider.id },
        data: {
          verificationStatus: nextStatus,
          rejectionReason: action === "REJECT" || action === "SUSPEND" ? rejectionReason || "Identity verification review failed." : null,
          // If suspended, force offline
          ...(nextStatus === "SUSPENDED" || nextStatus === "REJECTED" ? { isOnline: false } : {}),
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: `DELIVERY_PROVIDER_${action}`,
          details: `Admin ${action} delivery provider ${provider.userId}. Status set to ${nextStatus}.`,
        },
      }).catch(() => {});

      // In-app Notification to Provider
      await prisma.notification.create({
        data: {
          userId: provider.userId,
          title: `Delivery Provider Verification Status: ${nextStatus} 🚚`,
          message:
            nextStatus === "APPROVED"
              ? "Congratulations! Your identity and documents have been approved by Servora Administrators. You can now GO ONLINE to accept delivery jobs!"
              : `Your provider verification status was updated to ${nextStatus}. Reason: ${rejectionReason || "Please review your documents."}`,
          link: "/delivery/provider/dashboard",
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `Delivery provider verification updated to ${nextStatus}!`,
        provider: updatedProvider,
      });
    }
  } catch (error: any) {
    console.error("POST Admin Verification Approval Error:", error);
    return NextResponse.json({ error: "Failed to process verification action." }, { status: 500 });
  }
}
