"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  Wrench,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  QrCode,
  Share2,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  PhoneCall,
  ExternalLink,
  MessageSquare,
  Search,
  Check,
  X,
  AlertTriangle,
  ShoppingBag,
  Save,
  Globe,
  User,
  Users,
  Sparkles,
  RefreshCw,
  Layers,
  FileCheck,
  Trash2,
} from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { BusinessOnboardingWizard } from "@/components/BusinessOnboardingWizard";
import { BusinessCatalogManager } from "@/components/BusinessCatalogManager";
import { BusinessLeadCrmBoard } from "@/components/BusinessLeadCrmBoard";
import { BusinessAnalyticsView } from "@/components/BusinessAnalyticsView";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { BusinessRecycleBin } from "@/components/BusinessRecycleBin";
import { formatGHS } from "@/lib/utils";

export default function BusinessOwnerPortalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "catalogs" | "leads" | "messages" | "analytics" | "verification" | "recycle_bin">("catalogs");
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);
  const [recycleBinCount, setRecycleBinCount] = useState(0);

  useEffect(() => {
    // ⚡ INSTANT RENDER FROM CACHE (0ms delay)
    try {
      const cached = sessionStorage.getItem("servora_merchant_portal_data");
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    } catch (_) {}

    fetchPortalData();
  }, []);

  async function fetchRecycleBinCount() {
    try {
      const res = await fetch("/api/business/recycle-bin");
      const json = await res.json();
      let count = Array.isArray(json.items) ? json.items.length : 0;
      try {
        const local = localStorage.getItem("servora_merchant_recycle_bin");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > count) count = parsed.length;
        }
      } catch (_) {}
      setRecycleBinCount(count);
    } catch (_) {}
  }

  async function fetchPortalData() {
    try {
      if (!data) setLoading(true);
      setError(null);
      const res = await fetch("/api/business/portal");
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to access your merchant business dashboard.");
          return;
        }
        throw new Error(json.error || "Failed to load portal data.");
      }
      setData(json);
      try {
        sessionStorage.setItem("servora_merchant_portal_data", JSON.stringify(json));
      } catch (_) {}

      // Lazily fetch recycle bin count after main data has loaded to prevent query contention
      setTimeout(() => {
        fetchRecycleBinCount();
      }, 500);
    } catch (err: any) {
      if (!data) {
        setError(err.message || "Unable to reach business portal server.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
            Loading Servora Enterprise Portal...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-xl space-y-4">
          <Building2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-black text-stone-900 dark:text-white">Business Owner Portal</h2>
          <p className="text-xs text-stone-500">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login?redirect=/business/portal"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
            >
              Sign In to Storefront ➔
            </Link>
            <button
              onClick={fetchPortalData}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = data?.businessProfile || data?.providerProfile;
  const isProfileComplete = Boolean(data?.businessProfile);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* TOP ENTERPRISE HEADER BANNER */}
        {profile ? (
          <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 border border-stone-800 rounded-3xl p-6 lg:p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center font-black text-2xl overflow-hidden shrink-0 shadow-lg">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt={profile.businessName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-emerald-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {profile.businessType || "VERIFIED ENTERPRISE"}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-full text-[10px] font-bold">
                      {profile.verificationStatus || "TIER_1_BASIC"}
                    </span>
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-black">{profile.businessName}</h1>
                  <p className="text-xs text-stone-300 flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {profile.zone || profile.serviceArea || "Tamale Central"}
                    <span className="font-mono text-emerald-400 text-[11px]">servora.gh/biz/@{profile.slug}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={`/biz/${profile.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> View Public Storefront
                </Link>
                <button
                  onClick={() => setIsEditingOnboarding(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                >
                  Edit Profile Setup
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl text-amber-900 dark:text-amber-200">
            <h2 className="text-xl font-bold">Complete Your Enterprise Business Registration</h2>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Please complete the 4-step onboarding wizard below to publish your digital storefront and unlock lead dispatching.
            </p>
          </div>
        )}

        {/* EMBEDDED ONBOARDING WIZARD WHEN EDITING OR UNREGISTERED */}
        {(!isProfileComplete || isEditingOnboarding) ? (
          <div className="space-y-4">
            {isEditingOnboarding && (
              <button
                onClick={() => setIsEditingOnboarding(false)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 underline"
              >
                ← Back to Workspace Dashboard
              </button>
            )}
            <BusinessOnboardingWizard
              initialData={profile}
              onComplete={() => {
                setIsEditingOnboarding(false);
                fetchPortalData();
              }}
            />
          </div>
        ) : (
          /* SIDEBAR & MAIN WORKSPACE LAYOUT */
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* LEFT SIDE MENU */}
            <aside className="w-full lg:w-72 shrink-0 space-y-4">
              {/* Mobile Tab Pills (shown on small screens) */}
              <div className="lg:hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-2 shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "catalogs" as const, label: "Catalogs", icon: Package },
                    { id: "leads" as const, label: "Leads", icon: Users },
                    { id: "messages" as const, label: "Inbox", icon: MessageSquare },
                    { id: "analytics" as const, label: "Analytics", icon: TrendingUp },
                    { id: "verification" as const, label: "Trust", icon: ShieldCheck },
                    { id: "recycle_bin" as const, label: "Trash", icon: Trash2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSel = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSel
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Side Menu Card (Sticky on scroll) */}
              <div className="hidden lg:block bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm sticky top-24 space-y-4">
                {/* Header */}
                <div className="px-2 py-1 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-3">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Workspace Menu</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                {/* Main Navigation Items */}
                <nav className="space-y-1.5">
                  {[
                    {
                      id: "catalogs" as const,
                      label: "Storefront Catalogs",
                      description: "Products, rentals & services",
                      icon: Package,
                      badge:
                        (profile.products?.length || 0) +
                          (profile.rentals?.length || profile.rentalTools?.length || 0) +
                          (profile.services?.length || 0) >
                        0
                          ? (profile.products?.length || 0) +
                            (profile.rentals?.length || profile.rentalTools?.length || 0) +
                            (profile.services?.length || 0)
                          : null,
                    },
                    {
                      id: "leads" as const,
                      label: "Lead CRM & Quotes",
                      description: "Inquiries, bids & dispatch",
                      icon: Users,
                      badge:
                        (profile.leads?.length || 0) + (data.incomingRequests?.length || 0) > 0
                          ? `${(profile.leads?.length || 0) + (data.incomingRequests?.length || 0)}`
                          : null,
                    },
                    {
                      id: "messages" as const,
                      label: "Customer Inbox",
                      description: "Direct customer messaging",
                      icon: MessageSquare,
                      badge: null,
                    },
                    {
                      id: "analytics" as const,
                      label: "Analytics & Revenue",
                      description: "Views, revenue & insights",
                      icon: TrendingUp,
                      badge: null,
                    },
                    {
                      id: "verification" as const,
                      label: "Trust & Verification",
                      description: "Ghana Card & KYB tiers",
                      icon: ShieldCheck,
                      badge: profile.verificationStatus ? "Tier 1" : null,
                    },
                    {
                      id: "recycle_bin" as const,
                      label: "Recycle Bin",
                      description: "Trash & restore deleted items",
                      icon: Trash2,
                      badge: recycleBinCount > 0 ? `${recycleBinCount}` : null,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSel = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left group cursor-pointer ${
                          isSel
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                            : "bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl transition ${
                              isSel
                                ? "bg-white/20 text-white"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{item.label}</div>
                            <div
                              className={`text-[10px] truncate ${
                                isSel ? "text-emerald-100" : "text-stone-400 dark:text-stone-500"
                              }`}
                            >
                              {item.description}
                            </div>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                              isSel
                                ? "bg-white/20 text-white"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Shortcuts */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-1 px-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 mb-1.5">
                    Storefront Actions
                  </p>

                  <Link
                    href={`/biz/${profile.slug}`}
                    target="_blank"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      <span>Public Storefront</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">↗</span>
                  </Link>

                  <button
                    onClick={() => setIsEditingOnboarding(true)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-stone-400" />
                      <span>Edit Profile Setup</span>
                    </span>
                  </button>
                </div>

                {/* Status card */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-stone-900 dark:text-white truncate">
                      {profile.businessName}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{profile.verificationStatus || "Verified Solo Artisan"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT MAIN WORKSPACE CONTENT CANVAS */}
            <main className="flex-1 min-w-0 w-full">

            {/* TAB CONTENT PANELS */}
            {activeTab === "catalogs" && (
              <BusinessCatalogManager
                products={profile.products || []}
                rentals={profile.rentals || profile.rentalTools || []}
                services={profile.services || []}
                onRefresh={fetchPortalData}
              />
            )}

            {activeTab === "leads" && (
              <BusinessLeadCrmBoard
                leads={profile.leads || []}
                incomingCalls={data.incomingRequests || []}
                whatsappNumber={profile.whatsappNumber}
                onRefresh={fetchPortalData}
              />
            )}

            {activeTab === "messages" && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
                <UnifiedMessagingHub currentUserId={profile?.userId || ""} currentUserRole="PROVIDER" />
              </div>
            )}

            {activeTab === "analytics" && <BusinessAnalyticsView />}

            {activeTab === "verification" && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">KYB / KYC Trust Tiering</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Verified business status increases customer conversion rates by up to 300%.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 border border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Tier 1 Status</span>
                    <h4 className="text-base font-bold mt-1 text-stone-900 dark:text-white">Phone & WhatsApp Verified</h4>
                    <p className="text-xs text-stone-500 mt-2">Active. Direct lead routing enabled.</p>
                  </div>

                  <div className="p-5 border border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                    <span className="text-[10px] font-bold uppercase text-blue-600">Tier 2 Status</span>
                    <h4 className="text-base font-bold mt-1 text-stone-900 dark:text-white">Ghana Card & Artisan Badge</h4>
                    <p className="text-xs text-stone-500 mt-2">
                      {profile.idCardNumber ? `Submitted (${profile.idCardNumber})` : "Not submitted yet."}
                    </p>
                  </div>

                  <div className="p-5 border border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                    <span className="text-[10px] font-bold uppercase text-purple-600">Tier 3 Status</span>
                    <h4 className="text-base font-bold mt-1 text-stone-900 dark:text-white">Registered Enterprise</h4>
                    <p className="text-xs text-stone-500 mt-2">
                      {profile.businessCertUrl ? "RGD / ORC Cert Verified" : "Submit Business Cert for verified enterprise badge."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingOnboarding(true)}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Upload Identification & Business Certificates
                </button>
              </div>
            )}

            {activeTab === "recycle_bin" && (
              <BusinessRecycleBin
                onItemRestored={() => {
                  fetchPortalData();
                  fetchRecycleBinCount();
                }}
              />
            )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
