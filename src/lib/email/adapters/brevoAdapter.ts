import { EmailProviderAdapter, EmailSendPayload, EmailSendResult } from "../types";

export class BrevoAdapter implements EmailProviderAdapter {
  readonly name = "brevo";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY || "";
  }

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    if (!this.apiKey) {
      return {
        success: false,
        provider: "brevo",
        error: "BREVO_API_KEY is not configured in environment variables.",
      };
    }

    try {
      const fromSender = payload.from || process.env.SYSTEM_NOTIFICATIONS_FROM || "Servora <notifications@mail.servora.com>";
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Servora System", email: "notifications@mail.servora.com" },
          to: [{ email: payload.to, name: payload.recipientName || undefined }],
          subject: payload.subject,
          htmlContent: payload.html,
          textContent: payload.text || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          provider: "brevo",
          error: data.message || "Brevo API call failed.",
        };
      }

      return {
        success: true,
        provider: "brevo",
        messageId: data.messageId,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "brevo",
        error: e.message || "Network error connecting to Brevo API.",
      };
    }
  }
}
