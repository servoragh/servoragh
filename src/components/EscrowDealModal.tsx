"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, Lock, X, Smartphone, ArrowRight } from "lucide-react";
import { toast } from "@/lib/toast";

interface EscrowDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName?: string;
  sellerPhone?: string;
  sellerBusinessName?: string;
  defaultTitle?: string;
}

export function EscrowDealModal({
  isOpen,
  onClose,
  sellerName = "Local Business / Worker",
  sellerPhone = "+233240000000",
  sellerBusinessName,
  defaultTitle = "",
}: EscrowDealModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [amountGhs, setAmountGhs] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("Tamale");
  const [momoProvider, setMomoProvider] = useState<"MTN_MOMO" | "TELECEL_CASH" | "AT_MONEY">("MTN_MOMO");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdDeal, setCreatedDeal] = useState<any>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_DEAL",
          dealData: {
            title: title || `Service/Order with ${sellerBusinessName || sellerName}`,
            amountGhs: Number(amountGhs),
            buyerName: buyerName || "Customer Buyer",
            buyerPhone: buyerPhone || "+233240000000",
            sellerName,
            sellerPhone,
            sellerBusinessName,
            deliveryArea,
            momoProvider,
            notes,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedDeal(data.deal);
        toast.success("Safe Escrow Deal Created! 🛡️", `GH₵ ${data.deal.amountGhs} locked safely in Escrow.`);
      } else {
        toast.error("Escrow Creation Failed", data.error || "Could not create Escrow deal.");
      }
    } catch (err) {
      toast.error("Network Error", "Failed to connect to Escrow server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full bg-stone-100 dark:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              <span>Servora Safe MoMo Escrow</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-mono font-black border border-emerald-500/30">
                0% Risk
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Don't trust sending money directly on WhatsApp? Lock your money safely until package/service is received!
            </p>
          </div>
        </div>

        {createdDeal ? (
          <div className="py-4 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg">Safe Escrow Deal Created!</h4>
              <span className="inline-block mt-1 px-3 py-1 bg-amber-500/10 text-amber-600 font-mono font-black text-xs rounded-xl border border-amber-500/30">
                Code: {createdDeal.dealCode}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
              Your <strong>GH₵ {createdDeal.amountGhs}</strong> deposit is now safely locked in Servora Escrow. We have alerted <strong>{sellerBusinessName || sellerName}</strong> to deliver. Once you receive your order, click "Confirm Delivery" to release funds.
            </p>
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl text-left text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>MoMo Network:</span>
                <span className="font-bold">{createdDeal.momoProvider.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-bold">{createdDeal.momoReference}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Seller / Worker: {sellerBusinessName || sellerName}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono block">
                Phone: {sellerPhone}
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Item / Job Title</label>
              <input
                type="text"
                placeholder="e.g. Solar inverter installation or 5.5KVA generator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Agreed Price (GH₵)</label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={amountGhs}
                  onChange={(e) => setAmountGhs(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-bold text-emerald-600 dark:text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Mobile Money Provider</label>
                <select
                  value={momoProvider}
                  onChange={(e: any) => setMomoProvider(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-bold"
                >
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="TELECEL_CASH">Telecel Cash</option>
                  <option value="AT_MONEY">AT Money</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kwame Mensah"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Your Phone (MoMo)</label>
                <input
                  type="tel"
                  placeholder="e.g. 0244123456"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Delivery Location / Neighborhood</label>
              <input
                type="text"
                placeholder="e.g. Sakasaka, Tamale"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? "Locking Funds in Escrow..." : "Deposit & Lock Escrow Funds 🛡️"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
