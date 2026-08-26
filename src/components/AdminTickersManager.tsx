"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Briefcase,
  Building2,
  Wrench,
  PhoneCall,
  ShoppingBag,
  Tag,
  ArrowUpRight,
  Sliders,
  AlertCircle,
  X,
  Save,
} from "lucide-react";
import { TopAnnouncementBar } from "@/components/TopAnnouncementBar";
import { TickerItem } from "@/lib/tickersTypes";

interface AdminTickersManagerProps {
  isDark?: boolean;
}

export function AdminTickersManager({ isDark = false }: AdminTickersManagerProps) {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    tag: "JOB_SEEKER",
    badgeText: "",
    badgeColor: "emerald",
    ctaLabel: "",
    ctaUrl: "",
    isActive: true,
    displayOrder: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickers();
  }, []);

  async function fetchTickers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/tickers");
      const data = await res.json();
      if (res.ok && data.tickers) {
        setTickers(data.tickers);
      } else {
        throw new Error(data.error || "Failed to fetch tickers");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreateModal() {
    setEditingItem(null);
    setFormData({
      text: "",
      tag: "JOB_SEEKER",
      badgeText: "JOB SEEKER",
      badgeColor: "emerald",
      ctaLabel: "Find Jobs",
      ctaUrl: "/requests",
      isActive: true,
      displayOrder: tickers.length + 1,
    });
    setIsModalOpen(true);
  }

  function handleOpenEditModal(item: TickerItem) {
    setEditingItem(item);
    setFormData({
      text: item.text,
      tag: item.tag,
      badgeText: item.badgeText || "",
      badgeColor: item.badgeColor || "emerald",
      ctaLabel: item.ctaLabel || "",
      ctaUrl: item.ctaUrl || "",
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setIsModalOpen(true);
  }

  async function handleToggleActive(id: string) {
    try {
      const res = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE", id }),
      });
      if (res.ok) {
        toast.info("Ticker Toggled 📢", "Announcement state updated.");
        fetchTickers();
      } else {
        const data = await res.json();
        toast.error("Toggle Failed", data.error || "Failed to toggle ticker active state.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to toggle ticker.");
    }
  }

  async function handleDeleteTicker(id: string, text: string) {
    if (!confirm(`Are you sure you want to delete this announcement:\n\n"${text}"?`)) return;

    try {
      const res = await fetch(`/api/admin/tickers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.error("Ticker Deleted 🗑️", "Announcement removed.");
        fetchTickers();
      } else {
        const data = await res.json();
        toast.error("Delete Failed", data.error || "Failed to delete ticker.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to delete ticker.");
    }
  }

  async function handleResetDefaults() {
    if (!confirm("Reset all announcement bar tickers back to 10 default Servora promos?")) return;

    try {
      const res = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        toast.success("Tickers Reset 🔄", "Default announcement tickers restored.");
        fetchTickers();
      } else {
        const data = await res.json();
        toast.error("Reset Failed", data.error || "Failed to reset tickers.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to reset tickers.");
    }
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.warning("Validation Warning", "Please enter a valid announcement message.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: editingItem ? editingItem.id : undefined,
        ...formData,
      };

      const res = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        toast.success("Ticker Saved! 📢", "Announcement updated successfully.");
        fetchTickers();
      } else {
        const data = await res.json();
        toast.error("Save Failed", data.error || "Failed to save announcement ticker.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to save announcement ticker.");
    } finally {
      setSaving(false);
    }
  }

  // Filtered list
  const filteredTickers = tickers.filter((t) => {
    if (filterTag === "ALL") return true;
    return t.tag === filterTag;
  });

  const activeCount = tickers.filter((t) => t.isActive).length;
  const jobCount = tickers.filter((t) => t.tag === "JOB_SEEKER").length;
  const bizCount = tickers.filter((t) => t.tag === "BUSINESS_OWNER").length;
  const emergencyCount = tickers.filter((t) => t.tag === "EMERGENCY").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Live Preview Container */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center font-black shadow-md">
                <Megaphone className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Top Announcement Bar & Promo Tickers 📣
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Customize the dynamic vertical swipe-up ticker bar shown at the top of Servora.gh for job seekers, business owners, experts & promotions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTickers}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition cursor-pointer"
              title="Refresh Tickers"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl border border-stone-700 transition cursor-pointer"
            >
              Reset to 10 Defaults
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post Promo / Ticker</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Preview Box */}
        <div className="mt-4 pt-2">
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2 font-mono uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Eye className="w-3.5 h-3.5" /> LIVE HEADER TICKER PREVIEW
            </span>
            <span>Hover to pause • Smooth Vertical Swipe-Up</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-emerald-500/40 shadow-inner">
            <TopAnnouncementBar initialTickers={tickers} previewMode={true} intervalMs={3500} />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Promos</span>
          <span className="text-2xl font-black text-stone-900 dark:text-white mt-1 block">{tickers.length}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
            {activeCount} Active on Live Site
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Job Seeker Promos</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{jobCount}</span>
          <span className="text-[10px] text-stone-500 mt-1 block">Targeting workers & artisans</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Business Owners</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{bizCount}</span>
          <span className="text-[10px] text-stone-500 mt-1 block">Vendor & store registration</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Emergency Hotline</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{emergencyCount}</span>
          <span className="text-[10px] text-stone-500 mt-1 block">24/7 Dispatch alerts</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "ALL", label: "All Tickers" },
          { id: "JOB_SEEKER", label: "💼 Job Seekers" },
          { id: "BUSINESS_OWNER", label: "🏢 Business Owners" },
          { id: "EXPERT_ARTISAN", label: "⚡ Expert Artisans" },
          { id: "EMERGENCY", label: "🚨 Emergency Hotline" },
          { id: "RENTAL", label: "🛠️ Tool Rentals" },
          { id: "PROMO", label: "🎁 Promotions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTag(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
              filterTag === tab.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickers List Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-stone-400 font-bold">Loading announcement tickers...</div>
        ) : filteredTickers.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl text-stone-500">
            No announcement tickers found for this category filter.
          </div>
        ) : (
          filteredTickers.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 bg-white dark:bg-stone-900 border rounded-2xl transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isActive
                  ? "border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 shadow-xs"
                  : "border-stone-200/60 dark:border-stone-800/60 opacity-60 bg-stone-50/50 dark:bg-stone-950/50"
              }`}
            >
              {/* Left Side Details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.displayOrder || idx + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge */}
                    {item.badgeText && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 border border-stone-300 dark:border-stone-700">
                        {item.badgeText}
                      </span>
                    )}

                    {/* Tag Category */}
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                      TAG: {item.tag}
                    </span>

                    {/* Active pill */}
                    <span
                      className={`px-2 py-0.2 text-[9px] font-extrabold rounded-full ${
                        item.isActive
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                          : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                      }`}
                    >
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* Message Text */}
                  <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                    "{item.text}"
                  </p>

                  {/* CTA Details if any */}
                  {item.ctaLabel && (
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> CTA: {item.ctaLabel}
                      </span>
                      {item.ctaUrl && <span className="font-mono text-[10px] truncate max-w-xs">({item.ctaUrl})</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Action Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => handleToggleActive(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1 ${
                    item.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                  }`}
                  title="Toggle Display Status"
                >
                  {item.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{item.isActive ? "Enabled" : "Disabled"}</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition cursor-pointer"
                  title="Edit Announcement"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTicker(item.id, item.text)}
                  className="p-2 bg-red-50 dark:bg-red-950/80 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl transition cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT ANNOUNCEMENT TICKER MODAL */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-5 z-10 text-stone-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold">
                  {editingItem ? "Edit Ticker Announcement" : "Create New Ticker Announcement"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Message Text */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Announcement Message Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g. Are you looking for a job? Servoragh connects skilled artisans with clients..."
                  className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs leading-relaxed"
                />
              </div>

              {/* Grid 2 Cols: Tag & Badge Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Target Audience Tag</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
                  >
                    <option value="JOB_SEEKER">💼 Job Seekers & Artisans</option>
                    <option value="BUSINESS_OWNER">🏢 Business Owners & Shops</option>
                    <option value="EXPERT_ARTISAN">⚡ Expert Artisans</option>
                    <option value="EMERGENCY">🚨 24/7 Emergency Dispatch</option>
                    <option value="RENTAL">🛠️ Tool & Heavy Rentals</option>
                    <option value="PROMO">🎁 Special Promotions</option>
                    <option value="ANNOUNCEMENT">📣 Platform Announcements</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Badge Pill Label</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. JOB SEEKER, HIRING, PROMO"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs uppercase"
                  />
                </div>
              </div>

              {/* Grid 2 Cols: Badge Color & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Badge Color Theme</label>
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
                  >
                    <option value="emerald">💚 Emerald (Green - Job / Growth)</option>
                    <option value="amber">💛 Amber (Gold - Expert / Premium)</option>
                    <option value="indigo">💙 Indigo (Blue - Business / Corporate)</option>
                    <option value="rose">❤️ Rose (Red - Emergency / Urgent)</option>
                    <option value="teal">🩵 Teal (Rentals / Tools)</option>
                    <option value="purple">💜 Purple (Promos / Offers)</option>
                    <option value="cyan">🌐 Cyan (Platform Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Display Sequence Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Grid 2 Cols: CTA Button Label & Destination URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Call To Action Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    placeholder="e.g. Find Jobs, List Business, Claim Promo"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    CTA Target URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                    placeholder="e.g. /requests, /register, /rentals"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
                  />
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="font-extrabold text-stone-800 dark:text-stone-200 cursor-pointer">
                  Enable and show on live website ticker immediately
                </label>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
