"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  Rocket,
  Users,
  Building2,
  ShieldCheck,
  ShoppingBag,
  MessageSquare,
  Scale,
  Megaphone,
  HardDrive,
  DollarSign,
  Settings,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
  Command,
  Activity,
} from "lucide-react";
import { AdminCommandPaletteModal } from "@/components/AdminCommandPaletteModal";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  activeView: string;
  onSelectView: (viewId: string) => void;
  pendingVerificationsCount?: number;
  pendingProductsCount?: number;
  unresolvedDisputesCount?: number;
  themeMode?: "dark" | "light";
  onToggleTheme?: () => void;
}

export function AdminLayoutShell({
  children,
  activeView,
  onSelectView,
  pendingVerificationsCount = 1,
  pendingProductsCount = 6,
  unresolvedDisputesCount = 0,
  themeMode = "light",
  onToggleTheme,
}: AdminLayoutShellProps) {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Sidebar Grouped Sections
  const navGroups = [
    {
      groupTitle: "OVERVIEW",
      items: [
        { id: "overview", label: "Dashboard Overview", icon: Rocket, count: null },
        { id: "activity", label: "Live Activity Feed", icon: Activity, count: null },
      ],
    },
    {
      groupTitle: "USER & TRUST MANAGEMENT",
      items: [
        { id: "crm", label: "Customer CRM & Members", icon: Users, count: "360°" },
        { id: "businesses", label: "Business Profiles & Artisans", icon: Building2, count: null },
        { id: "verification", label: "ID & Verification Queue", icon: ShieldCheck, count: pendingVerificationsCount > 0 ? pendingVerificationsCount : null },
      ],
    },
    {
      groupTitle: "MARKETPLACE & SERVICES",
      items: [
        { id: "products", label: "Product Moderation", icon: ShoppingBag, count: pendingProductsCount > 0 ? pendingProductsCount : null },
        { id: "requests", label: "Service Requests & Gigs", icon: MessageSquare, count: null },
        { id: "rentals", label: "Tool Rentals Engine", icon: Wrench, count: null },
        { id: "disputes", label: "Disputes & Helpdesk", icon: Scale, count: unresolvedDisputesCount > 0 ? unresolvedDisputesCount : null },
      ],
    },
    {
      groupTitle: "ECOSYSTEM & COMMUNITY",
      items: [
        { id: "community", label: "Community Board Moderation", icon: Users, count: null },
        { id: "tickers", label: "Announcement Tickers", icon: Megaphone, count: "Live" },
      ],
    },
    {
      groupTitle: "SYSTEM & INFRASTRUCTURE",
      items: [
        { id: "storage", label: "Cloud Storage & Backups", icon: HardDrive, count: "100GB" },
        { id: "flags", label: "Monetization & Commission Flags", icon: DollarSign, count: null },
        { id: "settings", label: "System Settings", icon: Settings, count: null },
      ],
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans antialiased flex flex-col transition-colors duration-200 relative">
      {/* ------------------------------------------------------------- */}
      {/* UNIFIED ADMIN TOPBAR */}
      {/* ------------------------------------------------------------- */}
      <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Brand Badge & Env Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl md:hidden cursor-pointer"
            aria-label="Toggle Mobile Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                Servora Admin
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {process.env.NODE_ENV === "production" ? "Production" : "Local"}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Command Palette Trigger Button */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsCmdOpen(true)}
            className="w-full px-3.5 py-2 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-400 dark:text-zinc-400 text-xs font-medium flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search command palette or jump to view...</span>
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 text-slate-500 border border-slate-200 dark:border-zinc-700">
              <Command className="w-3 h-3" /> K
            </span>
          </button>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition md:hidden cursor-pointer"
            title="Search Commands"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingVerificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-3 z-50 text-xs space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-zinc-800 pb-2">
                  Operational Alerts
                </span>
                <button
                  onClick={() => {
                    onSelectView("verification");
                    setNotifDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between"
                >
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Pending ID Verifications</span>
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full font-bold">
                    {pendingVerificationsCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    onSelectView("products");
                    setNotifDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between"
                >
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">Pending Product Listings</span>
                  <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 rounded-full font-bold">
                    {pendingProductsCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Admin Avatar & Menu */}
          <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                {session?.name ? session.name[0] : "A"}
              </div>
              <span className="hidden sm:inline font-bold text-xs text-slate-800 dark:text-zinc-200">
                {session?.name || "Master Admin"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="font-extrabold text-slate-900 dark:text-white block">
                    {session?.name || "Master Admin"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    {session?.email || "admin@servora.gh"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE DRAWER BACKDROP */}
      {/* ------------------------------------------------------------- */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`w-72 md:w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 fixed md:static inset-y-0 left-0 z-50 md:z-20 transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Header inside mobile drawer */}
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="font-black text-sm text-slate-900 dark:text-white">Servora Admin</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto flex-1 text-xs">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 dark:text-zinc-500 px-3 uppercase block">
                  {group.groupTitle}
                </span>

                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectView(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl font-bold flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`} />
                          <span className="truncate text-xs">{item.label}</span>
                        </div>

                        {item.count !== null && item.count !== undefined && (
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                              isActive
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Metadata */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-[11px] text-slate-500 dark:text-zinc-500 space-y-1">
            <div className="flex items-center justify-between font-mono font-bold">
              <span>Region:</span>
              <span className="text-slate-800 dark:text-zinc-300">Northern Ghana</span>
            </div>
            <div className="flex items-center justify-between font-mono font-bold">
              <span>PWA Engine:</span>
              <span className="text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Command Palette Search Dialog Modal */}
      <AdminCommandPaletteModal
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectView={(v) => {
          onSelectView(v);
          setIsCmdOpen(false);
        }}
      />
    </div>
  );
}
