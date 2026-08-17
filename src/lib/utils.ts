import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGHS(amount: number | null | undefined): string {
  if (amount == null) return "GH₵ 0.00";
  return `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getPhoneVariants(phone: string): string[] {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");
  const set = new Set<string>();

  if (raw) set.add(raw);
  if (digits) set.add(digits);

  if (digits.startsWith("233") && digits.length === 12) {
    const local = "0" + digits.slice(3); // e.g. 0500710610
    set.add(local);
    set.add(`+${digits}`); // +233500710610
  } else if (digits.startsWith("0") && digits.length === 10) {
    const intl = "233" + digits.slice(1); // e.g. 233500710610
    set.add(digits);
    set.add(intl);
    set.add(`+${intl}`);
  }

  return Array.from(set);
}

export function calculateTrustScore(provider: {
  verificationStatus: string;
  isPhoneVerified?: boolean;
  ratingAverage: number;
  reviewCount: number;
  completedJobsCount: number;
  responseRate: number;
  yearsExperience: number;
}): number {
  let score = 30; // base score

  if (provider.verificationStatus === "VERIFIED") score += 30;
  else if (provider.verificationStatus === "PENDING") score += 10;

  if (provider.isPhoneVerified) score += 10;
  score += Math.min(provider.ratingAverage * 4, 20); // up to 20 pts from ratings
  score += Math.min(provider.completedJobsCount * 0.5, 10); // up to 10 pts from jobs

  return Math.min(Math.round(score), 100);
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppDirectUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
