"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Briefcase,
  Building2,
  Wrench,
  PhoneCall,
  Megaphone,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ArrowRight,
} from "lucide-react";
import { TickerItem, INITIAL_DEFAULT_TICKERS } from "@/lib/tickersTypes";

interface TopAnnouncementBarProps {
  initialTickers?: TickerItem[];
  intervalMs?: number;
  previewMode?: boolean;
}

export function TopAnnouncementBar({
  initialTickers,
  intervalMs = 6000,
  previewMode = false,
}: TopAnnouncementBarProps) {
  const [tickers, setTickers] = useState<TickerItem[]>(initialTickers || INITIAL_DEFAULT_TICKERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live active tickers from API if not provided in props or on mount
  useEffect(() => {
    if (previewMode && initialTickers) {
      setTickers(initialTickers.filter((t) => t.isActive));
      return;
    }

    fetch("/api/tickers")
      .then((res) => res.json())
      .then((data) => {
        if (data.tickers && Array.isArray(data.tickers) && data.tickers.length > 0) {
          setTickers(data.tickers);
        }
      })
      .catch((err) => console.log("Using default fallback tickers:", err));
  }, [previewMode, initialTickers]);

  // Sync if preview mode initialTickers changes
  useEffect(() => {
    if (previewMode && initialTickers) {
      const activeOnly = initialTickers.filter((t) => t.isActive);
      setTickers(activeOnly.length > 0 ? activeOnly : initialTickers);
      if (currentIndex >= activeOnly.length) {
        setCurrentIndex(0);
      }
    }
  }, [initialTickers, previewMode]);

  // Auto slide interval setup
  useEffect(() => {
    if (tickers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNextSlide();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [tickers.length, currentIndex, isPaused, intervalMs]);

  const handleNextSlide = () => {
    if (isAnimating || tickers.length <= 1) return;
    setDirection("up");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % tickers.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrevSlide = () => {
    if (isAnimating || tickers.length <= 1) return;
    setDirection("down");
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + tickers.length) % tickers.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (!tickers || tickers.length === 0) return null;

  const currentItem = tickers[currentIndex] || tickers[0];

  // Helper badge color lookup
  const getBadgeStyle = (color?: string, tag?: string) => {
    switch (color || tag) {
      case "JOB_SEEKER":
      case "emerald":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
      case "BUSINESS_OWNER":
      case "indigo":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-400/30";
      case "EXPERT_ARTISAN":
      case "amber":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      case "EMERGENCY":
      case "rose":
        return "bg-rose-500/25 text-rose-200 border-rose-400/40 shadow-xs shadow-rose-900/40";
      case "RENTAL":
      case "teal":
        return "bg-teal-500/20 text-teal-300 border-teal-400/30";
      case "PROMO":
      case "purple":
        return "bg-purple-500/20 text-purple-300 border-purple-400/30";
      case "cyan":
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-400/30";
    }
  };

  // Helper icon selection
  const getIconForTag = (tag?: string) => {
    switch (tag) {
      case "JOB_SEEKER":
        return <Briefcase className="w-3 h-3 text-emerald-300 shrink-0" />;
      case "BUSINESS_OWNER":
        return <Building2 className="w-3 h-3 text-indigo-300 shrink-0" />;
      case "EXPERT_ARTISAN":
        return <Wrench className="w-3 h-3 text-amber-300 shrink-0" />;
      case "EMERGENCY":
        return <PhoneCall className="w-3 h-3 text-rose-300 animate-pulse shrink-0" />;
      case "RENTAL":
        return <ShoppingBag className="w-3 h-3 text-teal-300 shrink-0" />;
      case "PROMO":
        return <Tag className="w-3 h-3 text-purple-300 shrink-0" />;
      default:
        return <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-50 bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-950 text-white border-b border-emerald-500/30 shadow-md font-sans overflow-hidden transition-all duration-300 select-none"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-amber-500/10 opacity-70 blur-md pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-9 flex items-center justify-between gap-2 text-xs relative">
        {/* Left Side Live Indicator Dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-400/90 font-bold">
            SERVORA.GH
          </span>
        </div>

        {/* Middle Vertical Swipe-Up Ticker Slider Area */}
        <div className="flex-1 h-full overflow-hidden relative flex items-center justify-center min-w-0">
          <div
            key={currentItem.id + "-" + currentIndex}
            className={`w-full flex items-center justify-center gap-2 transition-all duration-500 ease-out ${
              isAnimating
                ? direction === "up"
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {/* Tag Badge */}
            {currentItem.badgeText && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border shrink-0 flex items-center gap-1 ${getBadgeStyle(
                  currentItem.badgeColor,
                  currentItem.tag
                )}`}
              >
                {getIconForTag(currentItem.tag)}
                <span>{currentItem.badgeText}</span>
              </span>
            )}

            {/* Main Message Text - Auto-scrolls horizontally on mobile/long text so ENTIRE message is revealed */}
            <div className="min-w-0 flex-1 overflow-hidden relative flex items-center">
              <p className="text-[11px] sm:text-xs font-semibold text-stone-100 whitespace-nowrap animate-ticker-scroll max-w-none">
                {currentItem.text}
              </p>
            </div>

            {/* Optional Call To Action Button (Visible on Mobile & Desktop) */}
            {currentItem.ctaLabel && currentItem.ctaUrl && (
              <Link
                href={currentItem.ctaUrl}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-extrabold text-[9px] sm:text-[10px] shadow-xs transition-all duration-200 hover:scale-105 shrink-0"
              >
                <span>{currentItem.ctaLabel}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Side Navigation Controls & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Pause Badge indicator */}
          {isPaused && tickers.length > 1 && (
            <span className="hidden lg:inline-block text-[9px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded-md">
              PAUSED
            </span>
          )}

          {/* Up / Down Navigation buttons */}
          {tickers.length > 1 && (
            <div className="flex flex-col -space-y-1">
              <button
                onClick={handlePrevSlide}
                className="p-0.5 text-stone-400 hover:text-white transition cursor-pointer"
                title="Previous Announcement (Swipe Down)"
                aria-label="Previous Announcement"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={handleNextSlide}
                className="p-0.5 text-stone-400 hover:text-white transition cursor-pointer"
                title="Next Announcement (Swipe Up)"
                aria-label="Next Announcement"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
