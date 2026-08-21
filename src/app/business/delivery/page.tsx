"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Truck,
  Plus,
  Package,
  CheckCircle2,
  ArrowLeft,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { formatGHS } from "@/lib/delivery/pricingEngine";

export default function BusinessDeliveryPortalPage() {
  const [batchTitle, setBatchTitle] = useState("");
  const [items, setItems] = useState<any[]>([
    { recipientName: "", recipientPhone: "", destinationAddress: "", description: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const addItemRow = () => {
    setItems([
      ...items,
      { recipientName: "", recipientPhone: "", destinationAddress: "", description: "" },
    ]);
  };

  const updateItem = (index: number, field: string, val: string) => {
    const next = [...items];
    next[index][field] = val;
    setItems(next);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create batch deliveries
      for (const item of items) {
        if (!item.recipientName || !item.destinationAddress) continue;
        await fetch("/api/delivery/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupAddress: "Business Central Warehouse, Tamale",
            pickupContactName: "Business Admin",
            pickupContactPhone: "+233 24 000 0000",
            destinationAddress: item.destinationAddress,
            recipientName: item.recipientName,
            recipientPhone: item.recipientPhone,
            packageCategory: "BUSINESS_GOODS",
            packageDescription: item.description || "Bulk Merchant Package",
            packageWeightKg: 2,
            packageSize: "MEDIUM",
            requiredVehicleType: "MOTORCYCLE",
          }),
        });
      }

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href="/business/portal"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Business Portal
        </Link>

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 border border-white/10 mb-2">
              <Building2 className="w-4 h-4" /> Enterprise Merchant Logistics
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Bulk Delivery Batch Dispatch</h1>
            <p className="text-xs text-stone-300">
              Dispatch multiple orders simultaneously for restaurants, pharmacies, supermarkets, and agricultural produce.
            </p>
          </div>
        </div>

        {/* BATCH BUILDER FORM */}
        <form onSubmit={handleBatchSubmit} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
            <h3 className="font-black text-base text-stone-900 dark:text-white">
              Create Delivery Batch ({items.length} Packages)
            </h3>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Package Row
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center text-emerald-600 space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="font-extrabold text-lg">Batch Dispatch Created Successfully!</h3>
              <p className="text-xs text-stone-500">
                Verified delivery providers are being matched with your batch orders.
              </p>
              <Link href="/delivery" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl inline-block">
                View Active Deliveries
              </Link>
            </div>
          ) : (
            <>
              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                  <span className="text-xs font-black text-emerald-600">Package #{idx + 1}</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={item.recipientName}
                      onChange={(e) => updateItem(idx, "recipientName", e.target.value)}
                      placeholder="Recipient Name"
                      className="px-3 py-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
                    />

                    <input
                      type="tel"
                      required
                      value={item.recipientPhone}
                      onChange={(e) => updateItem(idx, "recipientPhone", e.target.value)}
                      placeholder="Recipient Phone"
                      className="px-3 py-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
                    />

                    <input
                      type="text"
                      required
                      value={item.destinationAddress}
                      onChange={(e) => updateItem(idx, "destinationAddress", e.target.value)}
                      placeholder="Destination Address"
                      className="px-3 py-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
                    />
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    placeholder="Package Description e.g., Order #921 Lunch Meal"
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xl transition"
              >
                {submitting ? "Dispatching Batch..." : `Dispatch ${items.length} Package Delivery Batch`}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
