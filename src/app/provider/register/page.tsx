"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, AlertCircle, CheckCircle, ShieldCheck, ArrowRight, Globe } from "lucide-react";

export default function ProviderRegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("3");
  const [serviceArea, setServiceArea] = useState("Sakasaka, Tamale Central");
  const [pricingHourly, setPricingHourly] = useState("40");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);

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
    <div className="min-h-screen py-12 bg-stone-900 text-white flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto mb-3 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Join Servora as a Provider</h1>
          <p className="text-xs text-stone-400 mt-1">Get discovered by customers looking for local services in Tamale</p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-950/90 border border-red-800 text-red-200 text-xs rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>

            {isExistingAccount && (
              <div className="pt-2 border-t border-red-900/60 flex items-center justify-between">
                <span className="text-[11px] text-red-300">Have an existing account with this phone?</span>
                <Link
                  href={`/login?phone=${encodeURIComponent(phone)}`}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl inline-flex items-center gap-1 transition shadow"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="ABDUL HANAN ABDULAI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-amber-500 transition"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Phone (WhatsApp)</label>
              <input
                type="text"
                placeholder="+233500710610"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-amber-500 transition font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Business / Brand Name</label>
            <input
              type="text"
              placeholder="Goodie Electronics & Services"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none font-bold text-amber-400 focus:border-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Existing Business Website URL (Optional)</label>
            <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-1">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                placeholder="https://mybusiness.com (Optional)"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full py-2 bg-transparent text-white outline-none"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">If you already have a website, specify it here and we will link it to your portal & storefront!</p>
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Short Description / Bio</label>
            <textarea
              rows={3}
              placeholder="Describe your goods, repair skills, experience, and services..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Years Experience</label>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-300 mb-1">Hourly Rate (GH₵)</label>
              <input
                type="number"
                value={pricingHourly}
                onChange={(e) => setPricingHourly(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Service Area in Tamale</label>
            <input
              type="text"
              placeholder="Chanshegu, Sakasaka, Nyohini"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none focus:border-amber-500 transition"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">
              If your phone is already registered, enter your existing password to verify and upgrade to a Provider account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition"
          >
            {loading ? "Creating Business Profile..." : "Register & Open Business Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
