import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/provider/wallet - Get wallet metrics & withdrawal history
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
      include: {
        withdrawals: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      walletBalance: Number(provider.walletBalance || 0),
      pendingBalance: Number(provider.pendingBalance || 0),
      totalEarnings: Number(provider.totalEarnings || 0),
      completedDeliveriesCount: provider.completedDeliveriesCount,
      withdrawals: provider.withdrawals,
    });
  } catch (error: any) {
    console.error("GET Provider Wallet Error:", error);
    return NextResponse.json({ error: "Failed to load wallet data." }, { status: 500 });
  }
}

// POST /api/delivery/provider/withdraw - Request payout withdrawal
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const provider = await prisma.deliveryProviderProfile.findUnique({
      where: { userId: session.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found." }, { status: 404 });
    }

    const { amount, paymentMethod, accountName, accountNumber, networkOrBank } = await req.json();
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < 10) {
      return NextResponse.json({ error: "Minimum withdrawal amount is GHS 10.00" }, { status: 400 });
    }

    const currentBalance = Number(provider.walletBalance || 0);
    if (withdrawAmount > currentBalance) {
      return NextResponse.json({ error: "Insufficient available wallet balance." }, { status: 400 });
    }

    if (!accountName || !accountNumber || !networkOrBank) {
      return NextResponse.json({ error: "Account Name, Mobile Money/Bank Number, and Network/Bank are required." }, { status: 400 });
    }

    // Deduct available balance & create withdrawal request
    const withdrawal = await prisma.deliveryWithdrawal.create({
      data: {
        providerId: provider.id,
        amount: withdrawAmount,
        paymentMethod: paymentMethod || "MOBILE_MONEY",
        accountName,
        accountNumber,
        networkOrBank,
        status: "PENDING",
      },
    });

    await prisma.deliveryProviderProfile.update({
      where: { id: provider.id },
      data: {
        walletBalance: { decrement: withdrawAmount },
        pendingBalance: { increment: withdrawAmount },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for GHS ${withdrawAmount.toFixed(2)} submitted! It will be processed via Mobile Money/Bank shortly.`,
      withdrawal,
    });
  } catch (error: any) {
    console.error("POST Provider Withdrawal Request Error:", error);
    return NextResponse.json({ error: "Failed to submit withdrawal request." }, { status: 500 });
  }
}
