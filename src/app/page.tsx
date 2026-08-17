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
      if (data.products) setProducts(data.products.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-gradient-to-b from-emerald-50/60 via-stone-50 to-stone-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 border-b border-stone-200 dark:border-stone-800 z-30 transition-colors duration-200 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-bold shadow-xs max-w-full">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Zero-Capital Local Marketplace for Northern Ghana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-stone-900 dark:text-white">
                Find trusted local services in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300">
                  Northern Ghana.
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-stone-600 dark:text-stone-300 font-medium leading-relaxed max-w-2xl">
                Describe any service or task you need and get instant quotes from verified local artisans, technicians, equipment suppliers, and service professionals across Northern Ghana.
              </p>

              {/* Major E-Commerce Omnibox Search Bar */}
              <div className="pt-1">
                <UnifiedEcommerceSearch variant="hero" />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-emerald-600/30 active:scale-98 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition duration-300" />
                  <span>Find a Service</span>
                </button>

                <Link
                  href="/provider/register"
                  className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white font-bold text-sm sm:text-base rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
                  <span>Join as a Provider</span>
                </Link>
              </div>

              {/* Responsive Trust Badges Bar */}
              <div className="pt-5 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Phone & ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct WhatsApp Bids</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>WhatsApp Enabled</span>
                </div>
              </div>
            </div>

            {/* Right Card / Interactive Quick Request Box */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl dark:shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Quick Service Request</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Live in Northern Ghana
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mb-4">
                  Select your region or city to get matched with verified local artisans instantly:
                </p>

                {/* Region / City Quick Filter (2 Cols on mobile, 3 Cols on Desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
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
                      className={`p-2.5 rounded-xl text-left border text-xs transition cursor-pointer ${
                        selectedNeighborhood === loc.name
                          ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
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
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Post Job & Get Quotes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICE CATEGORIES */}
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
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
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
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
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
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
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

      {/* 2.5 FEATURED LOCAL PRODUCTS & SUPPLIES */}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. HOW IT WORKS */}
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

      {/* 4. TRUSTED PROVIDERS SHOWCASE */}
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

      {/* 5. PROVIDER RECRUITMENT BANNER */}
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
