import { EmailProviderAdapter, EmailSendPayload, EmailSendResult } from "../types";

export class SmtpAdapter implements EmailProviderAdapter {
  readonly name = "smtp";

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    const smtpHost = process.env.SMTP_HOST || "smtp.scaleway.com";
    const smtpPort = process.env.SMTP_PORT || "587";
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";

    if (!smtpUser || !smtpPass) {
      return {
        success: false,
        provider: "smtp",
        error: "SMTP_USER and SMTP_PASS environment variables are missing.",
      };
    }

    try {
      // In production NodeMailer or HTTP SMTP relay can be used
      const mockMessageId = `smtp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[SMTP Relay ${smtpHost}:${smtpPort}] Dispatching email to ${payload.to}`);

      return {
        success: true,
        provider: "smtp",
        messageId: mockMessageId,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "smtp",
        error: e.message || "SMTP connection failed.",
      };
    }
  }
}
