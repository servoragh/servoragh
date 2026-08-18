"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Globe,
  Building2,
  MapPin,
  Clock,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

export default function ProviderRegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("3");
  const [serviceArea, setServiceArea] = useState("Sakasaka, Tamale Central");
  const [pricingHourly, setPricingHourly] = useState("40");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);

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
    } else if (step === 2) {
      if (!businessName.trim()) {
        setError("Please specify your business or brand name.");
        return;
      }
      if (!bio.trim()) {
        setError("Please provide a short description or bio.");
        return;
      }
      setStep(3);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsExistingAccount(false);

    try {
      // 1. Register or Authenticate existing user as PROVIDER
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

      // 2. Onboard Provider Profile
      const onRes = await fetch("/api/providers/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          bio,
          yearsExperience,
          serviceArea,
          pricingHourly,
          websiteUrl,
          serviceIds: [],
        }),
      });

      const onData = await onRes.json();
      if (!onRes.ok) throw new Error(onData.error || "Provider profile creation failed.");

      window.location.href = `/provider/${onData.profile.slug}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 sm:py-12 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 min-h-[calc(100vh-140px)] transition-colors duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-stone-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center font-bold border border-white/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block mb-0.5">
                Step {step} of 3 &bull; Provider Registration
              </span>
              <h1 className="text-xl font-black text-white">Join Servora as a Provider</h1>
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5 text-xs">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/90 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>

              {isExistingAccount && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700 dark:text-rose-300">Have an existing account with this phone?</span>
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
            {/* STEP 1: Personal & Auth Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Step 1: Contact & Security Credentials</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Enter your official name & WhatsApp contact for instant client leads.</p>
                </div>

                {/* Social Authentication */}
                <SocialAuthButtons actionLabel="Sign up" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="ABDUL HANAN ABDULAI"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Phone (WhatsApp)</label>
                    <input
                      type="text"
                      placeholder="+233500710610"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 outline-none font-mono font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Account Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 pr-11 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 outline-none font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                    If your phone is already registered, enter your existing password to upgrade to a Business Provider account.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: Business & Brand Profile */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Step 2: Business & Brand Profile</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Tell customers in Tamale about your business identity & services.</p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Business / Brand Name</label>
                  <input
                    type="text"
                    placeholder="Goodie Electronics & Services"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 outline-none font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Existing Business Website URL (Optional)</label>
                  <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1">
                    <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="https://mybusiness.com (Optional)"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full py-2 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 outline-none font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">If you have a website, specify it here and we will link it to your storefront!</p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Short Description / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your goods, repair skills, experience, and services..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 outline-none font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Rates, Experience & Location */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Step 3: Service Area & Rates</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Set your service location in Tamale & starting rates.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Hourly Rate (GH₵)</label>
                    <input
                      type="number"
                      value={pricingHourly}
                      onChange={(e) => setPricingHourly(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Service Area in Tamale</label>
                  <input
                    type="text"
                    placeholder="Chanshegu, Sakasaka, Nyohini"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 outline-none font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep((s) => s - 1);
                  }}
                  className="px-4 py-2.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer ml-auto"
                >
                  {loading ? "Creating Business Profile..." : "Register & Open Business Portal"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
