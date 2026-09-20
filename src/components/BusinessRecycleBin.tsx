"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Package,
  Wrench,
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { formatGHS } from "@/lib/utils";

interface RecycledItem {
  trashId: string;
  originalId: string;
  itemType: "product" | "rental" | "service" | string;
  title: string;
  category: string;
  price: number;
  images: string[];
  deletedAt: string;
  deletedBy?: string;
  snapshot?: any;
}

interface BusinessRecycleBinProps {
  onItemRestored?: () => void;
}

export function BusinessRecycleBin({ onItemRestored }: BusinessRecycleBinProps) {
  const [items, setItems] = useState<RecycledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "product" | "rental" | "service">("all");
  const [search, setSearch] = useState("");
  const [isConfirmingEmpty, setIsConfirmingEmpty] = useState(false);

  useEffect(() => {
    fetchRecycledItems();
  }, []);

  async function fetchRecycledItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/business/recycle-bin");
      const json = await res.json();

      let fetchedItems: RecycledItem[] = [];
      if (res.ok && Array.isArray(json.items)) {
        fetchedItems = json.items;
      }

      // Check local storage backup for demo/offline resilience
      try {
        const local = localStorage.getItem("servora_merchant_recycle_bin");
        if (local) {
          const parsedLocal: RecycledItem[] = JSON.parse(local);
          // Merge items that aren't already in fetchedItems
          const existingIds = new Set(fetchedItems.map((i) => i.trashId || i.originalId));
          parsedLocal.forEach((item) => {
            if (!existingIds.has(item.trashId || item.originalId)) {
              fetchedItems.push(item);
            }
          });
        }
      } catch (_) {}

      setItems(fetchedItems);
    } catch (err) {
      console.warn("Recycle bin load error, using local storage backup:", err);
      try {
        const local = localStorage.getItem("servora_merchant_recycle_bin");
        if (local) setItems(JSON.parse(local));
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(item: RecycledItem) {
    setActionLoadingId(item.trashId);
    try {
      const res = await fetch("/api/business/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", trashId: item.trashId }),
      });

      // Update state & local storage
      const nextItems = items.filter((i) => i.trashId !== item.trashId);
      setItems(nextItems);
      try {
        localStorage.setItem("servora_merchant_recycle_bin", JSON.stringify(nextItems));
      } catch (_) {}

      toast.success("Restored to Storefront! 🎉", `"${item.title}" is active again.`);
      if (onItemRestored) onItemRestored();
    } catch (err: any) {
      toast.error("Restore Failed", err.message || "Failed to restore item.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handlePermanentDelete(item: RecycledItem) {
    if (!confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) return;

    setActionLoadingId(item.trashId);
    try {
      await fetch(`/api/business/recycle-bin?trashId=${item.trashId}`, {
        method: "DELETE",
      });

      const nextItems = items.filter((i) => i.trashId !== item.trashId);
      setItems(nextItems);
      try {
        localStorage.setItem("servora_merchant_recycle_bin", JSON.stringify(nextItems));
      } catch (_) {}

      toast.info("Deleted Permanently", `"${item.title}" was purged from trash.`);
    } catch (err: any) {
      toast.error("Deletion Failed", err.message || "Could not delete permanently.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleEmptyTrash() {
    setIsConfirmingEmpty(true);
  }

  async function confirmEmptyTrash() {
    setLoading(true);
    setIsConfirmingEmpty(false);
    try {
      await fetch("/api/business/recycle-bin?action=empty", {
        method: "DELETE",
      });

      setItems([]);
      try {
        localStorage.removeItem("servora_merchant_recycle_bin");
      } catch (_) {}

      toast.success("Recycle Bin Emptied", "All trashed items permanently purged.");
    } catch (err: any) {
      toast.error("Empty Failed", err.message || "Could not empty recycle bin.");
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesFilter = filterType === "all" || item.itemType === filterType;
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-900 dark:text-white">
                Business Recycle Bin
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Whenever you delete products, equipment rentals, or services, they move here safely. You can restore them anytime or delete them forever.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={fetchRecycledItems}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 transition cursor-pointer disabled:opacity-50"
            title="Refresh Recycle Bin"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Recycle Bin</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Emptying Trash */}
      {isConfirmingEmpty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-black text-stone-900 dark:text-white">
                Empty Recycle Bin?
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to permanently delete all {items.length} items from your trash? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingEmpty(false)}
                className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEmptyTrash}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Empty All Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-2xl shadow-xs">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Trash" },
            { id: "product", label: "Products" },
            { id: "rental", label: "Tool Rentals" },
            { id: "service", label: "Services" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filterType === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search trash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Recycled Items List */}
      {loading && items.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-500">Checking Recycle Bin...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-black text-stone-900 dark:text-white">
            {search ? "No matching items found in trash" : "Recycle Bin is Empty"}
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {search
              ? "Try changing your search keywords or filter tab above."
              : "Items you delete from Storefront Catalogs will be safely archived here so you never lose them."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isProcessing = actionLoadingId === item.trashId;
            const itemImage =
              Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;

            return (
              <div
                key={item.trashId || item.originalId}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition group"
              >
                <div className="flex items-start gap-3.5">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center overflow-hidden shrink-0">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                      />
                    ) : item.itemType === "rental" ? (
                      <Wrench className="w-6 h-6 text-stone-400" />
                    ) : (
                      <Package className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          item.itemType === "product"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : item.itemType === "rental"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300"
                        }`}
                      >
                        {item.itemType === "product"
                          ? "Product"
                          : item.itemType === "rental"
                          ? "Rental Equipment"
                          : "Service Listing"}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-stone-900 dark:text-white truncate">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-stone-500 mt-1.5">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatGHS(item.price || 0)}
                      </span>
                      <span className="text-[10px] flex items-center gap-1 text-stone-400">
                        <Clock className="w-3 h-3" />
                        {new Date(item.deletedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(item)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-rose-300 dark:hover:border-rose-700 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Permanently erase from trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRestore(item)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                    <span>{isProcessing ? "Restoring..." : "Restore Item"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
