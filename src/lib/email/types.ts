export interface EmailSendPayload {
  to: string;
  recipientName?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  category?: "AUTHENTICATION" | "GUEST_VERIFICATION" | "MARKETPLACE" | "SERVICE_GIG" | "RENTAL" | "SUPPORT_DISPUTE" | "ADMIN_ALERT" | "SECURITY" | "SYSTEM_NOTIFICATIONS";
  templateName?: string;
  templateData?: Record<string, any>;
  userId?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: "resend" | "brevo" | "smtp" | "mock";
  error?: string;
}

export interface EmailProviderAdapter {
  name: "resend" | "brevo" | "smtp" | "mock";
  send(payload: EmailSendPayload): Promise<EmailSendResult>;
}
