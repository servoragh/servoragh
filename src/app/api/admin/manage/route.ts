import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetId, payload } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    switch (action) {
      case "TOGGLE_VERIFICATION": {
        const provider = await prisma.providerProfile.findUnique({ where: { id: targetId } });
        if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });
        
        const newStatus = provider.verificationStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
        const updated = await prisma.providerProfile.update({
          where: { id: targetId },
          data: { verificationStatus: newStatus },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_TOGGLE_VERIFICATION",
            details: `Admin changed verification status for provider ${provider.businessName} to ${newStatus}`,
          },
        });

        return NextResponse.json({ success: true, provider: updated });
      }

      case "TOGGLE_PROMOTED_PROVIDER": {
        const provider = await prisma.providerProfile.findUnique({ where: { id: targetId } });
        if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

        const updated = await prisma.providerProfile.update({
          where: { id: targetId },
          data: { isPromoted: !provider.isPromoted },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_TOGGLE_PROMOTED",
            details: `Admin toggled promoted status for ${provider.businessName} to ${!provider.isPromoted}`,
          },
        });

        return NextResponse.json({ success: true, provider: updated });
      }

      case "TOGGLE_USER_ROLE": {
        const user = await prisma.user.findUnique({ where: { id: targetId } });
        if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

        const nextRole = user.role === "CUSTOMER" ? "PROVIDER" : user.role === "PROVIDER" ? "ADMIN" : "CUSTOMER";
        const updated = await prisma.user.update({
          where: { id: targetId },
          data: { role: nextRole },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_CHANGE_USER_ROLE",
            details: `Admin changed role of user ${user.name} (${user.email || user.phone}) to ${nextRole}`,
          },
        });

        return NextResponse.json({ success: true, user: updated });
      }

      case "DELETE_USER": {
        const user = await prisma.user.findUnique({ where: { id: targetId } });
        if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

        await prisma.user.delete({ where: { id: targetId } });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_DELETE_USER",
            details: `Admin deleted user ${user.name} (ID: ${targetId})`,
          },
        });

        return NextResponse.json({ success: true, message: "User deleted." });
      }

      case "TOGGLE_PRODUCT_AVAILABILITY": {
        const product = await prisma.product.findUnique({ where: { id: targetId } });
        if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

        const updated = await prisma.product.update({
          where: { id: targetId },
          data: { isAvailable: !product.isAvailable },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_TOGGLE_PRODUCT",
            details: `Admin toggled availability for product "${product.title}" to ${!product.isAvailable}`,
          },
        });

        return NextResponse.json({ success: true, product: updated });
      }

      case "DELETE_PRODUCT": {
        const product = await prisma.product.findUnique({ where: { id: targetId } });
        if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

        await prisma.product.delete({ where: { id: targetId } });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_DELETE_PRODUCT",
            details: `Admin deleted product "${product.title}" (ID: ${targetId})`,
          },
        });

        return NextResponse.json({ success: true, message: "Product deleted." });
      }

      case "DELETE_PROVIDER": {
        const provider = await prisma.providerProfile.findUnique({ where: { id: targetId } });
        if (!provider) return NextResponse.json({ error: "Provider not found." }, { status: 404 });

        await prisma.providerProfile.delete({ where: { id: targetId } });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_DELETE_PROVIDER",
            details: `Admin deleted provider profile "${provider.businessName}"`,
          },
        });

        return NextResponse.json({ success: true, message: "Provider deleted." });
      }

      case "DELETE_SERVICE_REQUEST": {
        const req = await prisma.serviceRequest.findUnique({ where: { id: targetId } });
        if (!req) return NextResponse.json({ error: "Request not found." }, { status: 404 });

        await prisma.serviceRequest.delete({ where: { id: targetId } });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_DELETE_REQUEST",
            details: `Admin deleted customer service request "${req.title}"`,
          },
        });

        return NextResponse.json({ success: true, message: "Service request deleted." });
      }

      case "TOGGLE_FEATURE_FLAG": {
        const flag = await prisma.featureFlag.findUnique({ where: { id: targetId } });
        if (!flag) return NextResponse.json({ error: "Feature flag not found." }, { status: 404 });

        const updated = await prisma.featureFlag.update({
          where: { id: targetId },
          data: { isEnabled: !flag.isEnabled },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_TOGGLE_FEATURE_FLAG",
            details: `Admin toggled feature flag "${flag.name}" to ${!flag.isEnabled}`,
          },
        });

        return NextResponse.json({ success: true, flag: updated });
      }

      case "CREATE_SERVICE": {
        const { name, categoryId, description } = payload || {};
        if (!name || !categoryId) {
          return NextResponse.json({ error: "Service name and category ID are required." }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newService = await prisma.service.create({
          data: {
            name,
            slug,
            categoryId,
            description: description || name,
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_CREATE_SERVICE",
            details: `Admin created new service "${name}"`,
          },
        });

        return NextResponse.json({ success: true, service: newService });
      }

      case "DELETE_SERVICE": {
        const service = await prisma.service.findUnique({ where: { id: targetId } });
        if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

        await prisma.service.delete({ where: { id: targetId } });

        await prisma.auditLog.create({
          data: {
            userId: session.id,
            action: "ADMIN_DELETE_SERVICE",
            details: `Admin deleted service "${service.name}"`,
          },
        });

        return NextResponse.json({ success: true, message: "Service deleted." });
      }

      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin Manage Error:", error);
    return NextResponse.json({ error: "Failed to perform admin management action." }, { status: 500 });
  }
}
