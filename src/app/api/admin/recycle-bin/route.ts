import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getRecycleBinItems,
  restoreRecycleBinItem,
  purgeRecycleBinItem,
  emptyRecycleBin,
} from "@/lib/recycleBinStore";
import { RecycleActorType } from "@/lib/recycleBinTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const actor = (searchParams.get("actor") as RecycleActorType | "ALL") || "ALL";
    const search = searchParams.get("search") || undefined;

    const { items, stats } = await getRecycleBinItems(actor, search);

    return NextResponse.json({
      success: true,
      items,
      stats,
    });
  } catch (error: any) {
    console.error("Admin Recycle Bin GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch recycle bin items." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, actorType } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    if (action === "RESTORE") {
      if (!id) return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
      await restoreRecycleBinItem(id);
      return NextResponse.json({ success: true, message: "Item restored successfully to active platform data." });
    }

    if (action === "PURGE") {
      if (!id) return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
      await purgeRecycleBinItem(id);
      return NextResponse.json({ success: true, message: "Item permanently purged from platform." });
    }

    if (action === "EMPTY") {
      await emptyRecycleBin(actorType || "ALL");
      return NextResponse.json({ success: true, message: "Recycle bin emptied successfully." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin Recycle Bin POST Error:", error);
    return NextResponse.json({ error: "Failed to execute recycle bin action." }, { status: 500 });
  }
}
