import { prisma } from "@/lib/prisma";
import { EmailProviderAdapter, EmailSendPayload, EmailSendResult } from "./types";
import { ResendAdapter } from "./adapters/resendAdapter";
import { BrevoAdapter } from "./adapters/brevoAdapter";
import { SmtpAdapter } from "./adapters/smtpAdapter";
import { MockAdapter } from "./adapters/mockAdapter";

export * from "./types";

export function getActiveEmailAdapter(): EmailProviderAdapter {
  const providerEnv = (process.env.EMAIL_PROVIDER || "mock").toLowerCase().trim();

  switch (providerEnv) {
    case "resend":
      return new ResendAdapter();
    case "brevo":
      return new BrevoAdapter();
    case "smtp":
      return new SmtpAdapter();
    case "mock":
    default:
      return new MockAdapter();
  }
}

/**
 * Asynchronous, non-blocking transactional email dispatcher with automatic
 * exponential retries (up to 3 retries) and PostgreSQL EmailLog tracking.
 */
export async function sendTransactionalEmail(payload: EmailSendPayload): Promise<EmailSendResult> {
  const adapter = getActiveEmailAdapter();
  const category = payload.category || "SYSTEM_NOTIFICATIONS";
  const senderEmail = payload.from || process.env.SYSTEM_NOTIFICATIONS_FROM || "notifications@mail.servora.com";

  // 1. Initial EmailLog creation in QUEUED state
  let logRecord: any = null;
  try {
    logRecord = await prisma.emailLog.create({
      data: {
        recipientEmail: payload.to,
        recipientName: payload.recipientName || null,
        senderEmail: senderEmail,
        subject: payload.subject,
        templateName: payload.templateName || "CUSTOM_TRANSACTIONAL",
        category: category,
        status: "QUEUED",
        provider: adapter.name,
        templateData: payload.templateData ? JSON.stringify(payload.templateData) : null,
        userId: payload.userId || null,
      },
    });
  } catch (err) {
    console.warn("Failed to create initial EmailLog in DB:", err);
  }

  // 2. Asynchronous Execution with Exponential Backoff Retries
  let result: EmailSendResult = {
    success: false,
    provider: adapter.name,
    error: "Execution pending.",
  };

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    result = await adapter.send(payload);

    if (result.success) {
      break;
    }

    // Exponential backoff delay (200ms, 400ms, 800ms)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, attempt - 1)));
    }
  }

  // 3. Update EmailLog with final status & provider message ID
  if (logRecord?.id) {
    try {
      await prisma.emailLog.update({
        where: { id: logRecord.id },
        data: {
          status: result.success ? "SENT" : "FAILED",
          providerMessageId: result.messageId || null,
          errorMessage: result.error || null,
          retryCount: attempt - 1,
          sentAt: result.success ? new Date() : null,
        },
      });
    } catch (err) {
      console.warn("Failed to update EmailLog status:", err);
    }
  }

  return result;
}
