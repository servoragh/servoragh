import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  updateCustomerStatus,
  applyFinancialAdjustment,
  generateShadowLoginToken,
  getCrmCustomerById,
} from "@/lib/crmStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { actionType, status, reason, adjustmentType, amount, title } = body;

    if (!actionType) {
      return NextResponse.json({ error: "Action type is required." }, { status: 400 });
    }

    switch (actionType) {
      case "UPDATE_STATUS": {
        if (!status) return NextResponse.json({ error: "New status is required." }, { status: 400 });
        const updated = await updateCustomerStatus(id, status, session.id, reason);
        return NextResponse.json({ success: true, customer: updated });
      }

      case "FINANCIAL_ADJUSTMENT": {
        if (!adjustmentType || !amount) {
          return NextResponse.json({ error: "Adjustment type and amount are required." }, { status: 400 });
        }
        const updated = await applyFinancialAdjustment(
          id,
          adjustmentType,
          Number(amount),
          title || `Admin ${adjustmentType}`,
          session.id
        );
        return NextResponse.json({ success: true, customer: updated });
      }

      case "SHADOW_LOGIN": {
        if (!reason) {
          return NextResponse.json({ error: "Mandatory admin reason required for shadow login." }, { status: 400 });
        }
        const shadow = await generateShadowLoginToken(id, session.id, reason);
        return NextResponse.json({ success: true, shadowToken: shadow });
      }

      case "SECURITY_OVERRIDE": {
        const customer = await getCrmCustomerById(id);
        if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
        
        // Log security override in activity log
        await updateCustomerStatus(id, customer.status, session.id, `Security Override Triggered: ${reason || "Force Sessions Invalidate"}`);
        return NextResponse.json({ success: true, message: "Security override dispatched successfully." });
      }

      default:
        return NextResponse.json({ error: "Unsupported CRM action type." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("CRM Action POST Error:", error);
    return NextResponse.json({ error: "Failed to execute CRM admin action." }, { status: 500 });
  }
}
