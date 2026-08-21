"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Bike,
  Car,
  Package,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  UserCheck,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";
import { calculateDeliveryPrice, formatGHS } from "@/lib/delivery/pricingEngine";

export default function DeliveryMarketplaceLandingPage() {
  const [vehicleType, setVehicleType] = useState("MOTORCYCLE");
  const [distanceKm, setDistanceKm] = useState(5);
  const [packageWeightKg, setPackageWeightKg] = useState(2);
  const [packageSize, setPackageSize] = useState("MEDIUM");

  const quote = calculateDeliveryPrice({
    vehicleType,
    distanceKm,
    packageWeightKg,
    packageSize,
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* HERO BANNER SECTION */}
      <section className="bg-gradient-to-br from-emerald-900 via-stone-900 to-teal-950 py-16 lg:py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Truck className="w-4 h-4 text-emerald-400" /> Servora On-Demand Delivery Marketplace
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Need Something Transported Across <span className="text-emerald-400">Ghana?</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
                Connect directly with independent verified delivery providers using motorcycles, cars, tricycles, pickups, vans, and trucks. Fast, transparent pricing, and real-time OTP proof of delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  href="/delivery/request"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all text-center flex items-center justify-center gap-2 group"
                >
                  <span>Request a Delivery Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  href="/delivery/provider/onboard"
                  className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-white font-black text-sm rounded-2xl border border-stone-700 transition-all text-center flex items-center justify-center gap-2"
                >
                  <Bike className="w-4 h-4 text-emerald-400" />
                  <span>Become a Delivery Provider</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-6 text-xs text-stone-400 font-semibold border-t border-stone-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% ID Verified Providers
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Instant Matching
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recipient OTP PIN
                </div>
              </div>
            </div>

            {/* Right Interactive Delivery Fee Calculator Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-900 dark:text-white space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
                    <Calculator className="w-5 h-5" /> Instant Delivery Price Calculator
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                    GHS Rates
                  </span>
                </div>

                {/* Vehicle Choice */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-700 dark:text-stone-300 mb-2">
                    Select Transportation Type
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { id: "MOTORCYCLE", label: "Motorbike", icon: "🏍️" },
                      { id: "BICYCLE", label: "Bicycle", icon: "🚲" },
                      { id: "CAR", label: "Car", icon: "🚗" },
                      { id: "TRICYCLE", label: "Tricycle", icon: "🛺" },
                      { id: "PICKUP", label: "Pickup", icon: "🛻" },
                      { id: "VAN", label: "Van", icon: "🚐" },
                      { id: "TRUCK", label: "Heavy Truck", icon: "🚛" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVehicleType(v.id)}
                        className={`p-2.5 rounded-2xl border text-xs transition flex flex-col items-center gap-1 ${
                          vehicleType === v.id
                            ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-xs"
                            : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400"
                        }`}
                      >
                        <span className="text-base">{v.icon}</span>
                        <span className="text-[10px] font-bold truncate">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    <span>Estimated Distance:</span>
                    <span className="text-emerald-600 font-extrabold">{distanceKm} KM</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Weight Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Package Weight
                    </label>
                    <select
                      value={packageWeightKg}
                      onChange={(e) => setPackageWeightKg(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                    >
                      <option value={1}>Light (1 kg)</option>
                      <option value={5}>Medium (5 kg)</option>
                      <option value={15}>Heavy (15 kg)</option>
                      <option value={50}>Bulk (50+ kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Package Size
                    </label>
                    <select
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                    >
                      <option value="SMALL">Small (Envelope / Parcel)</option>
                      <option value="MEDIUM">Medium (Box / Food Bag)</option>
                      <option value="LARGE">Large (Appliance / Carton)</option>
                      <option value="HEAVY_BULK">Heavy Bulk (Furniture / Produce)</option>
                    </select>
                  </div>
                </div>

                {/* Quote Display Box */}
                <div className="bg-stone-50 dark:bg-stone-800/80 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-stone-500">Estimated Price:</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatGHS(quote.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500 font-semibold border-t border-stone-200 dark:border-stone-700 pt-2">
                    <span>Est. Travel Time: ~{quote.estimatedDurationMins} mins</span>
                    <span>Provider Net: {formatGHS(quote.providerEarnings)}</span>
                  </div>
                </div>

                <Link
                  href={`/delivery/request?vehicle=${vehicleType}&distance=${distanceKm}&weight=${packageWeightKg}&size=${packageSize}`}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition text-center block"
                >
                  Book This Delivery Rate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Simple 4-Step Process</span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white">
            How Servora Delivery Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-base">Enter Package Details</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Specify pickup & destination addresses, package category, dimensions, and preferred vehicle.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-base">Instant Dispatch Matching</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Our intelligent engine finds nearby ID-verified delivery providers currently online.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-base">Live Route Tracking</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Track provider arrival, package pickup, and transit progress in real-time.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center font-black text-lg">
              4
            </div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-base">OTP PIN Handover</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Recipient verifies the 4-digit PIN OTP to confirm delivery & release provider payment.
            </p>
          </div>
        </div>
      </section>

      {/* BECOME A PROVIDER BANNER */}
      <section className="bg-stone-900 py-16 text-white border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-black text-2xl border border-emerald-500/30">
            🛵
          </div>
          <h2 className="text-3xl sm:text-4xl font-black max-w-xl mx-auto">
            Turn Your Vehicle Into an Income Opportunity
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
            Have a motorcycle, bicycle, car, tricycle, van, or pickup truck in Ghana? Register as an independent delivery provider, complete ID verification, go online, and accept nearby delivery jobs.
          </p>
          <div className="pt-2">
            <Link
              href="/delivery/provider/onboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xl transition"
            >
              <UserCheck className="w-4 h-4" /> Become a Delivery Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
