import { NextResponse } from "next/server";
import { getActiveTickers, getAllTickers } from "@/lib/tickersStore";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const tickers = includeAll ? await getAllTickers() : await getActiveTickers();

    return NextResponse.json({
      success: true,
      tickers,
      count: tickers.length,
    });
  } catch (error: any) {
    console.error("Error fetching tickers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickers", tickers: [] },
      { status: 500 }
    );
  }
}
