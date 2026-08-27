"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"customer" | "provider">("customer");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (data.user?.role === "PROVIDER") {
        window.location.href = "/business/portal";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 sm:py-12 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-4 min-h-[calc(100vh-140px)] transition-colors duration-200">
      <div className="bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            Log in to Servora<span className="text-emerald-600 dark:text-emerald-400">.gh</span>
          </h1>
          <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
            NORTHERN MARKETPLACE & ARTISAN TRADE HUB
          </p>
        </div>

        {/* Account Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl mb-5 text-xs font-bold border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setAccountType("customer")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              accountType === "customer"
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Customer / Buyer
          </button>
          <button
            type="button"
            onClick={() => setAccountType("provider")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              accountType === "provider"
                ? "bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Business / Seller
          </button>
        </div>

        {/* Social Authentication Buttons */}
        <SocialAuthButtons actionLabel="Sign in" />

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Phone Number or Email
            </label>
            <input
              type="text"
              placeholder={accountType === "provider" ? "+233500000000 (WhatsApp)" : "admin@servora.gh or +233240000000"}
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Password
              </label>
              <a href="#" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-11 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        <div className="text-xs text-stone-500 dark:text-stone-400 text-center mt-6 space-y-1">
          <p>Don't have an account yet?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 font-bold pt-1">
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Register as a Customer (100% Free)
            </Link>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
            <Link href="/provider/register" className="text-amber-600 dark:text-amber-400 hover:underline">
              Register your Business (100% Free)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
