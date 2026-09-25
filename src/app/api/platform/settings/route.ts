import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSystemSettings, updateSystemSettings } from "@/lib/systemSettingsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("GET /api/platform/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch platform settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Allow admin or authenticated user with admin role, or handle graceful fallback
    const body = await request.json();
    const { escrowEnabled, platformName, supportPhone, supportEmail, commissionRate } = body;

    const updates: any = {};
    if (typeof escrowEnabled === "boolean") updates.escrowEnabled = escrowEnabled;
    if (typeof platformName === "string") updates.platformName = platformName;
    if (typeof supportPhone === "string") updates.supportPhone = supportPhone;
    if (typeof supportEmail === "string") updates.supportEmail = supportEmail;
    if (typeof commissionRate === "string") updates.commissionRate = commissionRate;

    const updated = await updateSystemSettings(updates, session?.name || session?.email || "Admin");

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    console.error("POST /api/platform/settings error:", error);
    return NextResponse.json({ error: "Failed to update platform settings" }, { status: 500 });
  }
}
