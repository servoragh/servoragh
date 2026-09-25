"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Eye,
  EyeOff,
  Navigation,
  Compass,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Map,
} from "lucide-react";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

const NORTHERN_ZONES = [
  { name: "Sakasaka", city: "Tamale", lat: 9.4182, lng: -0.8402 },
  { name: "Choggu", city: "Tamale", lat: 9.4412, lng: -0.8521 },
  { name: "Tamale Central", city: "Tamale", lat: 9.4074, lng: -0.8416 },
  { name: "Nyohini", city: "Tamale", lat: 9.3951, lng: -0.8492 },
  { name: "Aboabo", city: "Tamale", lat: 9.4063, lng: -0.8354 },
  { name: "Lamashegu", city: "Tamale", lat: 9.3892, lng: -0.8431 },
  { name: "Dungu / UDS", city: "Tamale", lat: 9.3621, lng: -0.8398 },
  { name: "Kalpohin", city: "Tamale", lat: 9.429, lng: -0.832 },
  { name: "Bolgatanga Central", city: "Bolga", lat: 10.7856, lng: -0.8514 },
  { name: "Wa Central", city: "Wa", lat: 10.0601, lng: -2.5099 },
  { name: "Yendi", city: "Yendi", lat: 9.4427, lng: -0.0099 },
];

export default function ProviderRegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Business & Location
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [serviceArea, setServiceArea] = useState("Sakasaka, Tamale");
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 9.4182,
    lng: -0.8402,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);

  function handleSelectZone(zone: (typeof NORTHERN_ZONES)[0]) {
    setServiceArea(`${zone.name}, ${zone.city}`);
    setSelectedCoords({ lat: zone.lat, lng: zone.lng });
  }

  function handleDetectGps() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setSelectedCoords({ lat, lng });

        // Find nearest zone or fallback to custom coordinates
        let nearest = NORTHERN_ZONES[0];
        let minDist = Infinity;
        for (const z of NORTHERN_ZONES) {
          const dist = Math.hypot(z.lat - lat, z.lng - lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = z;
          }
        }
        setServiceArea(`${nearest.name}, ${nearest.city} (${lat}, ${lng})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError("Unable to detect GPS position. Please pick a location below or select a neighborhood.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleNextStep() {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!phone.trim()) {
        setError("Please enter your WhatsApp phone number.");
        return;
      }
      if (!password.trim()) {
        setError("Please set a secure account password.");
        return;
      }
      setStep(2);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 2) {
      handleNextStep();
      return;
    }

    if (!businessName.trim()) {
      setError("Please specify your business or shop name.");
      return;
    }
    if (!bio.trim()) {
      setError("Please write a quick 1-sentence description of what you do.");
      return;
    }
    if (!serviceArea.trim()) {
      setError("Please choose your business location or neighborhood.");
      return;
    }

    setLoading(true);
    setError(null);
    setIsExistingAccount(false);

    try {
      // 1. Register or Authenticate user as PROVIDER
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, role: "PROVIDER" }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        if (regData.isExisting) {
          setIsExistingAccount(true);
        }
        throw new Error(regData.error || "Account registration failed.");
      }

      // 2. Onboard Provider Profile (Clean, simple, frictionless)
      const onRes = await fetch("/api/providers/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          bio,
          yearsExperience: 1,
          serviceArea,
          pricingHourly: null,
          websiteUrl: null,
          serviceIds: [],
        }),
      });

      const onData = await onRes.json();
      if (!onRes.ok) throw new Error(onData.error || "Provider profile creation failed.");

      window.location.href = "/business/portal";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // OpenStreetMap URL for live pinpoint preview
  const mapIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoords.lng - 0.02}%2C${selectedCoords.lat - 0.015}%2C${selectedCoords.lng + 0.02}%2C${selectedCoords.lat + 0.015}&layer=mapnik&marker=${selectedCoords.lat}%2C${selectedCoords.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${selectedCoords.lat},${selectedCoords.lng}`;

  return (
    <div className="py-6 sm:py-12 bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 min-h-[calc(100vh-140px)]">
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl backdrop-blur-2xl transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950 dark:via-teal-950 dark:to-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center font-bold border border-white/20 shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full mb-1">
                <Sparkles className="w-3 h-3 fill-current" /> 100% Free Registration
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">Register Your Business or Trade</h1>
            </div>
          </div>
        </div>

        {/* Step Progress Bar (2 Simple Steps) */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              {isExistingAccount && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300">Account already exists with this phone?</span>
                  <Link
                    href={`/login?phone=${encodeURIComponent(phone)}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 transition shadow-xs"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Personal & WhatsApp Contact */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Step 1: Owner & WhatsApp Contact</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct contact for clients to message you on WhatsApp for jobs.
                  </p>
                </div>

                {/* Social Authentication */}
                <SocialAuthButtons actionLabel="Sign up" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kwame Mensah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleNextStep();
                        }
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 0244123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleNextStep();
                        }
                      }}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 outline-none font-mono font-medium focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleNextStep();
                        }
                      }}
                      className="w-full p-3 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium focus:border-emerald-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Business & Interactive Map Location (Stress-Free, Ultra-Modern) */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Step 2: Business Name & Map Location</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      No complex forms — just name your business and pin your location!
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Shop / Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Goodie Electronics, Fatima Tailoring, Kwame Solar"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400 outline-none font-extrabold text-sm focus:border-emerald-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What Goods or Services Do You Offer? *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Electrical wiring, solar inverter installation, generator maintenance..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 outline-none font-medium focus:border-emerald-500 transition"
                    required
                  />
                </div>

                {/* ULTRA-MODERN LOCATION PICKER WITH MAP PIN & LIVE GPS */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Choose Location & Service Area *</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-lg text-[11px] font-extrabold hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                      <span>{isLocating ? "Locating GPS..." : "📍 Detect My GPS"}</span>
                    </button>
                  </div>

                  {/* Location Input Box */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Sakasaka, Tamale"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      className="w-full py-2 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none font-bold text-xs"
                      required
                    />
                  </div>

                  {/* Fast Neighborhood Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-0.5 mr-0.5">
                      Quick Zones:
                    </span>
                    {NORTHERN_ZONES.map((zone) => {
                      const isSelected = serviceArea.startsWith(zone.name);
                      return (
                        <button
                          key={zone.name}
                          type="button"
                          onClick={() => handleSelectZone(zone)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {zone.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Map Visual Pin Card */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Interactive Map Location Pin:</span>
                      </span>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold inline-flex items-center gap-1"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Embedded Live Map View */}
                    <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-200 dark:bg-slate-800">
                      <iframe
                        title="Location Map Pin"
                        src={mapIframeUrl}
                        className="w-full h-full border-0 pointer-events-auto"
                        loading="lazy"
                      />
                      <div className="absolute bottom-1 right-1 bg-slate-950/80 text-white text-[9px] px-2 py-0.5 rounded font-mono pointer-events-none">
                        Lat: {selectedCoords.lat.toFixed(4)}, Lng: {selectedCoords.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer ml-auto active:scale-95"
                >
                  <span>Next Step: Choose Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer ml-auto active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Registering Business...</span>
                  ) : (
                    <>
                      <span>Complete Free Registration 🚀</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Looking to buy items or hire a service?{" "}
              <Link
                href="/register"
                className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Register as a Customer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
