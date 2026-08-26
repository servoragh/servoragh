import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEscrowDeals, createEscrowDeal, updateEscrowStatus } from "@/lib/escrowStore";
import { EscrowStatus } from "@/lib/escrowTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as EscrowStatus | "ALL") || "ALL";
    const search = searchParams.get("search") || undefined;

    const { deals, stats } = await getEscrowDeals(status, search);

    return NextResponse.json({
      success: true,
      deals,
      stats,
    });
  } catch (error: any) {
    console.error("Escrow GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch escrow deals." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { action, dealData, dealId, newStatus, reason } = body;

    if (action === "CREATE_DEAL") {
      if (!dealData || !dealData.title || !dealData.amountGhs) {
        return NextResponse.json({ error: "Title and amount in GHS are required." }, { status: 400 });
      }

      const created = await createEscrowDeal({
        title: dealData.title,
        amountGhs: Number(dealData.amountGhs),
        platformFeeGhs: 0,
        sellerPayoutGhs: Number(dealData.amountGhs),
        buyerName: dealData.buyerName || session?.name || "Customer Buyer",
        buyerPhone: dealData.buyerPhone || session?.phone || "+233240000000",
        sellerName: dealData.sellerName || "Business Seller",
        sellerPhone: dealData.sellerPhone || "+233240000000",
        sellerBusinessName: dealData.sellerBusinessName,
        deliveryArea: dealData.deliveryArea || "Tamale",
        momoProvider: dealData.momoProvider || "MTN_MOMO",
        momoReference: dealData.momoReference || `MOMO-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: dealData.notes || "Safe Escrow created for WhatsApp direct transaction.",
      });

      return NextResponse.json({
        success: true,
        message: "Servora Safe MoMo Escrow Deal created successfully!",
        deal: created,
      });
    }

    if (action === "UPDATE_STATUS") {
      if (!dealId || !newStatus) {
        return NextResponse.json({ error: "Deal ID and new status are required." }, { status: 400 });
      }

      const updated = await updateEscrowStatus(dealId, newStatus, reason);
      if (!updated) {
        return NextResponse.json({ error: "Escrow deal not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Escrow deal updated to ${newStatus}.`,
        deal: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Escrow POST Error:", error);
    return NextResponse.json({ error: "Failed to process escrow action." }, { status: 500 });
  }
}
