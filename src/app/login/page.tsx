"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen py-16 bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">Log in to Servora</h1>
          <p className="text-xs text-stone-500 mt-1">Connect with local service artisans in Tamale</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Phone Number or Email
            </label>
            <input
              type="text"
              placeholder="+233244123456"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Login Shortcuts */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs font-semibold text-stone-400 mb-2">Demo Credentials for Verification:</p>
          <div className="flex flex-col gap-1 text-xs font-mono text-emerald-600">
            <button
              type="button"
              onClick={() => {
                setPhoneOrEmail("+233240000000");
                setPassword("admin12345");
              }}
              className="hover:underline"
            >
              Admin Demo Login
            </button>
            <button
              type="button"
              onClick={() => {
                setPhoneOrEmail("+233244889900");
                setPassword("password123");
              }}
              className="hover:underline"
            >
              Kwame Electrician Demo Login
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
