/**
 * Anti-Circumvention & Moderation Engine for Servora Marketplace
 * Masks phone numbers, emails, external URLs, and off-platform payment handles.
 */

export interface ModerationResult {
  cleanContent: string;
  wasFlagged: boolean;
  reason?: "PHONE_MASKED" | "EMAIL_MASKED" | "URL_MASKED" | "OFF_PLATFORM_PAYMENT" | null;
}

export function checkAndMaskCircumvention(content: string): ModerationResult {
  let cleanContent = content;
  let wasFlagged = false;
  let reason: ModerationResult["reason"] = null;

  // 1. Ghanaian Phone Number RegEx (e.g., 0244123456, +233 50 123 4567, 020-123-4567, 055 123 4567)
  const ghanaPhoneRegex = /(?:\+?233|0)\s*(?:20|23|24|26|27|50|53|54|55|57|59|28)\s*[-.\s]?\d{3}\s*[-.\s]?\d{4}\b/gi;
  if (ghanaPhoneRegex.test(cleanContent)) {
    wasFlagged = true;
    reason = "PHONE_MASKED";
    cleanContent = cleanContent.replace(
      ghanaPhoneRegex,
      "[PHONE NUMBER MASKED — USE SERVORA SECURE CHAT & CHECKOUT]"
    );
  }

  // 2. Email Address RegEx
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  if (emailRegex.test(cleanContent)) {
    wasFlagged = true;
    reason = reason || "EMAIL_MASKED";
    cleanContent = cleanContent.replace(
      emailRegex,
      "[EMAIL MASKED — FOR SAFETY KEEP MESSAGES ON SERVORA]"
    );
  }

  // 3. Off-Platform External URLs (excluding servora.vercel.app & whatsapp.com links)
  const externalUrlRegex = /(https?:\/\/(?!servora|api\.whatsapp)[^\s]+)/gi;
  if (externalUrlRegex.test(cleanContent)) {
    wasFlagged = true;
    reason = reason || "URL_MASKED";
    cleanContent = cleanContent.replace(
      externalUrlRegex,
      "[EXTERNAL LINK REMOVED FOR SECURITY]"
    );
  }

  // 4. Off-Platform Payment Keywords (e.g. "send momo direct", "pay to my personal mtn momo", "cash outside")
  const offPlatformRegex = /\b(send momo direct|direct transfer to my|pay me outside|cash on delivery direct|skip platform|pay off-site|personal momo number)\b/gi;
  if (offPlatformRegex.test(cleanContent)) {
    wasFlagged = true;
    reason = reason || "OFF_PLATFORM_PAYMENT";
    cleanContent = cleanContent.replace(
      offPlatformRegex,
      "[OFF-PLATFORM PAYMENT ATTEMPT MASKED]"
    );
  }

  return {
    cleanContent,
    wasFlagged,
    reason,
  };
}
