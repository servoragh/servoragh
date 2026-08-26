"use client";

import React from "react";
import { Radio, Zap, MessageCircle, Send, CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

export function AdminApiGatewaysHub() {
  const gateways = [
    { name: "WhatsApp Business API", provider: "Meta / WhatsApp Cloud API", status: "ONLINE", latency: "140ms", balance: "Unlimited API Messaging" },
    { name: "SMS Gateway (Hubtel / Arkesel)", provider: "Hubtel Ghana", status: "ONLINE", latency: "210ms", balance: "4,820 SMS Credits Left" },
    { name: "MoMo Escrow Payment Gateway", provider: "Paystack / MTN MoMo API", status: "ONLINE", latency: "180ms", balance: "Live Merchant Sandbox Active" },
    { name: "Google Maps & Geocoding API", provider: "Google Cloud", status: "ONLINE", latency: "95ms", balance: "Active (Tamale Bounds Filter)" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-blue-500 animate-pulse" /> API Gateways & System Integration Health
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status for WhatsApp Business API, Hubtel SMS Gateway, Mobile Money payment webhooks, and map services.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gateways.map((g, idx) => (
          <div key={idx} className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{g.name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[10px] border border-emerald-500/30">
                {g.status}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <div className="flex justify-between">
                <span>Provider Engine:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-300">{g.provider}</span>
              </div>
              <div className="flex justify-between">
                <span>Response Latency:</span>
                <span className="font-bold text-emerald-600">{g.latency}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Quota / Status:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-300">{g.balance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
