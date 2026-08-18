"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent state or global listener if needed
        }
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
    { id: "overview", label: "Dashboard Overview & KPIs", icon: Rocket, category: "Core Operations" },
    { id: "crm", label: "Customer CRM & 360 Profiles", icon: Users, category: "User & Trust" },
    { id: "businesses", label: "Business Profiles & Verified Artisans", icon: Building2, category: "User & Trust" },
    { id: "verification", label: "ID & Ghana Card Verification Queue", icon: ShieldCheck, category: "User & Trust" },
    { id: "products", label: "Product Moderation Queue (Guest & Merchant)", icon: ShoppingBag, category: "Marketplace" },
    { id: "requests", label: "Customer Requests & Dispatch Gigs", icon: MessageSquare, category: "Marketplace" },
    { id: "disputes", label: "Disputes & Helpdesk Hub", icon: Scale, category: "Marketplace" },
    { id: "tickers", label: "Announcement Tickers Manager", icon: Megaphone, category: "Ecosystem" },
    { id: "storage", label: "Cloud Storage & Backups (100GB)", icon: HardDrive, category: "Infrastructure" },
    { id: "flags", label: "Monetization & Commission Flags", icon: DollarSign, category: "Infrastructure" },
    { id: "settings", label: "System Settings & API Keys", icon: Settings, category: "Infrastructure" },
  ];

  const filteredOptions = allNavOptions.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search view (e.g. CRM, Verification, Products)..."
            className="w-full bg-transparent text-sm outline-none placeholder-slate-400 dark:placeholder-zinc-500 font-medium"
          />
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredOptions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 font-medium">
              No matching admin command or view found.
            </div>
          ) : (
            filteredOptions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Icon className="w-4 h-4" />
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
            })
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
