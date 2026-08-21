import { EmailProviderAdapter, EmailSendPayload, EmailSendResult } from "../types";

export class ResendAdapter implements EmailProviderAdapter {
  readonly name = "resend";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
  }

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    if (!this.apiKey) {
      return {
        success: false,
        provider: "resend",
        error: "RESEND_API_KEY is not configured in environment variables.",
      };
    }

    try {
      const fromSender = payload.from || process.env.SYSTEM_NOTIFICATIONS_FROM || "Servora <notifications@mail.servora.com>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromSender,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text || "",
          reply_to: payload.replyTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          provider: "resend",
          error: data.message || data.error?.message || "Resend API call failed.",
        };
      }

      return {
        success: true,
        provider: "resend",
        messageId: data.id,
      };
    } catch (e: any) {
      return {
        success: false,
        provider: "resend",
        error: e.message || "Network failure connecting to Resend API.",
      };
    }
  }
}
