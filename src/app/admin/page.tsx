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
} from "lucide-react";
import { LaunchModeWidget } from "@/components/LaunchModeWidget";
import { TrustBadge } from "@/components/TrustBadge";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { CsvImporterModal } from "@/components/CsvImporterModal";
import { formatDate, formatGHS } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme Mode: "dark" | "light"
  const [themeMode, setThemeMode] = useState<"dark" | "light">("light");

  // Active View in 3-Panel Dashboard
  const [activeView, setActiveView] = useState<
    "overview" | "members" | "businesses" | "services" | "products" | "requests" | "disputes" | "storage" | "verification" | "flags" | "settings"
  >("overview");

  const [searchFilter, setSearchFilter] = useState("");

  // System Settings State
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "Servora Marketplace",
    cityRegion: "Tamale, Northern Region, Ghana",
    currencySymbol: "GH₵",
    commissionRatePercent: 5,
    autoWebpCompression: true,
    requireGhanaCardVerification: true,
    enableWhatsappNotifications: true,
    adminSessionTimeoutMins: 60,
  });

  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Add Service State
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("servora_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
    fetchAdminStats();
  }, []);

  useEffect(() => {
    localStorage.setItem("servora_theme", themeMode);
    if (themeMode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [themeMode]);

  async function fetchAdminStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Admin privileges required.");
      setData(resData);
      if (resData.categories && resData.categories.length > 0) {
        setNewServiceCategory(resData.categories[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminAction(action: string, targetId: string, payload?: any) {
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId, payload }),
      });
      if (res.ok) {
        fetchAdminStats();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to execute admin action.");
      }
    } catch (e) {
      alert("Network error executing admin action.");
    }
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault();
    if (!newServiceName || !newServiceCategory) return;
    await handleAdminAction("CREATE_SERVICE", "", {
      name: newServiceName,
      categoryId: newServiceCategory,
      description: newServiceDesc,
    });
    setNewServiceName("");
    setNewServiceDesc("");
    setIsAddServiceOpen(false);
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto py-20 text-center text-stone-500 font-bold">Loading Enterprise Master Admin Portal...</div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Admin Access Required</h2>
        <p className="text-stone-500 text-sm mb-4">{error || "Please log in with admin privileges."}</p>
        <Link href="/login" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
          Log In as Admin
        </Link>
      </div>
    );
  }

  const {
    stats,
    storageStats = {
      cloudinaryUsedMB: 0,
      cloudinaryMaxMB: 25600,
      cloudinaryPercent: 0,
      scalewayUsedMB: 0,
      scalewayMaxMB: 76800,
      scalewayPercent: 0,
      totalStorageUsedMB: 0,
      totalStorageLimitGB: 100,
      totalProductImages: 0,
      totalPortfolioImages: 0,
      totalVerificationDocs: 0,
    },
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
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.phone.includes(searchFilter) ||
      (u.email && u.email.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const filteredProviders = providers.filter(
    (p: any) =>
      p.businessName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.serviceArea.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.user?.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredProducts = products.filter(
    (prod: any) =>
      prod.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      prod.provider?.businessName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: Rocket, count: null, group: "PEOPLE & BUSINESSES" },
    { id: "members", label: "Members Directory", icon: Users, count: users.length, group: "PEOPLE & BUSINESSES" },
    { id: "businesses", label: "Business Profiles", icon: Building2, count: providers.length, group: "PEOPLE & BUSINESSES" },
    { id: "verification", label: "ID Verification", icon: ShieldCheck, count: stats.pendingVerifications, group: "PEOPLE & BUSINESSES" },
    { id: "products", label: "Product Catalog", icon: ShoppingBag, count: products.length, group: "MARKETPLACE & SERVICES" },
    { id: "services", label: "Services Catalog", icon: Wrench, count: categories.length, group: "MARKETPLACE & SERVICES" },
    { id: "requests", label: "Customer Requests", icon: MessageSquare, count: serviceRequests.length, group: "MARKETPLACE & SERVICES" },
    { id: "disputes", label: "Disputes & Helpdesk Hub ⚖️", icon: Scale, count: "Live", group: "MARKETPLACE & SERVICES" },
    { id: "storage", label: "Cloud Storage (100 GB)", icon: HardDrive, count: `${storageStats.totalStorageUsedMB} MB`, group: "INFRASTRUCTURE" },
    { id: "flags", label: "Monetization Flags", icon: DollarSign, count: featureFlags.length, group: "INFRASTRUCTURE" },
    { id: "settings", label: "System Settings", icon: Settings, count: null, group: "INFRASTRUCTURE" },
  ];

  // Dynamic Theme Styling
  const isDark = themeMode === "dark";
  const bgMain = isDark ? "bg-stone-950 text-white" : "bg-slate-50 text-slate-900";
  const bgHeader = isDark ? "bg-stone-900 border-stone-800" : "bg-white border-slate-200 shadow-sm text-slate-900";
  const bgSidebar = isDark ? "bg-stone-900/90 border-stone-800" : "bg-white border-slate-200";
  const bgCard = isDark ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-900";
  const bgCardSecondary = isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-slate-100 border-slate-200 text-slate-900";
  const textSubtle = isDark ? "text-stone-400" : "text-slate-500";
  const borderSubtle = isDark ? "border-stone-800" : "border-slate-200";

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Header Bar */}
      <header className={`h-14 ${bgHeader} border-b px-4 flex items-center justify-between shrink-0 sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 lg:hidden ${isDark ? "text-stone-300 bg-stone-800" : "text-slate-700 bg-slate-100"} rounded-xl`}
            aria-label="Toggle Mobile Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className={`font-black text-sm block leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>Servora Admin IDE</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">Master Control Center</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Quick Switcher */}
          <button
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              isDark
                ? "bg-amber-950/80 border-amber-700/60 text-amber-300 hover:bg-amber-900"
                : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            }`}
            title="Toggle Light / Dark Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import Artisans</span>
          </button>
          <button
            onClick={fetchAdminStats}
            className={`p-1.5 ${isDark ? "bg-stone-800 text-stone-300 hover:bg-stone-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"} rounded-xl transition`}
            title="Refresh Admin Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE HORIZONTAL NAVIGATION SCROLL PILLS */}
      <div className={`lg:hidden ${bgSidebar} border-b px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as any);
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
                active
                  ? "bg-emerald-600 text-white shadow"
                  : isDark
                  ? "bg-stone-800 text-stone-400 hover:bg-stone-750 hover:text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== null && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${active ? "bg-emerald-700 text-white" : isDark ? "bg-stone-700 text-stone-300" : "bg-slate-200 text-slate-700"}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RESPONSIVE 3-PANEL LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* PANEL 1: LEFT NAVIGATION SIDEBAR */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block w-full lg:w-64 ${bgSidebar} border-b lg:border-b-0 lg:border-r p-4 space-y-6 shrink-0 overflow-y-auto`}
        >
          {/* Quick Search */}
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${textSubtle} block mb-2`}>EXPLORER & FILTER</span>
            <div className={`flex items-center gap-2 ${bgCardSecondary} border p-2 rounded-xl`}>
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-transparent text-xs outline-none w-full"
              />
            </div>
          </div>

          {/* Nav Groups */}
          {["PEOPLE & BUSINESSES", "MARKETPLACE & SERVICES", "INFRASTRUCTURE"].map((groupName) => (
            <div key={groupName} className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-wider block px-2 mb-1 ${
                groupName === "PEOPLE & BUSINESSES" ? "text-emerald-500" : groupName === "MARKETPLACE & SERVICES" ? "text-amber-500" : "text-cyan-500"
              }`}>
                {groupName}
              </span>
              {navItems.filter((i) => i.group === groupName).map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      active
                        ? "bg-emerald-600 text-white font-bold shadow"
                        : isDark
                        ? "text-stone-400 hover:bg-stone-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? "bg-emerald-700 text-white" : isDark ? "bg-stone-800 text-stone-400" : "bg-slate-200 text-slate-700"}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* PANEL 2: MIDDLE MAIN WORKSPACE */}
        <main className={`flex-1 ${bgMain} p-4 sm:p-6 overflow-y-auto space-y-6 w-full min-w-0`}>
          {/* VIEW: OVERVIEW */}
          {activeView === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`bg-gradient-to-br ${isDark ? "from-emerald-950 via-stone-900 to-stone-900 border-emerald-500/50 text-white" : "from-emerald-500 via-emerald-600 to-teal-700 text-white border-emerald-400"} border p-6 rounded-3xl shadow-md`}>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">North Star Metric</span>
                  <span className="text-3xl font-black block my-1">{stats.northStarWeeklyConnections}</span>
                  <span className="text-xs text-emerald-100 font-semibold">Weekly Successful Connections</span>
                </div>

                <div className={`${bgCard} border p-6 rounded-3xl shadow-sm`}>
                  <span className={`text-[10px] font-bold ${textSubtle} uppercase tracking-widest block`}>Registered Businesses</span>
                  <span className="text-3xl font-black block my-1">{stats.totalProviders}</span>
                  <span className={`text-xs ${textSubtle}`}>{stats.verifiedProviders} Verified &bull; {stats.pendingVerifications} Pending</span>
                </div>
              </div>

              <LaunchModeWidget />
            </div>
          )}

          {/* VIEW: SYSTEM SETTINGS */}
          {activeView === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <div className={`flex items-center justify-between border-b pb-4 ${borderSubtle}`}>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-500" /> Platform & Portal Master Settings
                  </h2>
                  <p className={`text-xs ${textSubtle}`}>Configure core marketplace operations, media limits, security, and UI preferences.</p>
                </div>

                {settingsSavedMessage && (
                  <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                    <Check className="w-4 h-4" /> Settings Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* THEME SELECTOR */}
                <div className={`${bgCard} border p-6 rounded-3xl space-y-4`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-amber-500">
                    <Sun className="w-4 h-4" /> Appearance & Theme Mode
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setThemeMode("dark")}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        themeMode === "dark"
                          ? "bg-stone-900 border-emerald-500 ring-2 ring-emerald-500/20 text-white"
                          : "bg-stone-800/40 border-stone-700 text-stone-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-stone-950 flex items-center justify-center">
                          <Moon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-white">Dark Mode</span>
                          <span className="text-[10px] text-stone-400">Default dark theme</span>
                        </div>
                      </div>
                      {themeMode === "dark" && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setThemeMode("light")}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        themeMode === "light"
                          ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm"
                          : "bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Sun className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-slate-900">Light Mode</span>
                          <span className="text-[10px] text-slate-500">Clean bright theme</span>
                        </div>
                      </div>
                      {themeMode === "light" && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                </div>

                {/* PLATFORM BRANDING */}
                <div className={`${bgCard} border p-6 rounded-3xl space-y-4`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-500">
                    <Globe className="w-4 h-4" /> Marketplace Operations & Regional Defaults
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-bold ${textSubtle} block mb-1.5`}>Platform Name</label>
                      <input
                        type="text"
                        value={platformSettings.platformName}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                        className={`w-full p-3 ${bgCardSecondary} border ${borderSubtle} rounded-xl text-xs outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${textSubtle} block mb-1.5`}>City & Target Region</label>
                      <input
                        type="text"
                        value={platformSettings.cityRegion}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, cityRegion: e.target.value })}
                        className={`w-full p-3 ${bgCardSecondary} border ${borderSubtle} rounded-xl text-xs outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${textSubtle} block mb-1.5`}>Default Currency Symbol</label>
                      <input
                        type="text"
                        value={platformSettings.currencySymbol}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, currencySymbol: e.target.value })}
                        className={`w-full p-3 ${bgCardSecondary} border ${borderSubtle} rounded-xl text-xs outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${textSubtle} block mb-1.5`}>Service Commission Rate (%)</label>
                      <input
                        type="number"
                        value={platformSettings.commissionRatePercent}
                        onChange={(e) => setPlatformSettings({ ...platformSettings, commissionRatePercent: Number(e.target.value) })}
                        className={`w-full p-3 ${bgCardSecondary} border ${borderSubtle} rounded-xl text-xs outline-none`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" /> Save System Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MEMBERS DIRECTORY */}
          {activeView === "members" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Platform Members Directory</h2>
              <div className={`${bgCard} border rounded-3xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`${bgCardSecondary} ${textSubtle} uppercase tracking-wider text-[10px] font-bold border-b ${borderSubtle}`}>
                      <tr>
                        <th className="p-3 sm:p-4">Member Name</th>
                        <th className="p-3 sm:p-4">Phone</th>
                        <th className="p-3 sm:p-4">Role</th>
                        <th className="p-3 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderSubtle}`}>
                      {filteredUsers.map((u: any) => (
                        <tr key={u.id} className={isDark ? "hover:bg-stone-800/30" : "hover:bg-slate-100/50"}>
                          <td className="p-3 sm:p-4 font-bold text-xs sm:text-sm">
                            {u.name}
                            <span className={`block text-[10px] ${textSubtle} font-normal`}>{u.email || "No email"}</span>
                          </td>
                          <td className="p-3 sm:p-4 font-medium">{u.phone}</td>
                          <td className="p-3 sm:p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === "ADMIN" ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-right space-x-2">
                            <button onClick={() => handleAdminAction("TOGGLE_USER_ROLE", u.id)} className={`px-2.5 py-1 ${isDark ? "bg-stone-800 text-stone-200" : "bg-slate-200 text-slate-800"} text-[11px] font-semibold rounded-xl`}>
                              Toggle Role
                            </button>
                            <button onClick={() => confirm(`Delete user "${u.name}"?`) && handleAdminAction("DELETE_USER", u.id)} className="p-1.5 bg-red-950/80 text-red-400 rounded-xl">
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* BUSINESSES DIRECTORY */}
          {activeView === "businesses" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Business Profiles & Artisans</h2>
              <div className={`${bgCard} border rounded-3xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className={`${bgCardSecondary} ${textSubtle} uppercase tracking-wider text-[10px] font-bold border-b ${borderSubtle}`}>
                      <tr>
                        <th className="p-3 sm:p-4">Business & Owner</th>
                        <th className="p-3 sm:p-4">Area</th>
                        <th className="p-3 sm:p-4">Verification</th>
                        <th className="p-3 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderSubtle}`}>
                      {filteredProviders.map((prov: any) => (
                        <tr key={prov.id} className={isDark ? "hover:bg-stone-800/30" : "hover:bg-slate-100/50"}>
                          <td className="p-3 sm:p-4">
                            <div className="font-bold text-xs sm:text-sm">{prov.businessName}</div>
                            <div className={`text-[10px] ${textSubtle}`}>Owner: {prov.user?.name}</div>
                          </td>
                          <td className="p-3 sm:p-4">{prov.serviceArea}</td>
                          <td className="p-3 sm:p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {prov.verificationStatus}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-right space-x-2">
                            <button onClick={() => handleAdminAction("TOGGLE_VERIFICATION", prov.id)} className={`px-2.5 py-1 ${isDark ? "bg-stone-800 text-emerald-400" : "bg-slate-200 text-emerald-700"} text-[11px] font-semibold rounded-xl`}>
                              Verify
                            </button>
                            <button onClick={() => confirm(`Delete business "${prov.businessName}"?`) && handleAdminAction("DELETE_PROVIDER", prov.id)} className="p-1.5 bg-red-950/80 text-red-400 rounded-xl">
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* PRODUCTS CATALOG */}
          {activeView === "products" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Product Catalog Moderation</h2>
              <div className={`${bgCard} border rounded-3xl overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className={`${bgCardSecondary} ${textSubtle} uppercase tracking-wider text-[10px] font-bold border-b ${borderSubtle}`}>
                      <tr>
                        <th className="p-3 sm:p-4">Product Title</th>
                        <th className="p-3 sm:p-4">Merchant</th>
                        <th className="p-3 sm:p-4">Price</th>
                        <th className="p-3 sm:p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderSubtle}`}>
                      {filteredProducts.map((prod: any) => (
                        <tr key={prod.id} className={isDark ? "hover:bg-stone-800/30" : "hover:bg-slate-100/50"}>
                          <td className="p-3 sm:p-4 font-bold text-xs sm:text-sm">{prod.title}</td>
                          <td className="p-3 sm:p-4 font-medium">{prod.provider?.businessName}</td>
                          <td className="p-3 sm:p-4 font-black text-emerald-600 dark:text-emerald-400">{formatGHS(prod.price)}</td>
                          <td className="p-3 sm:p-4 text-right space-x-2">
                            <button onClick={() => handleAdminAction("TOGGLE_PRODUCT_AVAILABILITY", prod.id)} className={`px-2.5 py-1 ${isDark ? "bg-stone-800 text-stone-200" : "bg-slate-200 text-slate-800"} text-[11px] font-semibold rounded-xl`}>
                              Toggle Status
                            </button>
                            <button onClick={() => confirm(`Delete product "${prod.title}"?`) && handleAdminAction("DELETE_PRODUCT", prod.id)} className="p-1.5 bg-red-950/80 text-red-400 rounded-xl">
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* SERVICES CATALOG */}
          {activeView === "services" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Services Catalog</h2>
                <button onClick={() => setIsAddServiceOpen(true)} className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat: any) => (
                  <div key={cat.id} className={`${bgCard} border rounded-3xl p-6 space-y-3`}>
                    <h3 className="font-bold text-base">{cat.name}</h3>
                    <div className="space-y-2">
                      {cat.services?.map((serv: any) => (
                        <div key={serv.id} className={`p-3 ${bgCardSecondary} rounded-2xl border ${borderSubtle} flex justify-between text-xs`}>
                          <span>{serv.name}</span>
                          <button onClick={() => handleAdminAction("DELETE_SERVICE", serv.id)} className="text-stone-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLOUD STORAGE */}
          {activeView === "storage" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-cyan-400" /> Multi-Cloud Storage Infrastructure (100 GB Free)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${bgCard} border rounded-3xl p-6 space-y-4`}>
                  <h4 className="font-bold text-sm">Cloudinary CDN (Auto-WebP)</h4>
                  <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(storageStats.cloudinaryPercent, 1)}%` }}></div>
                  </div>
                  <span className={`text-xs ${textSubtle}`}>{storageStats.cloudinaryUsedMB} MB / 25,600 MB</span>
                </div>

                <div className={`${bgCard} border rounded-3xl p-6 space-y-4`}>
                  <h4 className="font-bold text-sm">Scaleway Object Storage</h4>
                  <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(storageStats.scalewayPercent, 1)}%` }}></div>
                  </div>
                  <span className={`text-xs ${textSubtle}`}>{storageStats.scalewayUsedMB} MB / 76,800 MB</span>
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION QUEUE */}
          {activeView === "verification" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Ghana Card Verification Queue</h2>
              <div className={`${bgCard} border rounded-3xl p-6 space-y-3`}>
                {providers.filter((p: any) => p.verificationStatus === "PENDING" || p.verificationStatus === "UNVERIFIED").map((p: any) => (
                  <div key={p.id} className={`p-4 ${bgCardSecondary} rounded-2xl border ${borderSubtle} flex items-center justify-between`}>
                    <div>
                      <h4 className="font-bold text-sm">{p.businessName}</h4>
                      <p className={`text-xs ${textSubtle}`}>Owner: {p.user?.name} ({p.user?.phone})</p>
                    </div>
                    <button onClick={() => handleAdminAction("TOGGLE_VERIFICATION", p.id)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                      Approve Badge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MONETIZATION FLAGS */}
          {activeView === "flags" && (
            <div className={`${bgCard} border rounded-3xl p-6 space-y-4`}>
              <h2 className="text-xl font-bold">Monetization Engine Flags</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag: any) => (
                  <div key={flag.id} className={`p-4 ${bgCardSecondary} rounded-2xl border ${borderSubtle} flex items-center justify-between`}>
                    <div>
                      <span className="font-bold text-xs block">{flag.name}</span>
                      <span className={`text-[11px] ${textSubtle}`}>{flag.description}</span>
                    </div>
                    <button onClick={() => handleAdminAction("TOGGLE_FEATURE_FLAG", flag.id)} className={`text-[10px] font-bold px-3 py-1 rounded-full ${flag.isEnabled ? "bg-emerald-600 text-white" : "bg-stone-800 text-stone-400"}`}>
                      {flag.isEnabled ? "ACTIVE" : "OFF"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REQUESTS */}
          {activeView === "requests" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Customer Job Requests</h2>
              <div className={`${bgCard} border rounded-3xl overflow-hidden`}>
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className={`${bgCardSecondary} ${textSubtle} uppercase text-[10px] font-bold border-b ${borderSubtle}`}>
                    <tr>
                      <th className="p-4">Title & Customer</th>
                      <th className="p-4">Service</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderSubtle}`}>
                    {serviceRequests.map((req: any) => (
                      <tr key={req.id}>
                        <td className="p-4 font-bold">{req.title}</td>
                        <td className="p-4">{req.service?.name}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleAdminAction("DELETE_SERVICE_REQUEST", req.id)} className="p-1.5 bg-red-950/80 text-red-400 rounded-xl">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "disputes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Platform Master Helpdesk & 3-Way Dispute Resolution Hub</h2>
                  <p className="text-xs text-stone-400">
                    Oversee customer support tickets, B2Admin operations, courier chats, and 3-way dispute mediation rooms.
                  </p>
                </div>
              </div>
              <UnifiedMessagingHub
                currentUserId="admin-master"
                currentUserRole="ADMIN"
              />
            </div>
          )}
        </main>

        {/* PANEL 3: RIGHT INSPECTOR & QUICK METRICS FEED */}
        <aside className={`w-full lg:w-80 ${bgSidebar} border-t lg:border-t-0 lg:border-l p-4 space-y-6 shrink-0 overflow-y-auto`}>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${textSubtle} block mb-2`}>LIVE INSPECTOR FEED</span>
            <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-900 border border-emerald-500/40 p-4 rounded-2xl space-y-1 text-white shadow-sm">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Weekly Connections</span>
              <span className="text-2xl font-black block">{stats.northStarWeeklyConnections}</span>
              <span className="text-[11px] text-emerald-300">Accepted Quotes + Jobs</span>
            </div>
          </div>

          {/* Quick Storage Meter */}
          <div className={`${bgCardSecondary} border ${borderSubtle} p-4 rounded-2xl space-y-2 text-xs`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">Cloud Storage Allowance</span>
              <span className="text-cyan-500 font-bold">100 GB Free</span>
            </div>
            <div className="w-full h-2 bg-stone-700/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${Math.max((storageStats.totalStorageUsedMB / (100 * 1024)) * 100, 2)}%` }}
              ></div>
            </div>
            <span className={`text-[10px] ${textSubtle} block`}>{storageStats.totalStorageUsedMB} MB used of 102,400 MB</span>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-2 text-xs">
            <span className={`text-[10px] font-black uppercase tracking-wider ${textSubtle} block`}>PLATFORM SUMMARY</span>
            <div className={`${bgCardSecondary} border ${borderSubtle} p-3 rounded-xl flex justify-between`}>
              <span className={textSubtle}>Total Members</span>
              <span className="font-bold">{stats.totalUsers}</span>
            </div>
            <div className={`${bgCardSecondary} border ${borderSubtle} p-3 rounded-xl flex justify-between`}>
              <span className={textSubtle}>Businesses</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.totalProviders} ({stats.verifiedProviders} Verified)</span>
            </div>
            <div className={`${bgCardSecondary} border ${borderSubtle} p-3 rounded-xl flex justify-between`}>
              <span className={textSubtle}>Products Catalog</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{products.length} Items</span>
            </div>
            <div className={`${bgCardSecondary} border ${borderSubtle} p-3 rounded-xl flex justify-between`}>
              <span className={textSubtle}>Pending Verification</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{stats.pendingVerifications} Requests</span>
            </div>
          </div>
        </aside>
      </div>

      <CsvImporterModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={fetchAdminStats}
      />
    </div>
  );
}
