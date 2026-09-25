"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { ProviderCard } from "@/components/ProviderCard";
import { ProductCard } from "@/components/ProductCard";
import { UnifiedEcommerceSearch } from "@/components/UnifiedEcommerceSearch";
import { CategoryGridSection } from "@/components/CategoryGridSection";
import { FeaturedHeroAdvertSpotlight } from "@/components/FeaturedHeroAdvertSpotlight";

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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-10 sm:pb-14 bg-gradient-to-b from-emerald-50/40 via-stone-50 to-stone-50 dark:from-[#0b0f19] dark:via-[#080b11] dark:to-[#07090e] border-b border-stone-200/80 dark:border-white/[0.06] z-40 overflow-hidden">
        {/* Futuristic Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-60 pointer-events-none" />

        {/* Ambient Top Radial Spotlight & Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-gradient-to-bl from-teal-500/10 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Value Proposition & Search Omnibox */}
            <div className="lg:col-span-7 space-y-5 relative z-50">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold shadow-xs backdrop-blur-md max-w-full">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">#1 Local Service & Universal Trade Marketplace in Northern Ghana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-stone-900 dark:text-white">
                Find trusted local services in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
                  Northern Ghana.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                Get instant quotes from Ghana Card verified artisans, electricians, plumbers, tailors, and suppliers across Tamale, Bolga & Wa.
              </p>

              {/* Minimalist Ultra-Modern Omnibox Search Bar */}
              <div className="pt-1 relative z-50">
                <UnifiedEcommerceSearch variant="hero" />
              </div>

              {/* Fast Category Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 mr-1">Trending:</span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag.query}
                    onClick={() => setIsWizardOpen(true)}
                    className="px-2.5 py-1 bg-white/90 dark:bg-stone-900/80 hover:bg-emerald-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-[11px] font-bold rounded-full border border-stone-200/80 dark:border-white/[0.08] transition cursor-pointer shadow-2xs backdrop-blur-sm"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Primary Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-full shadow-lg shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition duration-300" />
                  <span>Post Request & Get Prices</span>
                </button>

                <Link
                  href="/provider/register"
                  className="text-center text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 transition"
                >
                  Are you a business owner or seller? <span className="underline">Register your Business →</span>
                </Link>
              </div>

              {/* Minimal Trust Badges */}
              <div className="pt-3 border-t border-stone-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-start gap-2 sm:gap-4 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/[0.08] shadow-2xs text-stone-800 dark:text-stone-200 backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Phone & ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/[0.08] shadow-2xs text-stone-800 dark:text-stone-200 backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp Messages</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/[0.08] shadow-2xs text-stone-800 dark:text-stone-200 backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Free Service</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Hero Advert Spotlight Auto-Swiping Carousel */}
            <FeaturedHeroAdvertSpotlight onOpenWizard={() => setIsWizardOpen(true)} />
          </div>
        </div>
      </section>

      {/* 2. EXPLORE NORTHERN CATEGORIES (CLASSIFIED CATEGORY GRID) */}
      <CategoryGridSection onPostRequestClick={() => setIsWizardOpen(true)} />

      {/* 3. FEATURED LOCAL PRODUCTS & SUPPLIES (2 COLUMNS ON MOBILE GRID!) */}
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

      {/* 4. TRUSTED PROVIDERS SHOWCASE */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                Verified Local Businesses
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
                Top Rated Local Businesses & Sellers in Northern Ghana
              </h2>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Get Price Estimates From All
            </button>
          </div>

          {loadingProviders ? (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400 text-sm font-medium">
              Loading verified local businesses in Northern Ghana...
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
              <h4 className="font-bold text-stone-900 dark:text-white mb-2">
                We couldn't find a business matching everything you selected.
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 font-medium">
                Try broadening your location search or submit a request for prices so local businesses can send price offers directly.
              </p>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Ask For Price Estimates Now
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

      {/* 5. PROVIDER RECRUITMENT BANNER */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-stone-900 dark:to-stone-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-full mb-3 shadow-xs">
            100% Free Business Registration — No Hidden Fees!
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 sm:mb-4">
            Are you a business owner or seller in Northern Ghana?
          </h2>
          <p className="text-emerald-100 dark:text-stone-300 text-xs sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium">
            Get discovered by customers looking for local products and services across Tamale and Northern Ghana. Register your business on Servora today completely free.
          </p>

          <Link
            href="/provider/register"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-amber-400 hover:bg-stone-100 dark:hover:bg-amber-300 text-emerald-900 dark:text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition"
          >
            <span>Register your Business</span>
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
