"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  Zap,
  Smartphone,
  Scissors,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Users,
  Sparkles,
  Award,
} from "lucide-react";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { ProviderCard } from "@/components/ProviderCard";
import { ProductCard } from "@/components/ProductCard";
import { UnifiedEcommerceSearch } from "@/components/UnifiedEcommerceSearch";
import { CategoryGridSection } from "@/components/CategoryGridSection";

const QUICK_TAGS = [
  { label: "⚡ Electrical & Solar", query: "Electrical" },
  { label: "📱 Phone Repair", query: "Phone" },
  { label: "🥻 Fugu Tailors", query: "Fugu" },
  { label: "🚰 Plumbing", query: "Plumbing" },
  { label: "🚜 Rentals", query: "Rentals" },
];

export default function HomePage() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Tamale");

  useEffect(() => {
    fetchFeaturedProviders();
    fetchFeaturedProducts();
  }, []);

  async function fetchFeaturedProviders() {
    try {
      setLoadingProviders(true);
      const res = await fetch("/api/providers?limit=6");
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProviders(false);
    }
  }

  async function fetchFeaturedProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setProducts(data.products.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-14 bg-gradient-to-b from-emerald-50/70 via-stone-50 to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border-b border-stone-200 dark:border-stone-800 z-30 transition-colors duration-200 overflow-hidden">
        {/* Ambient Blur Orbs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-emerald-500/15 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & Search Omnibox */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/80 dark:to-teal-950/80 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold shadow-xs backdrop-blur-md max-w-full">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">#1 Local Service & Universal Trade Marketplace in Northern Ghana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-stone-900 dark:text-white">
                Find trusted local services in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300">
                  Northern Ghana.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                Get instant quotes from Ghana Card verified artisans, electricians, plumbers, tailors, and suppliers across Tamale, Bolga & Wa.
              </p>

              {/* Minimalist Ultra-Modern Omnibox Search Bar */}
              <div className="pt-1">
                <UnifiedEcommerceSearch variant="hero" />
              </div>

              {/* Fast Category Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mr-1">Trending:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag.query}
                    onClick={() => setIsWizardOpen(true)}
                    className="px-2.5 py-1 bg-white/80 dark:bg-stone-900/80 hover:bg-emerald-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-[11px] font-bold rounded-full border border-stone-200/80 dark:border-stone-800 transition cursor-pointer shadow-2xs"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-full shadow-lg shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition duration-300" />
                  <span>Post Job & Get Quotes</span>
                </button>

                <Link
                  href="/provider/register"
                  className="text-center text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition"
                >
                  Are you an artisan? <span className="underline">Join as a Provider →</span>
                </Link>
              </div>

              {/* Minimal Trust Badges */}
              <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center justify-start gap-2 sm:gap-4 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs text-stone-800 dark:text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Phone & ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs text-stone-800 dark:text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp Bids</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-2xs text-stone-800 dark:text-stone-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Free Service</span>
                </div>
              </div>
            </div>

            {/* Right Column: Ultra-Modern Theme-Responsive Desktop Live Marketplace Card */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 shadow-2xl shadow-stone-300/40 dark:shadow-black/60 space-y-4 text-stone-900 dark:text-white relative transition-all duration-300">
                {/* Ambient Glow Gradient */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Top Status Bar */}
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                      Live Verified Dispatch Active
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 font-semibold">Tamale • Bolga • Wa</span>
                </div>

                {/* Featured Artisan Card Preview */}
                <div className="p-4 bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/90 dark:border-stone-700/80 rounded-2xl space-y-3 shadow-xs relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80"
                        alt="Kwame Electrical"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
                      />
                      <div>
                        <h4 className="font-black text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                          Kwame Electrical & Solar
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                        </h4>
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Sakasaka, Tamale</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-500/30">
                      4.9 ⭐ (142 Jobs)
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                    Certified solar engineer specializing in 3-phase wiring, inverter installations, and borehole pumps.
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-black text-emerald-700 dark:text-emerald-400">GHS 80/hr Start</span>
                    <button
                      onClick={() => setIsWizardOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                      Request Quote 💬
                    </button>
                  </div>
                </div>

                {/* Live Community Activity Ticker */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-stone-950/60 border border-emerald-200/60 dark:border-stone-800 rounded-2xl text-xs space-y-2 relative z-10">
                  <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                    ⚡ Recent Local Job Call
                  </span>
                  <p className="text-stone-800 dark:text-stone-200 font-semibold leading-snug">
                    "Urgent: 5.5KVA Silent Diesel Generator Needed for 2 Days in Sakasaka Site Work."
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 font-mono">
                    <span>Posted 12m ago • 3 Bids Received</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Open Active</span>
                  </div>
                </div>

                {/* Bottom Feature Badges Bar */}
                <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md shadow-emerald-600/20">
                    <Sparkles className="w-3.5 h-3.5 fill-white" /> Direct WhatsApp Bids
                  </div>
                  <span className="text-[11px] font-extrabold text-stone-600 dark:text-stone-400 font-mono">
                    ⚡ 0% Platform Fee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE NORTHERN CATEGORIES (JIJI 4-COLUMN MOBILE GRID FIRST!) */}
      <CategoryGridSection onPostRequestClick={() => setIsWizardOpen(true)} />

      {/* 3. MATCH VERIFIED ARTISANS BY LOCATION (BELOW EXPLORE NORTHERN CATEGORIES!) */}
      <section className="py-8 sm:py-12 bg-stone-100/60 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Instant Provider Match
                </span>
                <h3 className="font-black text-lg sm:text-2xl text-stone-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
                  <span>Match Verified Artisans</span>
                </h3>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Northern Ghana Active
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium mb-4">
              Select your region or city to filter active local service providers & get instant quotes:
            </p>

            {/* Region / City Quick Filter */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
              {[
                { name: "Tamale", count: "45+ Artisans" },
                { name: "Bolgatanga", count: "28+ Artisans" },
                { name: "Wa", count: "24+ Artisans" },
                { name: "Yendi", count: "18+ Artisans" },
                { name: "Damongo", count: "14+ Artisans" },
                { name: "Nalerigu", count: "12+ Artisans" },
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSelectedNeighborhood(loc.name)}
                  className={`p-3 rounded-2xl text-left border text-xs transition cursor-pointer active:scale-95 duration-150 ${
                    selectedNeighborhood === loc.name
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs ring-2 ring-emerald-500/20"
                      : "bg-stone-50/90 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-white truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{loc.name}</span>
                  </div>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400 block mt-0.5 font-semibold">{loc.count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Post Job Request in {selectedNeighborhood}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. POPULAR SERVICE CATEGORIES */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Most Needed Services in Northern Ghana
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-medium mt-2">
              Browse top service categories requested daily across Northern Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Category 1: Electrical */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition duration-200 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-200">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-2">
                Electrical & Solar Systems
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed font-medium">
                House wiring, solar inverter installations, circuit breaker repairs, fridge gas refill, generator servicing.
              </p>
              <Link
                href="/services/electricians/tamale"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>Find Electrical Experts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Category 2: Electronics */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition duration-200 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-200">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-2">
                Device & Laptop Repairs
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed font-medium">
                Smartphone screen replacement, laptop battery upgrade, charging port fixing, and micro-soldering diagnostics.
              </p>
              <Link
                href="/services/phone-repair/tamale"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>Electronics & Phone Repair</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Category 3: Tailoring */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition duration-200 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-200">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-2">
                Fugu & Bespoke Tailoring
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 leading-relaxed font-medium">
                Authentic Northern Ghana Smocks (Fugu), embroidery, Senator kaftans, and custom wedding attire.
              </p>
              <Link
                href="/services/fugu-tailors/tamale"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>Smock & Tailoring Artisans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED LOCAL PRODUCTS & SUPPLIES (2 COLUMNS ON MOBILE GRID!) */}
      {products.length > 0 && (
        <section className="py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  Northern Business Marketplace
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
                  Local Products & Supplies for Sale
                </h2>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2 COLUMNS ON MOBILE (grid-cols-2), 3 ON TABLET, 4 ON DESKTOP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. HOW IT WORKS */}
      <section className="py-12 sm:py-16 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              How Servora Works
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm font-medium mt-2">
              Getting work done safely across Northern Ghana takes under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-5 sm:p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                1
              </div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white mb-2">Describe Your Need</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                Select your service category, specify your area in Northern Ghana, add optional photos, and choose urgency.
              </p>
            </div>

            <div className="text-center p-5 sm:p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                2
              </div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white mb-2">Compare Quotes & Trust</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                Receive transparent price estimates from verified local artisans. Check phone verification, badges & reviews.
              </p>
            </div>

            <div className="text-center p-5 sm:p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                3
              </div>
              <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-white mb-2">Connect & Get It Done</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                Contact the artisan via call or WhatsApp. Pay directly after satisfactory job completion and leave a review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUSTED PROVIDERS SHOWCASE */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                Verified Community Artisans
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
                Top Rated Service Providers in Northern Ghana
              </h2>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Request Quote From All
            </button>
          </div>

          {loadingProviders ? (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400 text-sm font-medium">
              Loading verified artisans in Northern Ghana...
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
              <h4 className="font-bold text-stone-900 dark:text-white mb-2">
                We couldn't find a provider matching everything you selected.
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 font-medium">
                Try broadening your location search or submit a service request so artisans can quote directly.
              </p>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Post Service Request Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. PROVIDER RECRUITMENT BANNER */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-stone-900 dark:to-stone-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 sm:mb-4">
            Are you a skilled artisan or business owner in Northern Ghana?
          </h2>
          <p className="text-emerald-100 dark:text-stone-300 text-xs sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium">
            Get discovered by customers looking for local services across Northern Ghana. Create your free provider storefront on Servora today.
          </p>

          <Link
            href="/provider/register"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-amber-400 hover:bg-stone-100 dark:hover:bg-amber-300 text-emerald-900 dark:text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition"
          >
            <span>Register as a Service Provider</span>
            <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-stone-950" />
          </Link>
        </div>
      </section>

      {/* Wizard Modal */}
      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
