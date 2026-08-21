"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Users,
  Building2,
  ShieldCheck,
  ShoppingBag,
  Scale,
  Settings,
  Rocket,
  Megaphone,
  HardDrive,
  DollarSign,
  MessageSquare,
  Wrench,
  ChevronRight,
  X,
  Command,
  Activity,
  Zap,
  Mail,
} from "lucide-react";

interface AdminCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (viewId: string) => void;
}

export function AdminCommandPaletteModal({
  isOpen,
  onClose,
  onSelectView,
}: AdminCommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [dbResults, setDbResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setDbResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setDbResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok && data.results) {
          setDbResults(data.results);
        }
      } catch {
        console.warn("Command palette search error.");
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allNavOptions = [
    {
      id: "overview",
      label: "Dashboard Overview & KPIs",
      icon: Rocket,
      category: "Core Operations",
      keywords: ["home", "dashboard", "kpi", "stats", "overview", "north star", "metrics"],
    },
    {
      id: "activity",
      label: "Live Operational Activity Feed",
      icon: Activity,
      category: "Core Operations",
      keywords: ["activity", "feed", "logs", "audit", "history", "real time", "events", "actions"],
    },
    {
      id: "crm",
      label: "Customer CRM & 360 Profiles",
      icon: Users,
      category: "User & Trust",
      keywords: ["customers", "members", "users", "crm", "people", "profiles", "risk", "ledger", "notes", "wallet", "alhassan", "kwame", "fatima"],
    },
    {
      id: "businesses",
      label: "Business Profiles & Verified Artisans",
      icon: Building2,
      category: "User & Trust",
      keywords: ["artisans", "providers", "businesses", "merchants", "vendors", "contractors", "electricians", "plumbers", "fugu", "tailors", "salifu", "kwame", "fatima"],
    },
    {
      id: "verification",
      label: "ID & Ghana Card Verification Queue",
      icon: ShieldCheck,
      category: "User & Trust",
      keywords: ["verification", "id", "ghana card", "national id", "queue", "review", "documents", "identity", "approvals"],
    },
    {
      id: "products",
      label: "Product Moderation Queue (Guest & Merchant)",
      icon: ShoppingBag,
      category: "Marketplace",
      keywords: ["products", "listings", "classifieds", "moderation", "items", "marketplace", "dewalt", "drill", "fugu", "smock", "guest"],
    },
    {
      id: "requests",
      label: "Customer Requests & Dispatch Gigs",
      icon: MessageSquare,
      category: "Marketplace",
      keywords: ["requests", "gigs", "service calls", "dispatch", "solar", "wiring", "plumbing", "jobs", "quotes"],
    },
    {
      id: "rentals",
      label: "Tool Rentals Engine",
      icon: Wrench,
      category: "Marketplace",
      keywords: ["rentals", "tools", "equipment", "power tools", "generators", "mixers", "scaffolding", "ladders", "heavy duty"],
    },
    {
      id: "disputes",
      label: "Disputes & Helpdesk Hub",
      icon: Scale,
      category: "Marketplace",
      keywords: ["disputes", "helpdesk", "support", "tickets", "escrow", "holds", "refunds", "complaints", "claims"],
    },
    {
      id: "community",
      label: "Community Board Moderation",
      icon: Users,
      category: "Ecosystem",
      keywords: ["community", "board", "trade board", "notices", "alerts", "meetups", "neighborhood", "tamale", "sakasaka", "choggu", "nyohini"],
    },
    {
      id: "tickers",
      label: "Announcement Tickers Manager",
      icon: Megaphone,
      category: "Ecosystem",
      keywords: ["tickers", "announcements", "banners", "top bar", "promos", "alerts", "ticker manager"],
    },
    {
      id: "storage",
      label: "Cloud Storage & Backups (100GB)",
      icon: HardDrive,
      category: "Infrastructure",
      keywords: ["storage", "cloud", "cloudflare", "scaleway", "r2", "backups", "media", "capacity", "images"],
    },
    {
      id: "email",
      label: "Transactional Email Subsystem & Audit Logs",
      icon: Mail,
      category: "Infrastructure",
      keywords: ["email", "mail", "resend", "brevo", "smtp", "templates", "logs", "otp", "notifications", "transactional"],
    },
    {
      id: "flags",
      label: "Monetization & Commission Flags",
      icon: DollarSign,
      category: "Infrastructure",
      keywords: ["flags", "monetization", "commission", "feature flags", "toggles", "fees", "whatsapp dispatch", "escrow"],
    },
    {
      id: "settings",
      label: "System Settings & API Keys",
      icon: Settings,
      category: "Infrastructure",
      keywords: ["settings", "config", "master settings", "api keys", "platform name", "support phone", "email"],
    },
  ];

  const searchTerms = query.toLowerCase().trim();
  const filteredOptions = allNavOptions.filter(
    (item) =>
      !searchTerms ||
      item.label.toLowerCase().includes(searchTerms) ||
      item.category.toLowerCase().includes(searchTerms) ||
      item.id.toLowerCase().includes(searchTerms) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchTerms))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search view (e.g. CRM, Artisans, Verification, Tools)..."
            className="w-full bg-transparent text-sm outline-none placeholder-slate-400 dark:placeholder-zinc-500 font-medium text-slate-900 dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Section 1: Navigation Commands */}
          {filteredOptions.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-bold px-2 block">
                ADMIN SYSTEM COMMANDS & VIEWS
              </span>
              {filteredOptions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-zinc-100 block text-xs">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-emerald-500 transition" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Section 2: Live Database Products & Listings */}
          {dbResults?.products && dbResults.products.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-bold px-2 block">
                MATCHING PRODUCTS & CLASSIFIED LISTINGS 📦
              </span>
              {dbResults.products.slice(0, 5).map((prod: any) => (
                <a
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs line-clamp-1">
                        {prod.title}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        GH₵ {prod.price} • {prod.provider?.businessName || "Verified Seller"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                </a>
              ))}
            </div>
          )}

          {/* Section 3: Live Database Business Profiles & Artisans */}
          {dbResults?.providers && dbResults.providers.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-bold px-2 block">
                MATCHING BUSINESS PROFILES & ARTISANS 🏬
              </span>
              {dbResults.providers.slice(0, 5).map((prov: any) => (
                <a
                  key={prov.id}
                  href={`/biz/${prov.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onClose}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        {prov.businessName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        📍 {prov.serviceArea || "Tamale"} • {prov.verificationStatus}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                </a>
              ))}
            </div>
          )}

          {filteredOptions.length === 0 && (!dbResults || (!dbResults.products?.length && !dbResults.providers?.length)) && (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 font-medium space-y-2">
              <p>No matching admin command, view, or product found for "{query}".</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Try searching for "CRM", "Artisans", "ID Verification", "Tools", or item names like "Generator".
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
          <span>Servora Enterprise Admin Command Palette</span>
          <span>Use ⌘K / Ctrl+K to trigger anytime</span>
        </div>
      </div>
    </div>
  );
}
