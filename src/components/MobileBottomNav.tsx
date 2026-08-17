"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  PlusCircle,
  Users,
  Building2,
  User,
  Wrench,
  Search,
  MessageSquare,
} from "lucide-react";
import { RequestWizardModal } from "@/components/RequestWizardModal";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  // Hide on admin routes if desired, or keep everywhere
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-t border-stone-200/80 dark:border-stone-800/80 shadow-2xl px-2 py-1.5 transition-colors duration-200 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition cursor-pointer ${
              pathname === "/"
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </Link>

          {/* Shop Products */}
          <Link
            href="/products"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition cursor-pointer ${
              pathname?.startsWith("/products")
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Products</span>
          </Link>

          {/* Quick Post Service Request CTA Floating Action Button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="relative -top-4 p-3 bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white dark:border-stone-900 flex items-center justify-center group"
            title="Post Service Request"
          >
            <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition duration-300" />
            <span className="sr-only">Post Request</span>
          </button>

          {/* Community */}
          <Link
            href="/community"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition cursor-pointer ${
              pathname?.startsWith("/community")
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Notice Board</span>
          </Link>

          {/* Portal / Account */}
          <Link
            href={
              session?.role === "PROVIDER"
                ? "/business/portal"
                : session?.role === "ADMIN"
                ? "/admin"
                : session
                ? "/dashboard"
                : "/login"
            }
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition cursor-pointer ${
              pathname?.startsWith("/business/portal") || pathname?.startsWith("/dashboard")
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-stone-500 dark:text-stone-400 font-medium hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            {session?.role === "PROVIDER" ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] tracking-tight truncate max-w-[60px]">
              {session?.role === "PROVIDER"
                ? "Portal"
                : session
                ? "Account"
                : "Sign In"}
            </span>
          </Link>
        </div>
      </nav>

      {/* Service Request Wizard Modal */}
      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}
