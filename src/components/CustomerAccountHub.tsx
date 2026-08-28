"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Camera,
  Save,
  Copy,
  Check,
  Heart,
  Store,
  ShoppingBag,
  Star,
  MessageCircle,
  Gavel,
  Settings,
  MapPin,
  Smartphone,
  Bell,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  CreditCard,
  Phone,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  KeyRound,
  X,
  Share2,
} from "lucide-react";
import { formatGHS, formatDate } from "@/lib/utils";

export default function CustomerAccountHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    activeGigsCount: 0,
    savedItemsCount: 0,
    openDisputesCount: 0,
    escrowVaultBalance: 0,
    totalOrdersCount: 0,
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "requests" | "escrow" | "messages" | "favorites" | "reviews" | "disputes" | "settings"
  >("overview");

  // Collections
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [escrowDeals, setEscrowDeals] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Sub Tab States
  const [favoriteSubTab, setFavoriteSubTab] = useState<"products" | "businesses">("businesses");
  const [reviewSubTab, setReviewSubTab] = useState<"reviews" | "community">("reviews");

  // Edit Profile Form State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [defaultZone, setDefaultZone] = useState("Tamale Central");
  const [defaultCurrency, setDefaultCurrency] = useState("GHS");
  const [preferredPayment, setPreferredPayment] = useState("MOMO_ESCROW");
  const [profileVisibility, setProfileVisibility] = useState("RESTRICTED");

  // Toggles
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyMarketingEmail, setNotifyMarketingEmail] = useState(false);
  const [sharePhoneWithArtisan, setSharePhoneWithArtisan] = useState(true);
  const [showNameOnReviews, setShowNameOnReviews] = useState(true);

  // Status & Modal States
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedEscrowForRelease, setSelectedEscrowForRelease] = useState<any>(null);
  const [releasePinInput, setReleasePinInput] = useState("");
  const [releasingFunds, setReleasingFunds] = useState(false);

  // Add Address Modal
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressZone, setAddressZone] = useState("Sakasaka");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressDefault, setAddressDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // New Dispute Modal
  const [showNewDisputeModal, setShowNewDisputeModal] = useState(false);
  const [disputeProviderId, setDisputeProviderId] = useState("");
  const [disputeAmount, setDisputeAmount] = useState("");
  const [disputeReason, setDisputeReason] = useState("Work not completed as quoted");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [savingDispute, setSavingDispute] = useState(false);

  useEffect(() => {
    fetchCustomerHubData();
  }, []);

  async function fetchCustomerHubData() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/profile");
      if (res.status === 401) {
        // Double check /api/auth/me
        const authMeRes = await fetch("/api/auth/me");
        const authMeData = await authMeRes.json();
        if (!authMeData.user) {
          router.push("/login");
          return;
        }
      }

      const data = await res.json();
      let currentUser = data.user;
      if (!currentUser) {
        const authMeRes = await fetch("/api/auth/me");
        const authMeData = await authMeRes.json();
        currentUser = authMeData.user;
      }

      if (currentUser) {
        setUser(currentUser);
        setProfile(data.profile || {
          defaultZone: "Tamale Central",
          defaultCurrency: "GHS",
          preferredPayment: "MOMO_ESCROW",
          profileVisibility: "RESTRICTED",
          verificationTier: "TIER_1_BASIC",
          savedAddresses: [],
        });
        if (data.metrics) setMetrics(data.metrics);
        if (data.serviceRequests) setServiceRequests(data.serviceRequests);
        if (data.escrowDeals) setEscrowDeals(data.escrowDeals);
        if (data.disputes) setDisputes(data.disputes);
        if (data.favorites) setFavorites(data.favorites);
        if (data.reviews) setReviews(data.reviews);
        if (data.communityPosts) setCommunityPosts(data.communityPosts);
        if (data.activityLogs) setActivityLogs(data.activityLogs);

        // Populate Form States
        setName(currentUser.name || "");
        setAvatarUrl(currentUser.avatarUrl || "");
        if (data.profile) {
          setDefaultZone(data.profile.defaultZone || "Tamale Central");
          setDefaultCurrency(data.profile.defaultCurrency || "GHS");
          setPreferredPayment(data.profile.preferredPayment || "MOMO_ESCROW");
          setProfileVisibility(data.profile.profileVisibility || "RESTRICTED");
          setNotifyInApp(data.profile.notifyInApp ?? true);
          setNotifyWhatsApp(data.profile.notifyWhatsApp ?? true);
          setNotifySms(data.profile.notifySms ?? true);
          setNotifyMarketingEmail(data.profile.notifyMarketingEmail ?? false);
          setSharePhoneWithArtisan(data.profile.sharePhoneWithArtisan ?? true);
          setShowNameOnReviews(data.profile.showNameOnReviews ?? true);
        }
      }
    } catch (e) {
      console.error("Failed to load customer hub:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatarUrl,
          defaultZone,
          defaultCurrency,
          preferredPayment,
          profileVisibility,
          notifyInApp,
          notifyWhatsApp,
          notifySms,
          notifyMarketingEmail,
          sharePhoneWithArtisan,
          showNameOnReviews,
        }),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      fetchCustomerHubData();
    } catch (err: any) {
      alert(err.message || "Failed to update profile settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch("/api/account/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addressLabel,
          zone: addressZone,
          streetDetails: addressStreet,
          landmark: addressLandmark,
          isDefault: addressDefault,
        }),
      });
      if (res.ok) {
        setShowAddAddressModal(false);
        setAddressStreet("");
        setAddressLandmark("");
        fetchCustomerHubData();
      }
    } catch (err) {
      alert("Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (!confirm("Are you sure you want to delete this saved address?")) return;
    try {
      await fetch(`/api/account/address?id=${addressId}`, { method: "DELETE" });
      fetchCustomerHubData();
    } catch (_) {}
  }

  async function handleConfirmEscrowRelease(dealId: string) {
    setReleasingFunds(true);
    try {
      const res = await fetch("/api/account/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RELEASE_FUNDS",
          dealId,
          releasePin: releasePinInput,
        }),
      });

      if (res.ok) {
        alert("Escrow funds released successfully to the artisan! ✓");
        setSelectedEscrowForRelease(null);
        setReleasePinInput("");
        fetchCustomerHubData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to release funds.");
      }
    } catch (_) {
      alert("Error processing escrow release.");
    } finally {
      setReleasingFunds(false);
    }
  }

  async function handleEscalateDispute(dealId: string) {
    const reason = prompt("Please enter the reason for requesting mediation / dispute hold:");
    if (!reason) return;

    try {
      const res = await fetch("/api/account/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_MEDIATION",
          dealId,
          reason,
        }),
      });

      if (res.ok) {
        alert("Dispute filed! Funds are securely locked in mediation. An Admin will review the case.");
        fetchCustomerHubData();
      }
    } catch (_) {}
  }

  async function handleCreateDispute(e: React.FormEvent) {
    e.preventDefault();
    setSavingDispute(true);
    try {
      const res = await fetch("/api/account/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: disputeProviderId,
          amount: disputeAmount,
          reason: disputeReason,
          description: disputeDesc,
        }),
      });

      if (res.ok) {
        setShowNewDisputeModal(false);
        setDisputeAmount("");
        setDisputeDesc("");
        alert("Dispute ticket registered successfully! Resolution team notified.");
        fetchCustomerHubData();
      }
    } catch (_) {
      alert("Failed to submit dispute.");
    } finally {
      setSavingDispute(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-stone-500">Synchronizing Customer 360 Workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900 dark:text-white">Customer Account Required</h2>
        <p className="text-stone-500 text-xs mt-2 mb-6">Please log in to access your personal dashboard, escrow vault, and job requests.</p>
        <Link href="/login" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition inline-block">
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. ULTRA-MODERN HEADER HERO CARD */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-xs relative overflow-hidden backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Left: Avatar & Identity */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-emerald-400">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl lg:text-2xl font-black tracking-tight text-stone-900 dark:text-white">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    CUSTOMER
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {profile?.verificationTier || "TIER_1_BASIC"}
                  </span>
                </div>

                <div className="text-stone-500 text-xs flex items-center gap-3 flex-wrap">
                  <span>📱 {user.phone}</span>
                  {user.email && <span>• ✉️ {user.email}</span>}
                  <span>• 📍 {profile?.defaultZone || "Tamale Central"}</span>
                </div>
              </div>
            </div>

            {/* Right: Referral Code & Merchant Switch */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-start md:justify-end">
              {user.referralCode && (
                <div className="bg-stone-100 dark:bg-stone-800/80 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center gap-2">
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-stone-400">Referral Code</div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{user.referralCode}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode);
                      setCopiedReferral(true);
                      setTimeout(() => setCopiedReferral(false), 2000);
                    }}
                    className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-500 transition cursor-pointer"
                    title="Copy Referral Code"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <Link
                href="/business/portal"
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-sm"
              >
                <Store className="w-3.5 h-3.5" /> Merchant Mode ➔
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB NAVIGATION BAR (8 WORKSPACE MODULES) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800 scrollbar-none">
          {[
            { id: "overview", label: "Overview & Stream", icon: TrendingUp },
            { id: "requests", label: `My Job Requests (${serviceRequests.length})`, icon: Briefcase },
            { id: "escrow", label: `MoMo Escrow Vault (${escrowDeals.length})`, icon: ShieldCheck, badge: metrics.escrowVaultBalance > 0 ? `GH₵ ${metrics.escrowVaultBalance.toFixed(0)}` : null },
            { id: "messages", label: "Inbox & Messages", icon: MessageSquare },
            { id: "favorites", label: `Saved (${favorites.length})`, icon: Heart },
            { id: "reviews", label: `Reviews & Forum (${reviews.length + communityPosts.length})`, icon: Star },
            { id: "disputes", label: `Disputes & Helpdesk (${disputes.length})`, icon: Gavel },
            { id: "settings", label: "Profile & Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isSel ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-600"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & LIVE ACTIVITY STREAM */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-2">
                  <span>ACTIVE JOBS & GIGS</span>
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-white">{metrics.activeGigsCount}</div>
                <div className="text-[11px] text-stone-500 mt-1">In progress & open for bids</div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-2">
                  <span>MOMO ESCROW VAULT</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  GH₵ {metrics.escrowVaultBalance.toFixed(2)}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">100% Protected held funds</div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-2">
                  <span>SAVED WORKSHOPS</span>
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-white">{metrics.savedItemsCount}</div>
                <div className="text-[11px] text-stone-500 mt-1">Bookmarked businesses</div>
              </div>

              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-2">
                  <span>OPEN DISPUTES</span>
                  <Gavel className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-white">{metrics.openDisputesCount}</div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {metrics.openDisputesCount === 0 ? "Account in good standing ✓" : "Requires mediation review"}
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/services/request"
                className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 font-bold hover:scale-[1.02] transition"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Post New Job Request</span>
              </Link>
              <button
                onClick={() => setActiveTab("escrow")}
                className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-center gap-3 text-blue-800 dark:text-blue-300 font-bold hover:scale-[1.02] transition text-left cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Manage Escrow Deals</span>
              </button>
              <Link
                href="/community"
                className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 rounded-2xl flex items-center gap-3 text-purple-800 dark:text-purple-300 font-bold hover:scale-[1.02] transition"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Tamale Community Board</span>
              </Link>
              <button
                onClick={() => setActiveTab("settings")}
                className="p-4 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-300 font-bold hover:scale-[1.02] transition text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Saved GPS Addresses</span>
              </button>
            </div>

            {/* Live Chronological Activity Stream */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Real-Time Activity Stream</h3>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Immutable audit log</span>
              </div>

              {activityLogs.length === 0 ? (
                <div className="py-8 text-center text-stone-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-stone-400 opacity-50" />
                  <p>No recent actions logged. Start by requesting a quote or saving a store!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-stone-900 dark:text-white">{log.description}</div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{log.actionType}</span>
                          <span>•</span>
                          <span>{new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SERVICE REQUESTS & JOB ORDERS */}
        {/* ========================================================================= */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-base">Service Requests & Dispatch Gigs</h3>
                <p className="text-stone-500 text-xs">Track incoming bids, quotes from artisans, and job completion releases.</p>
              </div>
              <Link href="/services/request" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                <Plus className="w-3.5 h-3.5" /> Post New Request
              </Link>
            </div>

            {serviceRequests.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">No Service Requests Found</h4>
                <p className="text-xs mt-1 mb-4">Post a request to receive instant quotes from local verified artisans in Tamale.</p>
                <Link href="/services/request" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs inline-block">
                  Post a Job Request Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceRequests.map((req: any) => (
                  <div key={req.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-stone-900 dark:text-white text-sm leading-snug">{req.title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shrink-0">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs line-clamp-2">{req.description}</p>
                      <div className="text-[11px] text-stone-400 flex items-center gap-3">
                        <span>📍 {req.streetAddress || req.location?.area || "Tamale Central"}</span>
                        <span>•</span>
                        <span>Budget: {req.budgetMin ? `GH₵ ${req.budgetMin}` : "Open Quotes"}</span>
                      </div>
                    </div>

                    {/* Artisan Quotes Received */}
                    <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex items-center justify-between">
                      <span className="text-stone-500 font-bold text-[11px]">{req.quotes?.length || 0} Quotes Received</span>
                      <Link href={`/requests/${req.id}`} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs transition flex items-center gap-1">
                        View Quotes ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MOMO ESCROW VAULT & LIVE DEAL TRACKER */}
        {/* ========================================================================= */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
            {/* Escrow Header & Security Vault Banner */}
            <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-3xl p-6 text-white space-y-3 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-black tracking-tight">Servora MoMo Escrow Vault</h3>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Your payments are held in escrow and ONLY released to the artisan when you confirm satisfactory job completion with your 4-digit PIN.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Active Vault Held Balance</div>
                  <div className="text-2xl font-black text-emerald-400">GH₵ {metrics.escrowVaultBalance.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Escrow Deals List */}
            {escrowDeals.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">No Active Escrow Transactions</h4>
                <p className="text-xs mt-1">When you book an artisan or purchase goods via MoMo Escrow, the transaction tracker will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {escrowDeals.map((deal: any) => (
                  <div key={deal.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {deal.dealCode}
                          </span>
                          <h4 className="font-extrabold text-stone-900 dark:text-white text-base">{deal.title}</h4>
                        </div>
                        <div className="text-stone-500 text-xs mt-1">
                          Artisan: <span className="font-bold text-stone-800 dark:text-stone-200">{deal.provider?.name || "Verified Provider"}</span> • Phone: {deal.provider?.phone || "N/A"}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-lg font-black text-stone-900 dark:text-white">GH₵ {Number(deal.amount).toFixed(2)}</div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          deal.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : deal.status === "DISPUTED"
                            ? "bg-red-500/20 text-red-600"
                            : "bg-amber-500/20 text-amber-600"
                        }`}>
                          {deal.status.replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Milestone Lifecycle</div>
                      <div className="grid grid-cols-4 gap-2">
                        {["Secured in Vault", "Work In Progress", "Inspection & Review", "Completed & Released"].map((step, idx) => {
                          const isDone = deal.status === "COMPLETED" || (idx === 0 && deal.status === "FUNDS_HELD_IN_VAULT");
                          return (
                            <div key={step} className={`p-2 rounded-xl border text-center text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-400"
                            }`}>
                              {step}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Customer Actions */}
                    {deal.status !== "COMPLETED" && deal.status !== "REFUNDED" && (
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleEscalateDispute(deal.id)}
                          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Hold & Mediate Dispute
                        </button>
                        <button
                          onClick={() => setSelectedEscrowForRelease(deal)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Release Funds to Artisan 💳
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: UNIFIED CONVERSATIONS & INBOX */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-base">Conversations & Artisan Contacts</h3>
                <p className="text-stone-500 text-xs">Direct WhatsApp and in-app message threads with vendors in Northern Ghana.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="space-y-3">
                {favorites.map((fav: any) => (
                  <div key={fav.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                        {fav.business?.businessName?.charAt(0) || "B"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-stone-900 dark:text-white truncate">{fav.business?.businessName}</div>
                        <div className="text-[11px] text-stone-400">📱 {fav.business?.phone || fav.business?.whatsappNumber}</div>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${fav.business?.whatsappNumber?.replace(/[^0-9]/g, "") || "233240000000"}?text=${encodeURIComponent(`Hello ${fav.business?.businessName}, I am contacting you from my Servora account regarding services.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Artisan ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: LIKED PRODUCTS & FAVORITED BUSINESSES */}
        {/* ========================================================================= */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <button
                onClick={() => setFavoriteSubTab("businesses")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                  favoriteSubTab === "businesses" ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                Saved Stores & Workshops ({favorites.length})
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                <Heart className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">No Saved Stores Yet</h4>
                <p className="text-xs mt-1">Bookmark verified artisans and businesses across Tamale to quickly reach them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav: any) => (
                  <div key={fav.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                          {fav.business?.logoUrl ? (
                            <img src={fav.business.logoUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            fav.business?.businessName?.charAt(0) || "B"
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-900 dark:text-white truncate">{fav.business?.businessName}</h4>
                          <span className="text-[10px] text-stone-400">📍 {fav.business?.zone || "Tamale Central"}</span>
                        </div>
                      </div>
                      <p className="text-stone-500 text-xs line-clamp-2 mt-2">{fav.business?.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
                      <Link href={`/biz/${fav.business?.slug || fav.business?.id}`} className="text-emerald-600 font-bold text-xs hover:underline">
                        View Store ➔
                      </Link>
                      <a
                        href={`https://wa.me/${fav.business?.whatsappNumber?.replace(/[^0-9]/g, "") || "233240000000"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1"
                      >
                        WhatsApp ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REVIEWS & COMMUNITY ACTIVITY */}
        {/* ========================================================================= */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <button
                onClick={() => setReviewSubTab("reviews")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                  reviewSubTab === "reviews" ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                My Reviews Given ({reviews.length})
              </button>
              <button
                onClick={() => setReviewSubTab("community")}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                  reviewSubTab === "community" ? "bg-emerald-600 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                Community Board Posts ({communityPosts.length})
              </button>
            </div>

            {reviewSubTab === "reviews" ? (
              reviews.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                  <Star className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                  <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">No Reviews Written Yet</h4>
                  <p className="text-xs mt-1">When you hire artisans or buy products, leave verified feedback to build trust in Tamale.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 dark:text-white">Reviewed: {rev.targetUser?.name || "Artisan"}</span>
                        <div className="flex items-center text-amber-500 font-bold">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </div>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-xs">{rev.comment}</p>
                      <div className="text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              communityPosts.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                  <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">No Community Notices Posted</h4>
                  <Link href="/community" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs inline-block mt-3">
                    Post to Tamale Notice Board
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {communityPosts.map((post: any) => (
                    <div key={post.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-2">
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">{post.title}</h4>
                      <p className="text-stone-600 dark:text-stone-300 text-xs">{post.content}</p>
                      <div className="flex items-center gap-4 text-stone-400 text-[11px] pt-1">
                        <span>👍 {post.upvotes?.length || 0} Upvotes</span>
                        <span>💬 {post.comments?.length || 0} Comments</span>
                        <span>📍 {post.zone || "Tamale"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DISPUTES, RETURNS & HELPDESK */}
        {/* ========================================================================= */}
        {activeTab === "disputes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-base">Mediation Desk & Dispute Holds</h3>
                <p className="text-stone-500 text-xs">Direct three-way mediation between buyer, artisan, and platform admins.</p>
              </div>
              <button
                onClick={() => setShowNewDisputeModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> File New Dispute Ticket
              </button>
            </div>

            {disputes.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
                <Gavel className="w-10 h-10 mx-auto mb-3 text-stone-400 opacity-50" />
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">Zero Active Disputes</h4>
                <p className="text-xs mt-1">All your escrow contracts and artisan jobs are in good standing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((dsp: any) => (
                  <div key={dsp.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-red-100 dark:bg-red-950/50 text-red-600 px-2 py-0.5 rounded-md">
                          {dsp.caseNumber}
                        </span>
                        <span className="font-bold text-stone-900 dark:text-white">{dsp.reason}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600">
                        {dsp.status}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 text-xs">{dsp.description}</p>
                    <div className="text-[11px] text-stone-400 flex items-center gap-3 border-t border-stone-100 dark:border-stone-800 pt-2">
                      <span>Disputed Amount: <strong>GH₵ {Number(dsp.amount).toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Artisan: {dsp.provider?.name || "Merchant"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: PROFILE, ADDRESSES & SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Personal Info & Privacy */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-stone-900 dark:text-white text-sm border-b border-stone-200 dark:border-stone-800 pb-3">
                  Personal Information & Localization Defaults
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Avatar / Profile Photo URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://media.servora.gh/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Default Northern Ghana Region / Zone</label>
                    <select
                      value={defaultZone}
                      onChange={(e) => setDefaultZone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    >
                      {["Tamale Central", "Sakasaka", "Aboabo", "Nyohini", "Choggu", "Dungu", "Lamashegu", "Bolgatanga", "Wa"].map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Preferred Escrow Settlement Method</label>
                    <select
                      value={preferredPayment}
                      onChange={(e) => setPreferredPayment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                    >
                      <option value="MOMO_ESCROW">MTN MoMo / Telecel Escrow (Recommended)</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="DIRECT_TRANSFER">Bank Settlement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification & Communication Toggles */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-stone-900 dark:text-white text-sm border-b border-stone-200 dark:border-stone-800 pb-3">
                  Notification Channels & Real-Time Alerts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700 cursor-pointer">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">WhatsApp Notifications</div>
                      <div className="text-[11px] text-stone-500">Order updates, quote alerts, dispute notes</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700 cursor-pointer">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">In-App Live Alerts</div>
                      <div className="text-[11px] text-stone-500">Real-time unread badges & quote arrivals</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyInApp}
                      onChange={(e) => setNotifyInApp(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700 cursor-pointer">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">SMS Security Alerts</div>
                      <div className="text-[11px] text-stone-500">OTP codes & escrow release verification PINs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700 cursor-pointer">
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white">Share Phone with Verified Artisans</div>
                      <div className="text-[11px] text-stone-500">Allows instant WhatsApp contact when requesting quote</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={sharePhoneWithArtisan}
                      onChange={(e) => setSharePhoneWithArtisan(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex items-center justify-between">
                {savedSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Preferences updated in live database!
                  </span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Account Settings
                  </button>
                </div>
              </div>
            </form>

            {/* Saved Delivery Addresses */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">Saved Delivery & Service Addresses</h3>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add GPS Address
                </button>
              </div>

              {profile?.savedAddresses?.length === 0 ? (
                <div className="py-6 text-center text-stone-400 text-xs">No saved addresses. Add your primary home or workshop location in Tamale.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile?.savedAddresses?.map((addr: any) => (
                    <div key={addr.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-800 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-stone-900 dark:text-white">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-600">DEFAULT</span>
                          )}
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300 font-medium">{addr.zone}</div>
                        {addr.landmark && <div className="text-[11px] text-stone-400">Landmark: {addr.landmark}</div>}
                      </div>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="text-stone-400 hover:text-red-500 transition p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ESCROW RELEASE PIN CONFIRMATION */}
      {/* ========================================================================= */}
      {selectedEscrowForRelease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-black text-stone-900 dark:text-white text-base">Confirm Escrow Payout</h3>
              <button onClick={() => setSelectedEscrowForRelease(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-stone-600 dark:text-stone-300 text-xs">
              You are authorizing the release of <strong>GH₵ {Number(selectedEscrowForRelease.amount).toFixed(2)}</strong> from the secure Servora vault to <strong>{selectedEscrowForRelease.provider?.name || "Artisan"}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">Enter 4-Digit Release PIN (or click confirm)</label>
              <input
                type="text"
                placeholder="4-Digit PIN"
                value={releasePinInput}
                onChange={(e) => setReleasePinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm font-mono text-center tracking-widest font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedEscrowForRelease(null)}
                className="px-4 py-2 text-stone-500 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmEscrowRelease(selectedEscrowForRelease.id)}
                disabled={releasingFunds}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition"
              >
                {releasingFunds ? "Processing MoMo Payout..." : "Authorize MoMo Release ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD GPS ADDRESS */}
      {/* ========================================================================= */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAddress} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-black text-stone-900 dark:text-white text-base">Add Saved Address</h3>
              <button type="button" onClick={() => setShowAddAddressModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">Label</label>
              <input
                type="text"
                placeholder="e.g. Home, Workshop, Store"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">Zone / Neighborhood</label>
              <select
                value={addressZone}
                onChange={(e) => setAddressZone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
              >
                {["Sakasaka", "Aboabo", "Nyohini", "Choggu", "Dungu", "Tamale Central", "Lamashegu", "Bolgatanga", "Wa"].map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">Prominent Landmark / Details</label>
              <input
                type="text"
                placeholder="e.g. Near Sakasaka Total Station"
                value={addressLandmark}
                onChange={(e) => setAddressLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={addressDefault}
                onChange={(e) => setAddressDefault(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Set as Primary Default Delivery Address</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAddAddressModal(false)} className="px-4 py-2 text-stone-500 font-bold text-xs">
                Cancel
              </button>
              <button type="submit" disabled={savingAddress} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
                {savingAddress ? "Saving..." : "Save Address ✓"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
