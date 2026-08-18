import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAllTickers,
  saveTickerItem,
  deleteTickerItem,
  toggleTickerItem,
  resetTickersToDefault,
} from "@/lib/tickersStore";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const tickers = await getAllTickers();
    return NextResponse.json({ success: true, tickers });
  } catch (error: any) {
    console.error("Admin Get Tickers Error:", error);
    return NextResponse.json({ error: "Failed to fetch ticker list." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, text, tag, badgeText, badgeColor, ctaLabel, ctaUrl, isActive, displayOrder } = body;

    if (action === "TOGGLE") {
      if (!id) return NextResponse.json({ error: "Ticker ID is required." }, { status: 400 });
      const updated = await toggleTickerItem(id);
      return NextResponse.json({ success: true, ticker: updated });
    }

    if (action === "RESET") {
      const resetList = await resetTickersToDefault();
      return NextResponse.json({ success: true, tickers: resetList });
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Ticker message text is required." }, { status: 400 });
    }

    const saved = await saveTickerItem({
      id,
      text,
      tag: tag || "ANNOUNCEMENT",
      badgeText: badgeText || "PROMO",
      badgeColor: badgeColor || "emerald",
      ctaLabel: ctaLabel || "",
      ctaUrl: ctaUrl || "",
      isActive: isActive ?? true,
      displayOrder: displayOrder ? Number(displayOrder) : undefined,
    });

    return NextResponse.json({ success: true, ticker: saved });
  } catch (error: any) {
    console.error("Admin Save Ticker Error:", error);
    return NextResponse.json({ error: "Failed to save ticker announcement." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ticker ID parameter is required." }, { status: 400 });
    }

    await deleteTickerItem(id);
    return NextResponse.json({ success: true, message: "Ticker announcement deleted successfully." });
  } catch (error: any) {
    console.error("Admin Delete Ticker Error:", error);
    return NextResponse.json({ error: "Failed to delete ticker announcement." }, { status: 500 });
  }
}
