"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  RotateCcw,
  Smartphone,
  Wallet,
  Clock,
  Filter,
} from "lucide-react";
import { EscrowDeal, EscrowStatus, EscrowStats } from "@/lib/escrowTypes";

export function AdminFinanceEscrowHub() {
  const [deals, setDeals] = useState<EscrowDeal[]>([]);
  const [stats, setStats] = useState<EscrowStats>({
    totalDeals: 0,
    totalHeldGhs: 0,
    totalReleasedGhs: 0,
    totalRefundedGhs: 0,
    activeEscrowsCount: 0,
    disputedCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  async function fetchFinanceEscrow() {
    setLoading(true);
    try {
      const url = `/api/escrow?status=${statusFilter}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals || []);
        setStats(data.stats || {
          totalDeals: 0,
          totalHeldGhs: 0,
          totalReleasedGhs: 0,
          totalRefundedGhs: 0,
          activeEscrowsCount: 0,
          disputedCount: 0,
        });
      }
    } catch (e) {
      console.error("Failed to load finance escrow data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinanceEscrow();
  }, [statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchFinanceEscrow();
  }

  async function handleUpdateStatus(dealId: string, newStatus: EscrowStatus, reason?: string) {
    setActionLoadingId(dealId);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_STATUS", dealId, newStatus, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Escrow Status Updated 💸`, `Deal ${dealId} is now ${newStatus.replace(/_/g, " ")}.`);
        fetchFinanceEscrow();
      } else {
        toast.error("Escrow Action Failed", data.error || "Failed to update escrow deal.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to update escrow status.");
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  function getStatusBadge(status: EscrowStatus) {
    switch (status) {
      case "HELD_IN_ESCROW":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 font-extrabold text-[10px] border border-amber-500/30 uppercase inline-flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-500" /> Locked in Escrow
          </span>
        );
      case "RELEASED_TO_SELLER":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 uppercase inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Released to Seller
          </span>
        );
      case "REFUNDED_TO_BUYER":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 font-extrabold text-[10px] border border-blue-500/30 uppercase inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-blue-500" /> Refunded to Buyer
          </span>
        );
      case "DISPUTED":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-300 font-extrabold text-[10px] border border-red-500/30 uppercase inline-flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-500" /> Disputed Deal
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] border border-slate-500/30 uppercase">
            {status}
          </span>
        );
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Finance, Transactions & MoMo Escrow Protection Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage buyer-seller MoMo escrow deposits, release Mobile Money payouts to local business sellers, and process buyer dispute refunds.
          </p>
        </div>
        <button
          onClick={fetchFinanceEscrow}
          className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Ledger
        </button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Escrow Volume</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">GH₵ {stats.totalHeldGhs + stats.totalReleasedGhs + stats.totalRefundedGhs}</span>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-950/40 rounded-2xl shadow-xs">
          <span className="text-[11px] font-extrabold text-amber-500 block uppercase flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Currently Locked in Escrow
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">GH₵ {stats.totalHeldGhs}</span>
          <span className="text-[10px] text-amber-500 font-mono font-bold mt-0.5 block">{stats.activeEscrowsCount} Active Holds</span>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-950/40 rounded-2xl shadow-xs">
          <span className="text-[11px] font-extrabold text-emerald-500 block uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Released Seller Payouts
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">GH₵ {stats.totalReleasedGhs}</span>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-950/40 rounded-2xl shadow-xs">
          <span className="text-[11px] font-extrabold text-red-500 block uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Disputed Deals
          </span>
          <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">{stats.disputedCount}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Deals ({stats.totalDeals})
          </button>
          <button
            onClick={() => setStatusFilter("HELD_IN_ESCROW")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === "HELD_IN_ESCROW"
                ? "bg-amber-500 text-stone-950 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Locked Holds ({stats.activeEscrowsCount})
          </button>
          <button
            onClick={() => setStatusFilter("DISPUTED")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === "DISPUTED"
                ? "bg-red-500 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Disputed ({stats.disputedCount})
          </button>
          <button
            onClick={() => setStatusFilter("RELEASED_TO_SELLER")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              statusFilter === "RELEASED_TO_SELLER"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Released Payouts
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
          <input
            type="text"
            placeholder="Search code, buyer, seller, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Escrow Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading MoMo escrow transaction ledger...</div>
        ) : deals.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">No matching escrow deals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Deal Code & Title</th>
                  <th className="p-4">Buyer (Payer)</th>
                  <th className="p-4">Seller (Payee)</th>
                  <th className="p-4">Escrow Amount</th>
                  <th className="p-4">Status & MoMo Ref</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">{deal.title}</div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold block mt-0.5">
                        {deal.dealCode} &bull; {deal.deliveryArea}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{deal.buyerName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{deal.buyerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{deal.sellerBusinessName || deal.sellerName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{deal.sellerPhone}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 block">
                        GH₵ {deal.amountGhs}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Network: {deal.momoProvider.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 space-y-1">
                      <div>{getStatusBadge(deal.status)}</div>
                      <div className="text-[10px] font-mono text-slate-400">{deal.momoReference}</div>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {deal.status === "HELD_IN_ESCROW" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, "RELEASED_TO_SELLER", "Admin confirmed delivery & released MoMo payout.")}
                            disabled={actionLoadingId === deal.id}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-xs"
                            title="Release Escrow MoMo payout directly to seller"
                          >
                            Release Payout 💸
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, "REFUNDED_TO_BUYER", "Admin refunded escrow deposit to buyer.")}
                            disabled={actionLoadingId === deal.id}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition cursor-pointer"
                            title="Refund Escrow deposit to buyer"
                          >
                            Refund Buyer 🔄
                          </button>
                        </>
                      )}
                      {deal.status === "DISPUTED" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, "RELEASED_TO_SELLER", "Dispute resolved in favor of seller.")}
                            disabled={actionLoadingId === deal.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Pay Seller 💸
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(deal.id, "REFUNDED_TO_BUYER", "Dispute resolved in favor of buyer.")}
                            disabled={actionLoadingId === deal.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Refund Buyer ↩️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
