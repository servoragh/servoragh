"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, QrCode, Download, ShieldCheck, MapPin, Sparkles, Printer, Copy, Check } from "lucide-react";
import QRCode from "qrcode";

interface QrCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  slug: string;
  zone?: string;
  verificationStatus?: string;
  logoUrl?: string | null;
}

export function QrCodeGeneratorModal({
  isOpen,
  onClose,
  businessName,
  slug,
  zone = "Tamale",
  verificationStatus = "VERIFIED",
  logoUrl = null,
}: QrCodeGeneratorModalProps) {
  const [pngDataUrl, setPngDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://servora.gh";
  const publicUrl = `${origin}/biz/${slug}`;

  useEffect(() => {
    if (isOpen && slug) {
      generateQrCodes();
    }
  }, [isOpen, slug]);

  const trackScanOrDownload = async () => {
    try {
      await fetch(`/api/biz/${slug}/track-scan`, { method: "POST" });
    } catch {}
  };

  async function generateQrCodes() {
    try {
      setGenerating(true);

      // Generate PNG Data URL (high resolution 600x600 for printing)
      const png = await QRCode.toDataURL(publicUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: "#059669", // Emerald color
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setPngDataUrl(png);

      // Generate SVG string for vector printing
      const svg = await QRCode.toString(publicUrl, {
        type: "svg",
        width: 600,
        margin: 2,
        color: {
          dark: "#059669",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      setSvgString(svg);
    } catch (err) {
      console.error("QR Code Generation Error:", err);
    } finally {
      setGenerating(false);
    }
  }

  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    trackScanOrDownload();
    const link = document.createElement("a");
    link.href = pngDataUrl;
    link.download = `${slug}-servora-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    trackScanOrDownload();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}-servora-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCard = () => {
    trackScanOrDownload();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white space-y-5 text-center relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
            <QrCode className="w-4 h-4" /> Print-Ready QR Code Generator
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Frame */}
        <div className="bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-700/80 rounded-2xl p-5 shadow-2xl space-y-4 relative z-10 print:bg-white print:text-black">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-extrabold rounded-full border border-emerald-800">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> {verificationStatus} MERCHANT
            </span>
            <h3 className="text-lg font-black text-white">{businessName}</h3>
            <p className="text-xs text-stone-400 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {zone} Northern Region
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-md border border-stone-200 flex items-center justify-center relative">
            {generating ? (
              <div className="text-xs text-stone-400 font-semibold animate-pulse">Generating QR...</div>
            ) : pngDataUrl ? (
              <img src={pngDataUrl} alt={`${businessName} QR Code`} className="w-full h-full object-contain" />
            ) : null}
          </div>

          <p className="text-[11px] text-stone-400 leading-snug">
            Scan with smartphone camera to view storefront catalog & request service on Servora.
          </p>

          <div className="pt-1 text-[10px] text-emerald-400 font-mono font-bold truncate">
            {publicUrl}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="space-y-2 pt-1 relative z-10">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPng}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              className="py-2.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 font-extrabold text-xs rounded-xl border border-stone-700 transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download SVG
            </button>
          </div>

          <button
            onClick={handlePrintCard}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" /> Print Workshop Signboard Card
          </button>
        </div>
      </div>
    </div>
  );
}
