import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/email/templates/templateCatalog";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return NextResponse.json({ error: "Email log ID is required." }, { status: 400 });
    }

    const existingLog = await prisma.emailLog.findUnique({
      where: { id: logId },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Email log record not found." }, { status: 404 });
    }

    const parsedData = existingLog.templateData ? JSON.parse(existingLog.templateData) : {};
    const rendered = renderEmailTemplate(existingLog.templateName, parsedData);

    const result = await sendTransactionalEmail({
      to: existingLog.recipientEmail,
      recipientName: existingLog.recipientName || undefined,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: existingLog.category as any,
      templateName: existingLog.templateName,
      templateData: parsedData,
      userId: existingLog.userId || undefined,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "RETRY_TRANSACTIONAL_EMAIL",
        details: `Re-triggered email "${existingLog.templateName}" to ${existingLog.recipientEmail}. Result: ${result.success ? "SUCCESS" : "FAILED"}`,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Resend Email Error:", error);
    return NextResponse.json({ error: "Failed to resend email." }, { status: 500 });
  }
}
