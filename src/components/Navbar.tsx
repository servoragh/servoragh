"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Search,
  MapPin,
  User,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  LogOut,
  ShoppingBag,
  Building2,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Heart,
  Truck,
} from "lucide-react";
import { UnifiedEcommerceSearch } from "@/components/UnifiedEcommerceSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { TopAnnouncementBar } from "@/components/TopAnnouncementBar";

export function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  async function handleLogout() {
    setMobileMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Modern Dynamic Vertical Swipe-Up Ticker Banner */}
      <TopAnnouncementBar />

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 shadow-xs transition duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition duration-200">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900 dark:text-white">
                Servora<span className="text-emerald-600 dark:text-emerald-400">.gh</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest -mt-1">
                Northern Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop E-Commerce Omnibox Quick Search (Inner pages only) */}
          {pathname !== "/" && (
            <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm xl:max-w-md min-w-[200px] mx-2 lg:mx-4 shrink">
              <UnifiedEcommerceSearch variant="compact" placeholder="Search products or services..." />
            </div>
          )}

          {/* Navigation Actions */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-3 mr-1">
              <Link
                href="/products"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Products</span>
              </Link>
              <Link
                href="/rentals"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 transition"
              >
                Tool Rentals
              </Link>
              <Link
                href="/delivery"
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-600 flex items-center gap-1 transition"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery</span>
              </Link>
              <Link
                href="/community"
                className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-600 transition"
              >
                Community
              </Link>
              <Link
                href="/account/favorites"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 transition"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Saved</span>
              </Link>
            </div>

            <Link
              href="/requests"
              className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-600 transition px-1"
            >
              Requests
            </Link>

            {/* Light / Dark Mode Switcher Button */}
            <ThemeToggle />

            {session ? (
              <div className="flex items-center gap-2.5 shrink-0">
                {session.role === "PROVIDER" && (
                  <Link
                    href="/business/portal"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Business Portal</span>
                  </Link>
                )}

                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0"
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  href={session.role === "PROVIDER" ? "/business/portal" : session.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-semibold text-xs border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition shrink-0"
                  title="View Portal / Dashboard"
                >
                  {session.avatarUrl || session.providerProfile?.logoUrl ? (
                    <img
                      src={session.avatarUrl || session.providerProfile?.logoUrl}
                      alt={session.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>{session.name.split(" ")[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition shrink-0 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-600 transition"
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

          {/* Mobile Menu Trigger & Switcher */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition shrink-0 cursor-pointer border border-stone-200 dark:border-stone-700"
              aria-label="Open Mobile Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SLIDE-OVER DRAWER (RIGHT TO LEFT) */}
      {/* ------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={closeMenu}
          />

          {/* Slide-Over Menu Panel (Right to Left) */}
          <aside className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border-l border-stone-200/80 dark:border-stone-800/80 shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out text-stone-900 dark:text-stone-100">
            {/* Drawer Top Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800/80">
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base tracking-tight text-stone-900 dark:text-white">
                    Servora<span className="text-emerald-600">.gh</span>
                  </span>
                </Link>

                <button
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                  aria-label="Close Mobile Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Bar inside Drawer */}
              <div className="pt-1">
                <UnifiedEcommerceSearch variant="compact" placeholder="Search products or services..." />
              </div>

              {/* Navigation Links (Each Auto-Closes on Click!) */}
              <nav className="space-y-1.5 pt-2">
                <button
                  onClick={() => {
                    closeMenu();
                    setIsWizardOpen(true);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Service Request</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </button>

                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-stone-800 text-xs font-bold text-emerald-800 dark:text-emerald-400 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shop Local Products</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  href="/rentals"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50 dark:hover:bg-stone-800 text-xs font-bold text-amber-800 dark:text-amber-400 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4" />
                    <span>Tool & Heavy Rentals</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  href="/community"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-stone-800 text-xs font-bold text-purple-800 dark:text-purple-400 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Community Notice Board</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  href="/requests"
                  onClick={closeMenu}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Browse Job Requests</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              </nav>
            </div>

            {/* Bottom Account Section */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-3">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {session.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold text-stone-900 dark:text-white truncate">{session.name}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">{session.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <Link
                      href="/business/portal"
                      onClick={closeMenu}
                      className="block p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold text-xs"
                    >
                      🏢 Business Owner Portal
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className="block p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs"
                    >
                      📊 My Customer Dashboard
                    </Link>

                    {session.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="block p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs"
                      >
                        ⚡ Enterprise Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="py-3 text-center text-xs font-extrabold border border-stone-300 dark:border-stone-700 rounded-2xl text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="py-3 text-center text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm transition"
                  >
                    Join Servora
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Request Wizard Modal */}
      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}
