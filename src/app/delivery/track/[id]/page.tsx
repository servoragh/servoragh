"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  MapPin,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Package,
  Bike,
  Copy,
  Check,
} from "lucide-react";
import { formatGHS } from "@/lib/delivery/pricingEngine";

export default function LiveDeliveryTrackingPage() {
  const params = useParams();
  const deliveryId = params?.id as string;

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    if (deliveryId) {
      fetchDelivery();
      const interval = setInterval(fetchDelivery, 5000); // Auto refresh status every 5 seconds
      return () => clearInterval(interval);
    }
  }, [deliveryId]);

  async function fetchDelivery() {
    try {
      const res = await fetch(`/api/delivery/requests/${deliveryId}/track`);
      if (!res.ok) {
        // Fallback to customer list endpoint
        const listRes = await fetch("/api/delivery/requests");
        const listJson = await listRes.json();
        const found = listJson.deliveries?.find((d: any) => d.id === deliveryId);
        if (found) setDelivery(found);
      } else {
        const json = await res.json();
        setDelivery(json.delivery);
      }
    } catch {
      // Ignore poll errors
    } finally {
      setLoading(false);
    }
  }

  const copyPin = () => {
    if (!delivery?.deliveryPin) return;
    navigator.clipboard.writeText(delivery.deliveryPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs font-semibold">
        Loading live delivery tracking...
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-20 px-4 text-center">
        <h2 className="text-xl font-bold mb-2">Delivery Not Found</h2>
        <Link href="/delivery" className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
          Return to Delivery Portal
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "REQUESTED", label: "Requested" },
    { key: "SEARCHING_FOR_PROVIDER", label: "Finding Provider" },
    { key: "PROVIDER_ASSIGNED", label: "Assigned" },
    { key: "AT_PICKUP", label: "At Pickup" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "COMPLETED", label: "Delivered" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === delivery.status);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Delivery Marketplace
        </Link>

        {/* HERO STATUS CARD */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
                Tracking #{delivery.trackingNumber}
              </span>
              <h1 className="text-2xl font-black mt-1">
                Status: {delivery.status.replace(/_/g, " ")}
              </h1>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-stone-300 font-bold uppercase block">Delivery Fee</span>
              <span className="text-xl font-black text-emerald-400">{formatGHS(delivery.deliveryFee)}</span>
            </div>
          </div>

          {/* STATUS STEPPER PROGRESS */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-2">
            {steps.map((s, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx || delivery.status === "COMPLETED";
              return (
                <div key={s.key} className="space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-black transition ${
                      isPastOrCurrent
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : "bg-white/10 text-stone-400 border border-white/10"
                    }`}
                  >
                    {isPastOrCurrent ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold block ${isPastOrCurrent ? "text-emerald-300" : "text-stone-400"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROOF OF DELIVERY RECIPIENT OTP PIN CARD */}
        <div className="bg-amber-500 text-stone-950 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-amber-400">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-950 text-amber-300 rounded-full text-xs font-black">
              <KeyRound className="w-3.5 h-3.5" /> RECIPIENT PROOF-OF-DELIVERY PIN OTP
            </div>
            <h3 className="text-xl font-black">4-Digit Security PIN Code</h3>
            <p className="text-xs text-stone-900 font-semibold max-w-md">
              Share this PIN with the delivery provider upon arrival. The provider enters this PIN into their app to verify handover and complete the delivery.
            </p>
          </div>

          <div className="bg-stone-950 text-white p-4 rounded-2xl text-center shrink-0 min-w-[160px] space-y-1 shadow-2xl">
            <span className="text-[10px] text-stone-400 font-mono uppercase font-bold tracking-widest block">
              SECURITY CODE
            </span>
            <span className="text-4xl font-black text-amber-400 tracking-widest font-mono block">
              {delivery.deliveryPin}
            </span>
            <button
              onClick={copyPin}
              className="text-[10px] font-bold text-stone-300 hover:text-white flex items-center justify-center gap-1 mx-auto pt-1"
            >
              {copiedPin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPin ? "Copied!" : "Copy PIN"}</span>
            </button>
          </div>
        </div>

        {/* ASSIGNED PROVIDER INFO CARD */}
        {delivery.assignedProvider ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider">
              Assigned Delivery Provider
            </h3>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-black text-xl flex items-center justify-center overflow-hidden border border-emerald-300">
                  {delivery.assignedProvider.user?.avatarUrl ? (
                    <img src={delivery.assignedProvider.user.avatarUrl} alt="Provider" className="w-full h-full object-cover" />
                  ) : (
                    "🚚"
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {delivery.assignedProvider.user?.name}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">
                    Vehicle: {delivery.requiredVehicleType} • Verified Provider
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${delivery.assignedProvider.user?.phone}`}
                  className="px-4 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4" /> Call Provider
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-center text-xs text-stone-500 font-semibold space-y-2">
            <Clock className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="font-bold text-stone-800 dark:text-stone-200">Finding a verified delivery provider nearby...</p>
            <p>We are dispatching your request to available online riders in Tamale.</p>
          </div>
        )}

        {/* ADDRESS & PACKAGE SPECS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">Pickup Location</h4>
            <p className="text-sm font-extrabold text-stone-900 dark:text-white">{delivery.pickupAddress}</p>
            <p className="text-xs text-stone-500">
              Contact: {delivery.pickupContactName} ({delivery.pickupContactPhone})
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">Destination Location</h4>
            <p className="text-sm font-extrabold text-stone-900 dark:text-white">{delivery.destinationAddress}</p>
            <p className="text-xs text-stone-500">
              Recipient: {delivery.recipientName} ({delivery.recipientPhone})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
