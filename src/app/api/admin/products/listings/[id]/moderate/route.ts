import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { moderateProductListing } from "@/lib/productListingsStore";

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
    const { action, rejectionReason } = body;

    if (!action) {
      return NextResponse.json({ error: "Moderation action is required." }, { status: 400 });
    }

    const updated = await moderateProductListing(
      id,
      action,
      { id: session.id, name: session.name || "Master Admin" },
      rejectionReason
    );

    if (!updated && action !== "DELETE") {
      return NextResponse.json({ error: "Product listing not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Product listing moderation action (${action}) completed successfully.`,
      listing: updated,
    });
  } catch (error: any) {
    console.error("Product Moderation POST Error:", error);
    return NextResponse.json({ error: "Failed to execute product moderation action." }, { status: 500 });
  }
}
