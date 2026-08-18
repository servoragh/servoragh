import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCrmCustomers } from "@/lib/crmStore";
import { CustomerStatus, VerificationTier, RiskLevel } from "@/lib/crmTypes";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as CustomerStatus | "ALL") || "ALL";
    const riskLevel = (searchParams.get("riskLevel") as RiskLevel | "ALL") || "ALL";
    const verificationTier = (searchParams.get("verificationTier") as VerificationTier | "ALL") || "ALL";
    const tag = searchParams.get("tag") || "ALL";
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

    const { customers, total } = await getAllCrmCustomers({
      search,
      status,
      riskLevel,
      verificationTier,
      tag,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      customers,
      total,
      metrics: {
        totalCustomers: customers.length,
        activeCount: customers.filter((c) => c.status === "ACTIVE").length,
        suspendedCount: customers.filter((c) => c.status === "SUSPENDED" || c.status === "BANNED").length,
        highRiskCount: customers.filter((c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL").length,
        totalLtvVolume: customers.reduce((acc, c) => acc + c.lifetimeValue, 0),
      },
    });
  } catch (error: any) {
    console.error("CRM Customers GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch CRM customer profiles." }, { status: 500 });
  }
}
