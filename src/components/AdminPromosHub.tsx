"use client";

import React, { useState } from "react";
import { Tag, Plus, CheckCircle2, XCircle, Sparkles, Percent, DollarSign, Calendar } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_GHS";
  value: number;
  minOrderGhs: number;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  expiresAt: string;
}

const INITIAL_PROMOS: PromoCode[] = [
  { id: "promo-1", code: "WELCOME10", discountType: "PERCENTAGE", value: 10, minOrderGhs: 50, usageCount: 42, maxUsage: 500, isActive: true, expiresAt: "2026-12-31" },
  { id: "promo-2", code: "TAMALE2026", discountType: "FIXED_GHS", value: 20, minOrderGhs: 100, usageCount: 88, maxUsage: 200, isActive: true, expiresAt: "2026-09-30" },
  { id: "promo-3", code: "FUGU50", discountType: "FIXED_GHS", value: 50, minOrderGhs: 400, usageCount: 15, maxUsage: 50, isActive: false, expiresAt: "2026-08-01" },
];

import { toast } from "@/lib/toast";

export function AdminPromosHub() {
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_GHS">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("50");

  function handleCreatePromo(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !value) return;
    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType: type,
      value: Number(value),
      minOrderGhs: Number(minOrder),
      usageCount: 0,
      maxUsage: 500,
      isActive: true,
      expiresAt: "2026-12-31",
    };
    setPromos([newPromo, ...promos]);
    toast.success("Promo Code Created! 🏷️", `Code ${newPromo.code} activated successfully.`);
    setCode("");
    setValue("");
  }

  function togglePromo(id: string) {
    const promo = promos.find((p) => p.id === id);
    setPromos(promos.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    toast.info("Promo Code Status Changed", `Code ${promo?.code} is now ${!promo?.isActive ? "Active" : "Disabled"}.`);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-500" /> Promotions, Vouchers & Discount Codes
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create promotional discount vouchers, set percentage/fixed GHS discounts, and track usage counters.
          </p>
        </div>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreatePromo} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Create New Discount Code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Promo Code</label>
            <input
              type="text"
              placeholder="e.g. TAMALE50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-black uppercase text-amber-600"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Discount Type</label>
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_GHS">Fixed Amount (GH₵)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Discount Value</label>
            <input
              type="number"
              placeholder={type === "PERCENTAGE" ? "10 (%)" : "20 (GH₵)"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold text-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Min Order (GH₵)</label>
            <input
              type="number"
              placeholder="50"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Generate Promo Code 🏷️
          </button>
        </div>
      </form>

      {/* Promos Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="p-4">Promo Code</th>
              <th className="p-4">Discount Value</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Usage Count</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition">
                <td className="p-4">
                  <span className="font-black text-sm font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 inline-block">
                    {p.code}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-900 dark:text-white">
                  {p.discountType === "PERCENTAGE" ? `${p.value}% OFF` : `GH₵ ${p.value} OFF`}
                </td>
                <td className="p-4 font-mono text-slate-500">GH₵ {p.minOrderGhs}</td>
                <td className="p-4 font-mono text-slate-500">{p.usageCount} / {p.maxUsage} Uses</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      p.isActive
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-stone-500/20 text-stone-500 dark:text-stone-400 border border-stone-500/30"
                    }`}
                  >
                    {p.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => togglePromo(p.id)}
                    className={`px-3 py-1 font-bold rounded-xl text-xs transition cursor-pointer ${
                      p.isActive
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
