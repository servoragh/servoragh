import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Master Admin access required." }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany().catch(() => []);
    const flags = await prisma.featureFlag.findMany().catch(() => []);

    const controlsState: Record<string, boolean> = {
      PAUSE_REGISTRATIONS: false,
      PAUSE_DELIVERIES: false,
      PAUSE_PAYMENTS: false,
      PAUSE_ONBOARDING: false,
      DISABLE_INDIVIDUAL_SERVICES: false,
      DISABLE_INDIVIDUAL_PAYMENT_METHODS: false,
      MAINTENANCE_MODE: false,
    };

    for (const s of settings) {
      if (s.key in controlsState) {
        controlsState[s.key] = s.value === "true";
      }
    }

    return NextResponse.json({
      controls: controlsState,
      settings,
      flags,
    });
  } catch (error: any) {
    console.error("GET Emergency Controls Error:", error);
    return NextResponse.json({ error: "Failed to fetch emergency controls state." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Master Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { controlKey, isEnabled, reason, targetService } = body;

    if (!controlKey) {
      return NextResponse.json({ error: "Control key is required." }, { status: 400 });
    }

    const valueStr = isEnabled ? "true" : "false";

    // 1. Persist in SystemSetting table
    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: controlKey },
      update: {
        value: valueStr,
        updatedBy: session.id,
      },
      create: {
        key: controlKey,
        value: valueStr,
        updatedBy: session.id,
      },
    });

    // 2. Also update or sync FeatureFlag table
    await prisma.featureFlag.upsert({
      where: { name: controlKey },
      update: {
        isEnabled: isEnabled,
        description: `Emergency Master Admin Control for ${controlKey}. Reason: ${reason || "None"}`,
      },
      create: {
        name: controlKey,
        isEnabled: isEnabled,
        description: `Emergency Master Admin Control for ${controlKey}. Reason: ${reason || "None"}`,
      },
    }).catch(() => null);

    // 3. Write Immutable Audit Log
    const actionName = isEnabled ? `EMERGENCY_ENABLE_${controlKey}` : `EMERGENCY_RESTORE_${controlKey}`;
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: actionName,
        details: `Master Admin (${session.name || session.email}) toggled "${controlKey}" to ${valueStr}. Impact Target: ${targetService || "Global System"}. Reason: ${reason || "Admin Intervention"}`,
      },
    });

    // 4. Create Incident Log if emergency enabled
    if (isEnabled) {
      await prisma.systemIncident.create({
        data: {
          serviceName: targetService || controlKey,
          severity: "CRITICAL",
          title: `Emergency Control Activated: ${controlKey}`,
          errorMessage: `Master Admin triggered emergency pause. Reason: ${reason || "System safety protocol activated."}`,
          status: "ACTIVE",
        },
      }).catch(() => null);
    } else {
      // Mark active incident resolved
      await prisma.systemIncident.updateMany({
        where: { serviceName: targetService || controlKey, status: "ACTIVE" },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      controlKey,
      isEnabled,
      updatedSetting,
    });
  } catch (error: any) {
    console.error("POST Emergency Controls Error:", error);
    return NextResponse.json({ error: "Failed to update emergency control." }, { status: 500 });
  }
}
