import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCrmCustomerById } from "@/lib/crmStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
    }

    const customer = await getCrmCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("CRM Single Customer GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch 360-degree customer profile." }, { status: 500 });
  }
}
