"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Download, ShieldCheck, MapPin, Star, Sparkles, Image as ImageIcon } from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface DigitalPromoFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  slug: string;
  category?: string;
  zone?: string;
  verificationStatus?: string;
  ratingAverage?: number;
  reviewsCount?: number;
  topItems?: Array<{ title: string; price?: number | null }>;
}

export function DigitalPromoFlyerModal({
  isOpen,
  onClose,
  businessName,
  slug,
  category = "Artisan & Merchant Services",
  zone = "Sakasaka, Tamale",
  verificationStatus = "VERIFIED",
  ratingAverage = 4.9,
  reviewsCount = 18,
  topItems = [
    { title: "General Services & Maintenance", price: 50 },
    { title: "Standard Diagnostic & Installation", price: 100 },
    { title: "Custom Orders & Consultations", price: 150 },
  ],
}: DigitalPromoFlyerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://servora.gh";
  const storefrontUrl = `${origin}/biz/${slug}`;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => renderPromoCanvas(), 100);
    }
  }, [isOpen, businessName, slug]);

  function renderPromoCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to 1080x1080 (1:1 high resolution social media post format)
    canvas.width = 1080;
    canvas.height = 1080;

    // Background Gradient (Dark Slate / Emerald theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, "#064e3b"); // Emerald 900
    bgGrad.addColorStop(0.5, "#0f172a"); // Slate 900
    bgGrad.addColorStop(1, "#022c22"); // Dark Teal
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative circle glows
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.beginPath();
    ctx.arc(950, 150, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
    ctx.beginPath();
    ctx.arc(100, 950, 250, 0, Math.PI * 2);
    ctx.fill();

    // Servora Platform Branding Pill
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(80, 70, 420, 60, 30);
    ctx.fill();

    ctx.fillStyle = "#10b981"; // Emerald green accent
    ctx.font = "900 28px Inter, sans-serif";
    ctx.fillText("SERVORA NORTHERN MARKET", 110, 110);

    // Verified Merchant Badge
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(750, 70, 250, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#6ee7b7";
    ctx.font = "800 24px Inter, sans-serif";
    ctx.fillText(`✓ ${verificationStatus}`, 780, 110);

    // Business Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 64px Inter, sans-serif";
    ctx.fillText(businessName, 80, 240);

    // Category & Location Row
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 32px Inter, sans-serif";
    ctx.fillText(`📍 ${zone}  •  🏷️ ${category}`, 80, 300);

    // Rating Star Row
    ctx.fillStyle = "#f59e0b"; // Gold star
    ctx.font = "800 32px Inter, sans-serif";
    ctx.fillText(`★ ${ratingAverage} (${reviewsCount} verified reviews)`, 80, 355);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 400);
    ctx.lineTo(1000, 400);
    ctx.stroke();

    // Featured Offerings / Products Header
    ctx.fillStyle = "#10b981";
    ctx.font = "900 34px Inter, sans-serif";
    ctx.fillText("TOP PRODUCTS & SERVICES:", 80, 470);

    // Render Top 3 Items Cards
    let startY = 510;
    topItems.slice(0, 3).forEach((item, index) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, startY, 920, 100, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 32px Inter, sans-serif";
      ctx.fillText(`${index + 1}. ${item.title}`, 110, startY + 60);

      if (item.price) {
        ctx.fillStyle = "#34d399";
        ctx.font = "900 32px Inter, sans-serif";
        ctx.fillText(`GHS ${item.price.toFixed(2)}`, 780, startY + 60);
      }

      startY += 120;
    });

    // Call to Action Banner Box at bottom
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(80, 890, 920, 110, 24);
    ctx.fill();

    ctx.fillStyle = "#022c22";
    ctx.font = "900 36px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SHOP STOREFRONT & BOOK SERVICES:", 540, 940);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 30px monospace";
    ctx.fillText(storefrontUrl.replace("https://", ""), 540, 980);
    ctx.textAlign = "left"; // Reset alignment
  }

  const handleDownloadFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${slug}-servora-promo-flyer.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track share count
      fetch(`/api/biz/${slug}/track-share`, { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Flyer download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white space-y-5 relative my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
            <ImageIcon className="w-4 h-4" /> Instant Digital Promo Kit Generator
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="space-y-2">
          <p className="text-xs text-stone-400">
            High-resolution 1:1 promo flyer for WhatsApp status updates, Instagram posts, and Facebook stories.
          </p>

          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-950 flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Download Action CTA */}
        <div className="pt-2">
          <button
            onClick={handleDownloadFlyer}
            disabled={downloading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Preparing Image..." : "Download 1:1 PNG Promo Card"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
