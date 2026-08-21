import { EmailProviderAdapter, EmailSendPayload, EmailSendResult } from "../types";

export class MockAdapter implements EmailProviderAdapter {
  readonly name = "mock";

  async send(payload: EmailSendPayload): Promise<EmailSendResult> {
    const mockMessageId = `mock-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    console.log("-------------------------------------------------------------");
    console.log(`[MOCK MAILER SANDBOX] Dispatched to: ${payload.to}`);
    console.log(`[Subject]: ${payload.subject}`);
    console.log(`[Template]: ${payload.templateName || "Custom HTML"}`);
    console.log(`[Message ID]: ${mockMessageId}`);
    console.log("-------------------------------------------------------------");

    return {
      success: true,
      provider: "mock",
      messageId: mockMessageId,
    };
  }
}
