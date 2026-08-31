"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSession() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user session for chat:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-base">Opening Native Servora Chat...</h3>
        <p className="text-xs text-stone-400 mt-1">Connecting to Northern Ghana Secure Trade Network</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mb-4 text-emerald-400 border border-stone-800 shadow-xl">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Log in to Access Your Messages</h2>
        <p className="text-xs text-stone-400 max-w-md mb-6">
          Chat directly with verified local artisans, merchants, and buyers across Tamale.
        </p>
        <Link
          href="/login?redirect=/messages"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/25"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-stone-800 bg-stone-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Marketplace</span>
          </Link>
          <div className="h-5 w-px bg-stone-800" />
          <h1 className="font-extrabold text-base flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>Servora Native Chat</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Escrow Protection
          </span>
        </div>
      </header>

      {/* Main Messaging Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        <UnifiedMessagingHub
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role || "CUSTOMER"}
        />
      </main>
    </div>
  );
}
