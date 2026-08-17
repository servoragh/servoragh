"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Search, MapPin, User, ShieldCheck, Menu, X, PlusCircle, LogOut, ShoppingBag, Building2 } from "lucide-react";
import { UnifiedEcommerceSearch } from "@/components/UnifiedEcommerceSearch";

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      {/* 24/7 Emergency Ticker Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-950 text-white text-[11px] py-1 px-4 border-b border-rose-900/60 flex items-center justify-between font-bold">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>24/7 Northern Ghana Emergency Hotline & Dispatch Active</span>
          </span>
          <div className="hidden sm:flex items-center gap-4 text-stone-300 text-[10px]">
            <span>⚡ Electrical, Plumbing & Power Failures</span>
            <span className="text-emerald-400 font-mono">GHANA EMERGENCY DISPATCH</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900 dark:text-white">
                Servora<span className="text-emerald-600">.gh</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest -mt-1">
                Northern Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop E-Commerce Omnibox Quick Search */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md min-w-0 mx-2 lg:mx-4 shrink">
            <UnifiedEcommerceSearch variant="compact" placeholder="Search products or services..." />
          </div>

          {/* Navigation Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <div className="hidden xl:flex items-center gap-2.5 mr-1">
              <Link
                href="/products"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Products</span>
              </Link>
              <Link
                href="/rentals"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Tool Rentals
              </Link>
              <Link
                href="/community"
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Community
              </Link>
            </div>

            <Link
              href="/requests"
              className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-emerald-600 transition px-1"
            >
              Requests
            </Link>

            {session ? (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/business/portal"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
                >
                  Business Portal
                </Link>

                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0"
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold text-xs border border-stone-200 dark:border-stone-700 hover:bg-stone-200 transition shrink-0"
                >
                  {session.avatarUrl || session.providerProfile?.logoUrl ? (
                    <img
                      src={session.avatarUrl || session.providerProfile?.logoUrl}
                      alt={session.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span>{session.name.split(" ")[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition shrink-0"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-emerald-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Join Servora
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-4 space-y-3">
            <div className="md:hidden pb-2">
              <UnifiedEcommerceSearch variant="compact" placeholder="Search products or services..." />
            </div>
            <Link
              href="/products"
              className="block text-sm font-semibold text-emerald-600 py-2 border-b border-stone-100 dark:border-stone-800"
            >
              Shop Local Products
            </Link>
            <Link
              href="/rentals"
              className="block text-sm font-semibold text-amber-600 py-2 border-b border-stone-100 dark:border-stone-800"
            >
              Tool Equipment Rentals
            </Link>
            <Link
              href="/community"
              className="block text-sm font-semibold text-purple-600 py-2 border-b border-stone-100 dark:border-stone-800"
            >
              Community Board
            </Link>
            <Link
              href="/requests"
              className="block text-sm font-semibold text-stone-800 dark:text-stone-200 py-2 border-b border-stone-100 dark:border-stone-800"
            >
              Browse Job Requests
            </Link>
            {session ? (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-stone-400">Signed in as {session.name}</p>
                <Link
                  href="/business/portal"
                  className="block text-sm font-bold text-emerald-600"
                >
                  Business Owner Portal
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-sm font-bold text-stone-800 dark:text-white"
                >
                  My Dashboard
                </Link>
                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block text-sm font-bold text-amber-600"
                  >
                    Enterprise Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-sm font-semibold text-red-600 py-2"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 py-2 text-center text-xs font-bold border border-stone-300 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2 text-center text-xs font-bold bg-emerald-600 text-white rounded-xl"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
