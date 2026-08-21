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
} from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { BusinessOnboardingWizard } from "@/components/BusinessOnboardingWizard";
import { BusinessCatalogManager } from "@/components/BusinessCatalogManager";
import { BusinessLeadCrmBoard } from "@/components/BusinessLeadCrmBoard";
import { BusinessAnalyticsView } from "@/components/BusinessAnalyticsView";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { formatGHS } from "@/lib/utils";

export default function BusinessOwnerPortalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "catalogs" | "leads" | "messages" | "analytics" | "verification">("catalogs");
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, []);

  async function fetchPortalData() {
    try {
      setLoading(true);
      const res = await fetch("/api/business/portal");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load portal data.");
      setData(json);
    } catch (err: any) {
      setError(err.message);
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
          /* WORKSPACE NAVIGATION TABS */
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setActiveTab("catalogs")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "catalogs"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <Package className="w-4 h-4" /> Storefront Catalogs
              </button>

              <button
                onClick={() => setActiveTab("leads")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "leads"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <Users className="w-4 h-4" /> Lead CRM & Quotes
              </button>

              <button
                onClick={() => setActiveTab("messages")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "messages"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Customer Inbox
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "analytics"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Analytics & Revenue
              </button>

              <button
                onClick={() => setActiveTab("verification")}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "verification"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Trust & Verification
              </button>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
