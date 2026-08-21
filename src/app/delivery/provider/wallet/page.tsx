"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowLeft,
  DollarSign,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Smartphone,
} from "lucide-react";
import { formatGHS } from "@/lib/delivery/pricingEngine";

export default function ProviderWalletPage() {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [networkOrBank, setNetworkOrBank] = useState("MTN_MOMO");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  async function fetchWallet() {
    try {
      setLoading(true);
      const res = await fetch("/api/delivery/provider/wallet");
      const json = await res.json();
      if (json.success) {
        setWalletData(json);
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/delivery/provider/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod,
          accountName,
          accountNumber,
          networkOrBank,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Withdrawal failed.");

      setSuccessMsg(json.message);
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs">
        Loading provider wallet & earnings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href="/delivery/provider/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dispatcher Dashboard
        </Link>

        {/* HERO WALLET CARD */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 border border-white/10">
              <Wallet className="w-3.5 h-3.5" /> Mobile Money Earnings & Wallet
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Provider Payout Portal</h1>
            <p className="text-xs text-stone-300">
              Withdraw your delivery job earnings directly to your Ghana Mobile Money wallet or bank account.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-right shrink-0 space-y-1">
            <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest block">Available Balance</span>
            <span className="text-3xl font-black text-emerald-400">
              {formatGHS(walletData?.walletBalance || 0)}
            </span>
          </div>
        </div>

        {/* REQUEST WITHDRAWAL FORM */}
        <form onSubmit={handleWithdrawalSubmit} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" /> Request Earnings Withdrawal
          </h3>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Withdrawal Amount (GHS) *
              </label>
              <input
                type="number"
                min="10"
                step="5"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 150.00"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
              >
                <option value="MOBILE_MONEY">Mobile Money (Ghana)</option>
                <option value="BANK_TRANSFER">Bank Account Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full Registered Name"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                MoMo / Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="024XXXXXXX"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Network / Bank Name *
              </label>
              <select
                value={networkOrBank}
                onChange={(e) => setNetworkOrBank(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
              >
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="TELECEL_CASH">Telecel Cash</option>
                <option value="AT_MONEY">AT Money</option>
                <option value="GCB_BANK">GCB Bank</option>
                <option value="ECOBANK">Ecobank Ghana</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Submitting Request..." : "Request Payout Withdrawal"}</span>
          </button>
        </form>

        {/* WITHDRAWAL HISTORY */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-stone-900 dark:text-white">
            Payout Withdrawal History
          </h3>

          {!walletData?.withdrawals || walletData.withdrawals.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No payout withdrawals requested yet.
            </div>
          ) : (
            <div className="space-y-2">
              {walletData.withdrawals.map((w: any) => (
                <div key={w.id} className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-stone-900 dark:text-white block">
                      {w.networkOrBank} • {w.accountNumber}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm block">
                      {formatGHS(Number(w.amount))}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      w.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
