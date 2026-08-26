"use client";

import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Lock, Unlock, Ban, AlertTriangle, UserX, RefreshCw, Plus, Trash2 } from "lucide-react";

interface BannedEntry {
  id: string;
  type: "PHONE" | "IP_ADDRESS" | "EMAIL";
  value: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}

const INITIAL_BANNED_ENTRIES: BannedEntry[] = [
  { id: "ban-1", type: "PHONE", value: "+233240999888", reason: "Repeated spam job postings & fake MoMo receipts", bannedAt: "2026-08-20", bannedBy: "Admin Security" },
  { id: "ban-2", type: "IP_ADDRESS", value: "102.176.44.12", reason: "Automated bot scraping attack on provider API", bannedAt: "2026-08-22", bannedBy: "Automated Firewall" },
  { id: "ban-3", type: "EMAIL", value: "spammer_bot99@gmail.com", reason: "Fake customer review spammer", bannedAt: "2026-08-24", bannedBy: "Admin Security" },
];

import { toast } from "@/lib/toast";

export function AdminSecurityHub() {
  const [bannedList, setBannedList] = useState<BannedEntry[]>(INITIAL_BANNED_ENTRIES);
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<"PHONE" | "IP_ADDRESS" | "EMAIL">("PHONE");
  const [newReason, setNewReason] = useState("");

  function handleAddBan(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue) return;
    const entry: BannedEntry = {
      id: `ban-${Date.now()}`,
      type: newType,
      value: newValue,
      reason: newReason || "Manual Security Blacklist",
      bannedAt: new Date().toISOString().split("T")[0],
      bannedBy: "Master Admin",
    };
    setBannedList([entry, ...bannedList]);
    toast.error(`Target Blacklisted 🚫`, `${newType} ${newValue} added to security blocklist.`);
    setNewValue("");
    setNewReason("");
  }

  function handleUnban(id: string) {
    const entry = bannedList.find((b) => b.id === id);
    setBannedList(bannedList.filter((b) => b.id !== id));
    toast.success(`Block Lifted ✓`, `Target ${entry?.value || id} removed from blacklist.`);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" /> Security, Fraud & Blacklist Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Blacklist banned phone numbers, block abusive IP addresses, and monitor platform security threat logs.
          </p>
        </div>
      </div>

      {/* Add New Blacklist Form */}
      <form onSubmit={handleAddBan} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Ban className="w-4 h-4 text-red-500" /> Add New Security Blacklist Entry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Target Type</label>
            <select
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-bold"
            >
              <option value="PHONE">Phone Number (+233...)</option>
              <option value="IP_ADDRESS">IP Address</option>
              <option value="EMAIL">Email Address</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Value (Phone / IP / Email)</label>
            <input
              type="text"
              placeholder="e.g. +233240999888 or 102.176.44.12"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">Ban Reason / Details</label>
            <input
              type="text"
              placeholder="e.g. Fraudulent MoMo receipts"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Blacklist Target 🚫
          </button>
        </div>
      </form>

      {/* Blacklisted Entries Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Active Blacklist Directory ({bannedList.length})</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="p-4">Blacklist Target</th>
              <th className="p-4">Type</th>
              <th className="p-4">Reason / Notes</th>
              <th className="p-4">Banned At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
            {bannedList.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition">
                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white text-sm">{b.value}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[10px] border border-red-500/20">
                    {b.type}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-stone-300">{b.reason}</td>
                <td className="p-4 font-mono text-slate-400 text-[11px]">{b.bannedAt}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleUnban(b.id)}
                    className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 ml-auto"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Unban / Lift Block
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
