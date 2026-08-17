"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      window.location.href = data.user?.role === "ADMIN" ? "/admin" : "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(type: "admin" | "provider") {
    if (type === "admin") {
      setPhoneOrEmail("admin@servora.gh");
      setPassword("admin12345");
    } else {
      setPhoneOrEmail("+233244889900");
      setPassword("password123");
    }
    setError(null);
  }

  return (
    <div className="min-h-screen py-16 bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">Log in to Servora</h1>
          <p className="text-xs text-stone-500 mt-1">Connect with local service artisans in Northern Ghana</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
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
              placeholder="admin@servora.gh or +233240000000"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-11 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg transition active:scale-98 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 text-center space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Quick Fill Verification Accounts
          </p>
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("provider")}
              className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-semibold rounded-xl border border-stone-200 dark:border-stone-700 transition"
            >
              Kwame Electrician
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-500 text-center mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
