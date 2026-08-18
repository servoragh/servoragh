import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCustomerTags } from "@/lib/crmStore";

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
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: "Tags must be an array of strings." }, { status: 400 });
    }

    const updated = await updateCustomerTags(id, tags, session.id);
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error("CRM Tags POST Error:", error);
    return NextResponse.json({ error: "Failed to update customer tags." }, { status: 500 });
  }
}
