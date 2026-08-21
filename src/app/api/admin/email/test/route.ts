import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/email/templates/templateCatalog";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { toEmail, templateName = "AUTH_EMAIL_VERIFICATION", sampleData = {} } = body;

    if (!toEmail) {
      return NextResponse.json({ error: "Recipient email address is required." }, { status: 400 });
    }

    const rendered = renderEmailTemplate(templateName, {
      name: "Test Administrator",
      title: "5KW Honda Silent Diesel Generator",
      area: "Sakasaka, Tamale",
      serviceName: "Electrical Repair",
      price: "350",
      otpCode: "991823",
      ...sampleData,
    });

    const result = await sendTransactionalEmail({
      to: toEmail,
      recipientName: "Test Recipient",
      subject: `[TEST EMAIL] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      category: rendered.category as any,
      templateName,
      templateData: sampleData,
      userId: session.id,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "TEST_TRANSACTIONAL_EMAIL",
        details: `Sent test transactional email template "${templateName}" to ${toEmail}. Result: ${result.success ? "SUCCESS" : "FAILED"}`,
      },
    });

    return NextResponse.json({ success: true, result, rendered });
  } catch (error: any) {
    console.error("Test Email Send Error:", error);
    return NextResponse.json({ error: "Failed to dispatch test email." }, { status: 500 });
  }
}
