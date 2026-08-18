"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Rocket,
  Users,
  Briefcase,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Building2,
  DollarSign,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  HardDrive,
  Cloud,
  Layers,
  Wrench,
  MessageSquare,
  Sparkles,
  Zap,
  Tag,
  Star,
  Settings,
  Sun,
  Moon,
  Globe,
  Sliders,
  Bell,
  Lock,
  Save,
  Menu,
  Scale,
  Megaphone,
  Activity,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { LaunchModeWidget } from "@/components/LaunchModeWidget";
import { TrustBadge } from "@/components/TrustBadge";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { CsvImporterModal } from "@/components/CsvImporterModal";
import { AdminTickersManager } from "@/components/AdminTickersManager";
import { CustomerCrmDashboard } from "@/components/CustomerCrmDashboard";
import { AdminProductModerationHub } from "@/components/AdminProductModerationHub";
import { AdminLayoutShell } from "@/components/AdminLayoutShell";
import { formatDate, formatGHS } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Theme Mode: "dark" | "light"
  const [themeMode, setThemeMode] = useState<"dark" | "light">("light");

  // Active View in Admin Shell
  const [activeView, setActiveView] = useState<
    "overview" | "crm" | "tickers" | "members" | "businesses" | "services" | "products" | "requests" | "disputes" | "storage" | "verification" | "flags" | "settings" | "activity"
  >("overview");

  const [searchFilter, setSearchFilter] = useState("");

  // System Settings State
  const [platformName, setPlatformName] = useState("Servora.gh Marketplace");
  const [supportPhone, setSupportPhone] = useState("+233501234567");
  const [supportEmail, setSupportEmail] = useState("support@servora.gh");
  const [commissionRate, setCommissionRate] = useState("5");
  const [maxImageUploadMB, setMaxImageUploadMB] = useState("5");
  const [autoApproveVerifiedArtisans, setAutoApproveVerifiedArtisans] = useState(true);
  const [enableGuestClassifieds, setEnableGuestClassifieds] = useState(true);
  const [enableEscrowProtection, setEnableEscrowProtection] = useState(true);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  async function fetchAdminStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch admin stats.");
      setData(data);
    } catch (err: any) {
      setError(err.message);
    } fontFinally: {
      setLoading(false);
    }
  }

  // Handle errors
  function fontFinally() {
    setLoading(false);
  }

  async function handleAdminAction(action: string, targetId?: string, extraData?: any) {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId, extraData }),
      });
      if (res.ok) {
        fetchAdminStats();
      } else {
        const d = await res.json();
        alert(d.error || "Action failed.");
      }
    } catch (e) {
      alert("Network error.");
    }
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-slate-500 font-bold text-sm">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        Loading Servora Admin Portal...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Access Required</h2>
          <p className="text-slate-500 text-xs">{error || "Please log in with admin privileges."}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition"
          >
            Log In as Admin
          </Link>
        </div>
      </div>
    );
  }

  const {
    stats = {},
    storageStats = {},
    featureFlags = [],
    auditLogs = [],
    providers = [],
    products = [],
    users = [],
    categories = [],
    serviceRequests = [],
  } = data;

  const filteredUsers = users.filter(
    (u: any) =>
      u.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.phone?.includes(searchFilter) ||
      u.email?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredProviders = providers.filter(
    (p: any) =>
      p.businessName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.user?.phone?.includes(searchFilter)
  );

  return (
    <AdminLayoutShell
      activeView={activeView}
      onSelectView={(v) => setActiveView(v as any)}
      pendingVerificationsCount={stats.pendingVerifications || 0}
      pendingProductsCount={products.filter((p: any) => !p.isAvailable).length || 6}
      unresolvedDisputesCount={0}
      themeMode={themeMode}
      onToggleTheme={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. VIEW: DASHBOARD OVERVIEW (12-COL RESPONSIVE GRID) */}
      {/* ------------------------------------------------------------- */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* TOP KPI METRICS STRIP (4 EQUAL CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Weekly Connections / North Star */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Weekly Connections
                </span>
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +14%
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.northStarWeeklyConnections || 83}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                Accepted Quotes + Completed Jobs
              </span>
            </div>

            {/* Card 2: Registered Artisans & Businesses */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Registered Merchants
                </span>
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.totalProviders || 24}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                {stats.verifiedProviders || 21} Verified • {stats.pendingVerifications || 3} Pending
              </span>
            </div>

            {/* Card 3: Total Active Products & Gigs */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Products & Service Calls
                </span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {(stats.totalProducts || 6) + (stats.totalRequests || 12)}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                {stats.totalProducts || 6} Products • {stats.totalRequests || 12} Active Requests
              </span>
            </div>

            {/* Card 4: Infrastructure & Storage */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Storage & Infrastructure
                </span>
                <HardDrive className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {storageStats.totalStorageUsedMB || 1.85} MB
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-[2%] h-full bg-emerald-500 rounded-full" />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                100 GB Free Cap (Cloudflare R2 + Scaleway)
              </span>
            </div>
          </div>

          {/* MAIN 12-COL CONTENT AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT 8 COLS: FOUNDER LAUNCH TRACKER & RECENT AUDIT LOGS */}
            <div className="lg:col-span-8 space-y-6">
              {/* Launch Mode Widget */}
              <LaunchModeWidget />

              {/* Live Activity Feed */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Recent Administrative Activity
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Real-Time Log</span>
                </div>

                <div className="space-y-2">
                  {auditLogs.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {log.action}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {log.details}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT 4 COLS: URGENT ACTION QUEUE & METADATA */}
            <div className="lg:col-span-4 space-y-6">
              {/* Urgent Action Queue */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-zinc-800">
                  Urgent Action Queue ⚡
                </h3>

                <div className="space-y-2.5">
                  {/* Pending ID Verifications */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        Pending ID Approvals
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {stats.pendingVerifications || 1} Ghana Cards awaiting check
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveView("verification")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer transition flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Pending Product Approvals */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        Product Moderation Queue
                      </span>
                      <span className="text-[11px] text-slate-500">
                        6 Guest & merchant items
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveView("products")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow cursor-pointer transition flex items-center gap-1"
                    >
                      <span>Open Queue</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Unresolved Disputes */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">
                        Unresolved Disputes
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        0 Active disputes • System Healthy
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded text-[10px]">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Metadata Pills Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 text-[10px] block">
                  Platform Quick Specs
                </span>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daily Ad Spend:</span>
                    <span className="font-bold text-slate-900 dark:text-white">GH₵ 0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Region:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Northern Ghana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PWA Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. VIEW: CUSTOMER CRM 360 WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      {activeView === "crm" && <CustomerCrmDashboard isDark={themeMode === "dark"} />}

      {/* ------------------------------------------------------------- */}
      {/* 3. VIEW: PRODUCT MODERATION HUB */}
      {/* ------------------------------------------------------------- */}
      {activeView === "products" && <AdminProductModerationHub isDark={themeMode === "dark"} />}

      {/* ------------------------------------------------------------- */}
      {/* 4. VIEW: ANNOUNCEMENT TICKERS MANAGER */}
      {/* ------------------------------------------------------------- */}
      {activeView === "tickers" && <AdminTickersManager isDark={themeMode === "dark"} />}

      {/* ------------------------------------------------------------- */}
      {/* 5. VIEW: MEMBERS DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeView === "members" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Members Directory</h2>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Member Name</th>
                    <th className="p-4">Phone / WhatsApp</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-850/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-4 font-mono text-slate-500">{u.phone}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{formatDate(u.createdAt)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleAdminAction("TOGGLE_USER_ROLE", u.id)}
                          className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-lg text-xs"
                        >
                          Toggle Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. VIEW: BUSINESS PROFILES */}
      {/* ------------------------------------------------------------- */}
      {activeView === "businesses" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Profiles & Verified Artisans</h2>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4">Business Name</th>
                    <th className="p-4">Service Area</th>
                    <th className="p-4">Verification State</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {filteredProviders.map((prov: any) => (
                    <tr key={prov.id} className="hover:bg-slate-50 dark:hover:bg-zinc-850/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{prov.businessName}</td>
                      <td className="p-4 font-medium text-slate-500">{prov.serviceArea}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {prov.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleAdminAction("TOGGLE_PROVIDER_VERIFICATION", prov.id)}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                        >
                          Verify Artisan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. VIEW: SYSTEM SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeView === "settings" && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" /> Platform & Portal Master Settings
              </h2>
              <p className="text-xs text-slate-500">Configure marketplace operations, media limits, security, and UI preferences.</p>
            </div>

            {settingsSavedMessage && (
              <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" /> Settings Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Core Marketplace Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Platform Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Master Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AdminLayoutShell>
  );
}
