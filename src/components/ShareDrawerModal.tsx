"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Globe,
  Smartphone,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface ShareDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  slug: string;
  zone?: string;
  tagline?: string;
}

export function ShareDrawerModal({
  isOpen,
  onClose,
  businessName,
  slug,
  zone = "Tamale",
  tagline = "",
}: ShareDrawerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://servora.gh";
  const storefrontUrl = `${origin}/biz/${slug}`;

  const preformattedMessage = `Check out ${businessName} on Servora! Explore our products, tool rentals, and repair services in ${zone}: ${storefrontUrl}`;

  const trackShare = async () => {
    try {
      await fetch(`/api/biz/${slug}/track-share`, { method: "POST" });
    } catch {}
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    trackShare();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    trackShare();
    const url = `https://wa.me/?text=${encodeURIComponent(preformattedMessage)}`;
    window.open(url, "_blank");
  };

  const handleFacebookShare = () => {
    trackShare();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storefrontUrl)}`;
    window.open(url, "_blank");
  };

  const handleTwitterShare = () => {
    trackShare();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(preformattedMessage)}`;
    window.open(url, "_blank");
  };

  const handleTelegramShare = () => {
    trackShare();
    const url = `https://t.me/share/url?url=${encodeURIComponent(storefrontUrl)}&text=${encodeURIComponent(preformattedMessage)}`;
    window.open(url, "_blank");
  };

  const handleLinkedInShare = () => {
    trackShare();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storefrontUrl)}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        trackShare();
        await navigator.share({
          title: `${businessName} on Servora`,
          text: preformattedMessage,
          url: storefrontUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl text-stone-900 dark:text-white space-y-5 relative overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
            <Share2 className="w-5 h-5" /> Omni-Channel Share Toolkit
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Preview Badge */}
        <div className="bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700">
          <p className="text-xs font-black text-stone-900 dark:text-white mb-0.5">{businessName}</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
            {tagline || `Products, Rentals & Services in ${zone}`}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 truncate">
            {storefrontUrl}
          </p>
        </div>

        {/* Primary WhatsApp Share CTA */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 group"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span>Share directly on WhatsApp</span>
        </button>

        {/* Direct Social Grid */}
        <div>
          <p className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider mb-2.5">
            Social Networks
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <button
              onClick={handleFacebookShare}
              className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-2xl transition flex flex-col items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                f
              </div>
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">Facebook</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-2xl transition flex flex-col items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-700 text-white flex items-center justify-center font-black text-xs">
                𝕏
              </div>
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">X / Twitter</span>
            </button>

            <button
              onClick={handleTelegramShare}
              className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-2xl transition flex flex-col items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-sm">
                ✈️
              </div>
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">Telegram</span>
            </button>

            <button
              onClick={handleLinkedInShare}
              className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-2xl transition flex flex-col items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs">
                in
              </div>
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">LinkedIn</span>
            </button>
          </div>
        </div>

        {/* Native Web Share API & Quick Copy */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" /> Share via Phone Native Apps
            </button>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={storefrontUrl}
              className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
