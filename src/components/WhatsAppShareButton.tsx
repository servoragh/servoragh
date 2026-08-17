"use client";

import React from "react";
import { MessageSquareShare, Send } from "lucide-react";
import { buildWhatsAppShareUrl, buildWhatsAppDirectUrl } from "@/lib/utils";

interface WhatsAppShareButtonProps {
  text: string;
  phone?: string;
  variant?: "share" | "direct";
  label?: string;
  className?: string;
}

export function WhatsAppShareButton({
  text,
  phone,
  variant = "share",
  label,
  className = "",
}: WhatsAppShareButtonProps) {
  const url = variant === "direct" && phone
    ? buildWhatsAppDirectUrl(phone, text)
    : buildWhatsAppShareUrl(text);

  const defaultLabel = variant === "direct" ? "WhatsApp Artisan" : "Share on WhatsApp";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition shadow-sm ${className}`}
    >
      {variant === "direct" ? (
        <Send className="w-4 h-4" />
      ) : (
        <MessageSquareShare className="w-4 h-4" />
      )}
      <span>{label || defaultLabel}</span>
    </a>
  );
}
