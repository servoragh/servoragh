"use client";

import React, { useState } from "react";
import { MessageSquareShare, Send, ShieldCheck } from "lucide-react";
import { buildWhatsAppShareUrl, buildWhatsAppDirectUrl } from "@/lib/utils";
import { EscrowDealModal } from "@/components/EscrowDealModal";

interface WhatsAppShareButtonProps {
  text: string;
  phone?: string;
  variant?: "share" | "direct";
  label?: string;
  className?: string;
  sellerBusinessName?: string;
  showEscrowOption?: boolean;
}

export function WhatsAppShareButton({
  text,
  phone,
  variant = "share",
  label,
  className = "",
  sellerBusinessName,
  showEscrowOption = true,
}: WhatsAppShareButtonProps) {
  const [isEscrowOpen, setIsEscrowOpen] = useState(false);

  const url = variant === "direct" && phone
    ? buildWhatsAppDirectUrl(phone, text)
    : buildWhatsAppShareUrl(text);

  const defaultLabel = variant === "direct" ? "Chat on WhatsApp" : "Share on WhatsApp";

  return (
    <>
      <div className="inline-flex items-center gap-2">
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

        {variant === "direct" && showEscrowOption && (
          <button
            type="button"
            onClick={() => setIsEscrowOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Lock funds safely in Servora Escrow if you don't trust sending money upfront directly"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Safe MoMo Escrow 🛡️</span>
          </button>
        )}
      </div>

      <EscrowDealModal
        isOpen={isEscrowOpen}
        onClose={() => setIsEscrowOpen(false)}
        sellerPhone={phone}
        sellerBusinessName={sellerBusinessName}
      />
    </>
  );
}
