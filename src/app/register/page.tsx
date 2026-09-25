"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, AlertCircle, Eye, EyeOff, User, Phone, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

export default function CustomerRegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password, role: "CUSTOMER" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6 sm:py-12 bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 min-h-[calc(100vh-140px)]">
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl backdrop-blur-2xl transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] rounded-full uppercase tracking-wider mb-2 border border-emerald-300/80 dark:border-emerald-800">
            <Sparkles className="w-3 h-3 fill-current" /> 100% Free Customer Account
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Looking to Buy or Hire?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign up in 30 seconds to post price requests, shop products, and message verified artisans in Tamale.
          </p>
        </div>

        {/* Social Authentication Buttons */}
        <SocialAuthButtons actionLabel="Sign up" />

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Amina Abdul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. 0244123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3.5 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-mono font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                placeholder="amina@example.com (Optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 pl-10 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Set Account Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pl-10 pr-11 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Register as a Customer (100% Free) 🚀"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you a business owner or seller?{" "}
            <Link
              href="/provider/register"
              className="font-extrabold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Register your Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
