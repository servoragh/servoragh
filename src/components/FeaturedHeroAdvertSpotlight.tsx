"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Zap,
  Building2,
} from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";

export interface FeaturedAdvertItem {
  id: string;
  businessName: string;
  slug: string;
  ownerName: string;
  phone: string;
  serviceArea: string;
  ratingAverage: number;
  completedJobsCount: number;
  bio: string;
  pricingTag: string;
  avatarUrl: string;
  isPromoted?: boolean;
}

const DEFAULT_FEATURED_ADVERTS: FeaturedAdvertItem[] = [
  {
    id: "adv-1",
    businessName: "Kwame Electrical & Solar",
    slug: "kwame-electrical",
    ownerName: "Kwame Electrician",
    phone: "+233244889900",
    serviceArea: "Sakasaka, Tamale",
    ratingAverage: 4.9,
    completedJobsCount: 142,
    bio: "Certified solar engineer specializing in 3-phase wiring, inverter installations, and borehole pumps.",
    pricingTag: "GH₵ 80/hr Start",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80",
    isPromoted: true,
  },
  {
    id: "adv-2",
    businessName: "Northern Authentic Fugu & Fabrics",
    slug: "northern-fugu",
    ownerName: "Fatima Abdul-Rahman",
    phone: "+233501234567",
    serviceArea: "Nyohini, Tamale",
    ratingAverage: 4.95,
    completedJobsCount: 89,
    bio: "Handwoven Royal Dagbon Smocks (Fugu), custom wedding smock tailoring & nationwide shipping.",
    pricingTag: "From GH₵ 450",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    isPromoted: true,
  },
  {
    id: "adv-3",
    businessName: "Salifu Plumbing & Borehole Services",
    slug: "salifu-plumbing",
    ownerName: "Salifu Yakubu",
    phone: "+233201122334",
    serviceArea: "Choggu, Tamale",
    ratingAverage: 4.8,
    completedJobsCount: 64,
    bio: "Master plumber for high-pressure PVC piping, water tank installation, and emergency leak repairs.",
    pricingTag: "GH₵ 60/hr Start",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    isPromoted: true,
  },
  {
    id: "adv-4",
    businessName: "Goodie Electronics & Refrigeration",
    slug: "goodie-electronics",
    ownerName: "Abdul Hanan",
    phone: "+233500710610",
    serviceArea: "Tamale Central",
    ratingAverage: 4.9,
    completedJobsCount: 110,
    bio: "Expert AC installation, fridge repairs, inverter gas refills, and TV motherboard diagnostics.",
    pricingTag: "From GH₵ 100",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    isPromoted: true,
  },
];

interface FeaturedHeroAdvertSpotlightProps {
  onOpenWizard: () => void;
}

export function FeaturedHeroAdvertSpotlight({ onOpenWizard }: FeaturedHeroAdvertSpotlightProps) {
  const [adverts, setAdverts] = useState<FeaturedAdvertItem[]>(DEFAULT_FEATURED_ADVERTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Fetch live providers from API to load any admin-promoted businesses
    fetch("/api/providers?verified=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.providers && data.providers.length > 0) {
          const formatted: FeaturedAdvertItem[] = data.providers.map((p: any) => ({
            id: p.id,
            businessName: p.businessName,
            slug: p.slug,
            ownerName: p.user?.name || "Business Owner",
            phone: p.user?.phone || "+233240000000",
            serviceArea: p.serviceArea || "Tamale",
            ratingAverage: p.ratingAverage || 4.9,
            completedJobsCount: p.completedJobsCount || 25,
            bio: p.bio || "Verified business provider offering fast, reliable service in Northern Region.",
            pricingTag: p.pricingHourly ? `GH₵ ${p.pricingHourly}/hr` : p.pricingFixedStart ? `From GH₵ ${p.pricingFixedStart}` : "Free Estimate",
            avatarUrl: p.user?.avatarUrl || null,
            isPromoted: p.isPromoted,
          }));

          // Prioritize admin-promoted businesses first
          const promotedList = formatted.filter((item) => item.isPromoted);
          const otherList = formatted.filter((item) => !item.isPromoted);

          const combined = [...promotedList, ...otherList, ...DEFAULT_FEATURED_ADVERTS];
          
          // Deduplicate by business name or id
          const seen = new Set<string>();
          const finalAdverts: FeaturedAdvertItem[] = [];
          for (const item of combined) {
            if (!seen.has(item.businessName)) {
              seen.add(item.businessName);
              finalAdverts.push(item);
            }
          }

          if (finalAdverts.length > 0) {
            setAdverts(finalAdverts);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-swipe effect every 4 seconds
  useEffect(() => {
    if (isPaused || adverts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adverts.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, adverts.length]);

  const currentItem = adverts[currentIndex] || DEFAULT_FEATURED_ADVERTS[0];

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % adverts.length);
  }

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + adverts.length) % adverts.length);
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="hidden lg:block lg:col-span-5 relative z-10"
    >
      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-15px_rgba(0,0,0,0.7)] space-y-4 text-slate-900 dark:text-white relative">
        {/* Subtle Ethereal Accent Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Status & Carousel Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>FEATURED SPOTLIGHT 🚀</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
              {currentIndex + 1}/{adverts.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-white/5"
                title="Previous Featured Advert"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-200/60 dark:border-white/5"
                title="Next Featured Advert"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Business Advert Card Preview (Auto-Swiping) */}
        <div className="p-4 bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl space-y-3 shadow-xs relative z-10 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentItem.avatarUrl ? (
                <img
                  src={currentItem.avatarUrl}
                  alt={currentItem.businessName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/80 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 line-clamp-1">
                  <span>{currentItem.businessName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {currentItem.serviceArea} &bull; {currentItem.ownerName}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-500/30">
                {currentItem.ratingAverage} ⭐ ({currentItem.completedJobsCount} Jobs)
              </span>
              {currentItem.isPromoted && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  Sponsored
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
            {currentItem.bio}
          </p>

          <div className="flex items-center justify-between pt-1 text-xs gap-2">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
              {currentItem.pricingTag}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/provider/${currentItem.slug}`}
                className="px-3 py-1.5 bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition inline-flex items-center gap-1 border border-slate-300/50 dark:border-white/5"
              >
                <span>View Shop</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={onOpenWizard}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1"
              >
                <span>Get Estimate</span>
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {adverts.map((ad, idx) => (
            <button
              key={ad.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              }`}
              title={`Switch to ${ad.businessName}`}
            />
          ))}
        </div>

        {/* Live Community Activity Ticker */}
        <div className="p-3.5 bg-emerald-500/[0.08] dark:bg-emerald-950/25 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl text-xs space-y-2 relative z-10">
          <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            ⚡ Recent Service Request
          </span>
          <p className="text-slate-800 dark:text-slate-200 font-semibold leading-snug">
            "Urgent: 5.5KVA Silent Diesel Generator Needed for 2 Days in Sakasaka Site Work."
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
            <span>Posted 12m ago • 3 Price Offers Received</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Open Active</span>
          </div>
        </div>

        {/* Bottom Feature Badges Bar */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20">
            <Sparkles className="w-3.5 h-3.5 fill-white" /> Direct WhatsApp Messages
          </div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 font-mono">
            ⚡ 0% Platform Fee
          </span>
        </div>
      </div>
    </div>
  );
}
