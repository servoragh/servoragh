"use client";

import React, { useState } from "react";
import { Scale, ShieldAlert, CheckCircle, XCircle, AlertCircle, FileText, Send, DollarSign } from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface DisputeResolutionRoomProps {
  roomId: string;
  orderTitle: string;
  amount: number;
  buyerName: string;
  vendorName: string;
  status: string;
  isAdmin: boolean;
  onResolution?: () => void;
}

export function DisputeResolutionRoom({
  roomId,
  orderTitle,
  amount,
  buyerName,
  vendorName,
  status,
  isAdmin,
  onResolution,
}: DisputeResolutionRoomProps) {
  const [resolutionAction, setResolutionAction] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  async function handleResolve(action: "REFUND_BUYER" | "RELEASE_VENDOR" | "CLOSE_DISPUTE") {
    if (!confirm(`Are you sure you want to execute: ${action}?`)) return;
    setResolving(true);

    try {
      const res = await fetch(`/api/chat/rooms/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `⚖️ **ADMIN MEDIATOR RULING**: Dispute resolved. Decision: **${action.replace("_", " ")}**. Transaction closed.`,
          isInternalNote: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to record dispute decision.");
      alert(`Dispute decision "${action}" recorded successfully.`);
      if (onResolution) onResolution();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-6 text-white text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/80 via-stone-900 to-stone-900 p-5 rounded-2xl border border-rose-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 shadow">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white">3-Way Dispute Mediation Room</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                {status}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Order: <strong className="text-white">{orderTitle}</strong> &bull; Disputed Amount:{" "}
              <strong className="text-emerald-400">{formatGHS(amount)}</strong>
            </p>
          </div>
        </div>

        {/* Admin Mediator Controls */}
        {isAdmin && status !== "RESOLVED" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleResolve("REFUND_BUYER")}
              disabled={resolving}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Full Refund Buyer</span>
            </button>
            <button
              onClick={() => handleResolve("RELEASE_VENDOR")}
              disabled={resolving}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Release to Vendor</span>
            </button>
          </div>
        )}
      </div>

      {/* Case Details Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
          <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">CLAIMANT (BUYER)</span>
          <span className="font-bold text-white text-sm">{buyerName}</span>
        </div>
        <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
          <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">RESPONDENT (VENDOR)</span>
          <span className="font-bold text-white text-sm">{vendorName}</span>
        </div>
        <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
          <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">PLATFORM MEDIATOR</span>
          <span className="font-bold text-rose-400 text-sm">Servora Disputes Team</span>
        </div>
      </div>
    </div>
  );
}
