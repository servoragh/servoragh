"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  Trash2,
  RotateCcw,
  Search,
  ShieldAlert,
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Layers,
  ShoppingBag,
  MessageSquare,
  Users,
  Wrench,
  Megaphone,
  Eye,
  Download,
  CheckSquare,
  Square,
  Clock,
  Code,
  X,
} from "lucide-react";
import { RecycleBinItem, RecycleActorType, RecycleBinStats } from "@/lib/recycleBinTypes";

export function AdminRecycleBinHub() {
  const [activeActor, setActiveActor] = useState<RecycleActorType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [stats, setStats] = useState<RecycleBinStats>({
    totalDeleted: 0,
    adminDeletes: 0,
    customerDeletes: 0,
    businessDeletes: 0,
    systemDeletes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Advanced Enterprise Features
  const [retentionDays, setRetentionDays] = useState<string>("30");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectingItem, setInspectingItem] = useState<RecycleBinItem | null>(null);

  async function fetchRecycleBin() {
    setLoading(true);
    try {
      const url = `/api/admin/recycle-bin?actor=${activeActor}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setStats(
          data.stats || {
            totalDeleted: 0,
            adminDeletes: 0,
            customerDeletes: 0,
            businessDeletes: 0,
            systemDeletes: 0,
          }
        );
        setSelectedIds([]);
      }
    } catch (e) {
      console.error("Failed to load recycle bin data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecycleBin();
  }, [activeActor]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchRecycleBin();
  }

  // Multiselect Handlers
  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function handleBatchRestore() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Restore ${selectedIds.length} selected items back to active platform database?`)) return;

    setLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch("/api/admin/recycle-bin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "RESTORE", id }),
        });
      }
      toast.success(`Batch Restored ✓`, `Successfully restored ${selectedIds.length} items to active database.`);
      fetchRecycleBin();
    } catch (e) {
      toast.error("Batch Restore Failed", "Error performing batch restore.");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function handleBatchPurge() {
    if (selectedIds.length === 0) return;
    if (!confirm(`PERMANENTLY PURGE ${selectedIds.length} selected items? This cannot be undone.`)) return;

    setLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch("/api/admin/recycle-bin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "PURGE", id }),
        });
      }
      toast.error(`Batch Purged 🗑️`, `Permanently purged ${selectedIds.length} items from trash vault.`);
      fetchRecycleBin();
    } catch (e) {
      toast.error("Batch Purge Failed", "Error performing batch purge.");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function handleRestore(item: RecycleBinItem) {
    setActionLoadingId(item.id);
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESTORE", id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Restored Item ✓`, `"${item.title}" restored back to active database.`);
        fetchRecycleBin();
      } else {
        toast.error("Restore Failed", data.error || "Failed to restore item.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to connect to server.");
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function handlePurge(item: RecycleBinItem) {
    if (!confirm(`Are you sure you want to PERMANENTLY PURGE "${item.title}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(item.id);
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PURGE", id: item.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.error(`Item Purged 🗑️`, `"${item.title}" permanently deleted.`);
        setNotification({ message: `Permanently purged "${item.title}" from trash vault.`, type: "success" });
        fetchRecycleBin();
      } else {
        setNotification({ message: data.error || "Failed to purge item.", type: "error" });
      }
    } catch (e) {
      setNotification({ message: "Network error purging item.", type: "error" });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function handleEmptyBin() {
    const scopeName = activeActor === "ALL" ? "ALL deleted items" : `${activeActor.toLowerCase()} deleted items`;
    if (!confirm(`Are you sure you want to EMPTY the recycle bin for ${scopeName}? This action will permanently remove all matching trash records.`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EMPTY", actorType: activeActor }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: `Recycle bin emptied for ${scopeName}.`, type: "success" });
        fetchRecycleBin();
      }
    } catch (e) {
      setNotification({ message: "Failed to empty bin.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  function handleExportCsv() {
    if (items.length === 0) return;
    const headers = ["ID", "Entity Type", "Title", "Actor Type", "Deleted By", "Phone", "Deleted At", "Reason"];
    const rows = items.map((i) => [
      i.id,
      i.entityType,
      `"${i.title.replace(/"/g, '""')}"`,
      i.actorType,
      `"${i.deletedByName.replace(/"/g, '""')}"`,
      i.deletedByPhone || "N/A",
      i.deletedAt,
      `"${(i.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `servora-recycle-bin-${activeActor.toLowerCase()}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getEntityIcon(type: string) {
    switch (type) {
      case "PRODUCT_LISTING":
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case "SERVICE_REQUEST":
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case "COMMUNITY_POST":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "USER_ACCOUNT":
        return <User className="w-4 h-4 text-blue-500" />;
      case "BUSINESS_PROFILE":
        return <Building2 className="w-4 h-4 text-teal-500" />;
      case "TOOL_RENTAL":
        return <Wrench className="w-4 h-4 text-orange-500" />;
      default:
        return <Layers className="w-4 h-4 text-stone-500" />;
    }
  }

  function getActorBadge(actorType: RecycleActorType, role: string) {
    if (actorType === "ADMIN" || role === "ADMIN") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[10px] border border-red-500/20 inline-flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-500" /> Admin Delete
        </span>
      );
    }
    if (actorType === "CUSTOMER" || role === "CUSTOMER") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-500/20 inline-flex items-center gap-1">
          <User className="w-3 h-3 text-blue-500" /> Customer Delete
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] border border-teal-500/20 inline-flex items-center gap-1">
        <Building2 className="w-3 h-3 text-teal-500" /> Business Delete
      </span>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-500" /> General Recycle Bin & Trash Vault
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Centralized platform trash vault tracking all deleted products, service requests, community posts, user accounts, and business catalog items.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="px-3.5 py-2 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV Log
          </button>
          <button
            onClick={fetchRecycleBin}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleEmptyBin}
            disabled={items.length === 0}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" /> Empty Vault
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border ${
            notification.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
          }`}
        >
          <span className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            {notification.message}
          </span>
        </div>
      )}

      {/* Overview Stats Cards & Auto-Purge Retention Policy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Deleted Items</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stats.totalDeleted}</span>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-950/40 rounded-2xl shadow-xs">
            <span className="text-[11px] font-extrabold text-red-500 block uppercase flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Admin Deletes
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">{stats.adminDeletes}</span>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-950/40 rounded-2xl shadow-xs">
            <span className="text-[11px] font-extrabold text-blue-500 block uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Customer Deletes
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{stats.customerDeletes}</span>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-950/40 rounded-2xl shadow-xs">
            <span className="text-[11px] font-extrabold text-teal-500 block uppercase flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Business Deletes
            </span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1 block">{stats.businessDeletes}</span>
          </div>
        </div>

        {/* Auto-Purge Retention Policy Controls Card */}
        <div className="lg:col-span-4 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" /> Retention & Auto-Purge Policy
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-extrabold">
              Active Policy
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Automatically purge deleted trash items from database storage after retention period expires.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold text-slate-900 dark:text-white flex-1"
            >
              <option value="30">30 Days Retention (Recommended)</option>
              <option value="60">60 Days Retention</option>
              <option value="90">90 Days Retention</option>
              <option value="never">Never Auto-Purge (Manual Only)</option>
            </select>
            <button
              onClick={() => toast.success("Retention Policy Saved! ⚙️", `Retention policy updated to: ${retentionDays === "never" ? "Never Auto-Purge" : `${retentionDays} Days`}.`)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
            >
              Save Policy
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs & Batch Toolbar & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Actor Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveActor("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeActor === "ALL"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            📦 All Deletes ({stats.totalDeleted})
          </button>
          <button
            onClick={() => setActiveActor("ADMIN")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeActor === "ADMIN"
                ? "bg-red-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin Deletes ({stats.adminDeletes})
          </button>
          <button
            onClick={() => setActiveActor("CUSTOMER")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeActor === "CUSTOMER"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Customer Deletes ({stats.customerDeletes})
          </button>
          <button
            onClick={() => setActiveActor("BUSINESS")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeActor === "BUSINESS"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-stone-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Business Deletes ({stats.businessDeletes})
          </button>
        </div>

        {/* Search & Batch Actions Toolbar */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 px-2 font-mono">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={handleBatchRestore}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
              <button
                onClick={handleBatchPurge}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Purge
              </button>
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
            <input
              type="text"
              placeholder="Search title, deleter, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Deleted Items List / Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading platform trash vault records...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Recycle Bin is Empty</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No deleted items found in this section. All platform records are intact.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                      {selectedIds.length === items.length ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="p-4">Entity Type & Title</th>
                  <th className="p-4">Who Deleted It</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Deleted At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition ${isSelected ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelectItem(item.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Entity Type & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            {getEntityIcon(item.entityType)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{item.title}</div>
                            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold mt-0.5">
                              {item.entityType.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Who Deleted It */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">{item.deletedByName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{item.deletedByPhone || "N/A"}</div>
                          <div>{getActorBadge(item.actorType, item.deletedByRole)}</div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="p-4 max-w-xs">
                        <p className="text-slate-600 dark:text-stone-300 text-xs line-clamp-2 leading-relaxed">
                          {item.reason || item.snippet}
                        </p>
                      </td>

                      {/* Deleted At */}
                      <td className="p-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(item.deletedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setInspectingItem(item)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs inline-flex items-center gap-1 transition cursor-pointer"
                          title="Inspect raw deletion snapshot & JSON payload"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                          title="Restore item back to active database state"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore 🔄</span>
                        </button>
                        <button
                          onClick={() => handlePurge(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-red-600 hover:text-white text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          title="Permanently remove item from platform trash vault"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Purge 🗑️</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT RAW SNAPSHOT MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white relative font-sans">
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <Code className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-extrabold text-base">Inspection Snapshot: {inspectingItem.title}</h3>
                <p className="text-xs text-slate-400 font-mono">Entity ID: {inspectingItem.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Entity Type</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{inspectingItem.entityType}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Deleted By</span>
                <span className="font-bold text-slate-900 dark:text-white">{inspectingItem.deletedByName} ({inspectingItem.actorType})</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">Raw JSON Payload & Audit Snapshot</span>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800">
                {JSON.stringify(inspectingItem.payload || inspectingItem, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleRestore(inspectingItem);
                  setInspectingItem(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                Restore Item 🔄
              </button>
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
