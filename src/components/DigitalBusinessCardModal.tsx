"use client";

import React from "react";
import { X, QrCode, Share2, PhoneCall, ShieldCheck, MapPin, Download, CheckCircle2 } from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { toast } from "@/lib/toast";

interface DigitalBusinessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  slug: string;
  serviceArea: string;
  phone?: string;
  ratingAverage?: number;
  verificationStatus?: string;
}

export function DigitalBusinessCardModal({
  isOpen,
  onClose,
  businessName,
  slug,
  serviceArea,
  phone = "",
  ratingAverage = 5.0,
  verificationStatus = "VERIFIED",
}: DigitalBusinessCardModalProps) {
  if (!isOpen) return null;

  const profileUrl = `https://servora.vercel.app/provider/${slug}`;
  // Generate high quality QR code SVG URL using Google Charts QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    profileUrl
  )}&color=059669`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white space-y-5 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />

        <div className="flex items-center justify-between border-b border-stone-800 pb-3 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <QrCode className="w-4 h-4" /> Servora Digital Business Card
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-700/80 rounded-2xl p-5 shadow-inner space-y-4 relative z-10">
          {/* Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-800">
              <ShieldCheck className="w-3 h-3" /> VERIFIED PROVIDER
            </div>
            <h3 className="text-xl font-black text-white">{businessName}</h3>
            <p className="text-xs text-stone-400 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {serviceArea}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto shadow-md border border-stone-200 flex items-center justify-center">
            <img src={qrCodeUrl} alt={`${businessName} QR Code`} className="w-full h-full object-contain" />
          </div>

          <p className="text-[11px] text-stone-400">
            Scan with smartphone camera to view full digital portfolio & book services on Servora Northern Marketplace.
          </p>

          {/* Direct WhatsApp CTA */}
          <div className="pt-2">
            <WhatsAppShareButton
              variant="direct"
              phone={phone}
              text={`Hello ${businessName}, I scanned your Servora QR code business card and would like to inquire about your services.`}
              label="Contact via WhatsApp"
              className="w-full py-2.5 text-xs"
            />
          </div>
        </div>

        {/* Footer Copy link */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast.info("Storefront Link Copied 🔗", "Web link copied to clipboard.");
            }}
            className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-700 transition cursor-pointer"
          >
            Copy Web Link 🔗
          </button>
        </div>
      </div>
    </div>
  );
}
