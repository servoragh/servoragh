"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import Link from "next/link";
import {
  Truck,
  Bike,
  ShieldCheck,
  Power,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  PhoneCall,
  KeyRound,
  RefreshCw,
  Wallet,
  Check,
} from "lucide-react";
import { formatGHS } from "@/lib/delivery/pricingEngine";

export default function DeliveryProviderDashboardPage() {
  const [provider, setProvider] = useState<any>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      // 1. Fetch Provider Profile
      const profRes = await fetch("/api/delivery/provider/onboard");
      const profJson = await profRes.json();
      if (profJson.provider) {
        setProvider(profJson.provider);

        // Check if provider has active delivery
        if (profJson.provider.assignedDeliveries) {
          const active = profJson.provider.assignedDeliveries.find((d: any) =>
            ["PROVIDER_ASSIGNED", "PROVIDER_ARRIVING", "AT_PICKUP", "PACKAGE_COLLECTED", "IN_TRANSIT", "ARRIVING_AT_DESTINATION"].includes(d.status)
          );
          setActiveDelivery(active || null);
        }
      }

      // 2. Fetch Available Jobs if online
      if (profJson.provider?.isOnline) {
        const jobsRes = await fetch("/api/delivery/requests/available");
        const jobsJson = await jobsRes.json();
        if (jobsJson.jobs) setAvailableJobs(jobsJson.jobs);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleOnline = async () => {
    if (!provider) return;
    setTogglingStatus(true);

    try {
      const nextOnlineState = !provider.isOnline;
      const res = await fetch("/api/delivery/provider/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: nextOnlineState }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error("Status Failed", json.error || "Cannot change online status.");
      } else {
        setProvider(json.provider);
        toast.info("Status Changed", `Couriers status updated to ${nextOnlineState ? "ONLINE 🟢" : "OFFLINE 🔴"}.`);
        if (nextOnlineState) fetchDashboardData();
      }
    } catch (err: any) {
      toast.error("Network Error", err.message || "Could not change status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/delivery/requests/${jobId}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to accept job.");
      toast.success("Job Accepted! 🚀", "Drive safely to the pickup location.");
      fetchDashboardData();
    } catch (err: any) {
      toast.error("Accept Failed", err.message || "Failed to accept delivery job.");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeDelivery) return;
    try {
      const res = await fetch(`/api/delivery/requests/${activeDelivery.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOtpPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !pinInput) return;

    setVerifyingPin(true);
    setPinError(null);

    try {
      const res = await fetch(`/api/delivery/requests/${activeDelivery.id}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invalid PIN OTP.");

      toast.success("Delivery Completed! 📦🎉", "Earnings credited to your courier wallet.");
      setPinInput("");
      setActiveDelivery(null);
      fetchDashboardData();
    } catch (err: any) {
      setPinError(err.message);
    } finally {
      setVerifyingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs">
        Loading provider dispatcher dashboard...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-black">No Provider Account Found</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          You need to register as a delivery provider and submit verification documents to access the dispatcher.
        </p>
        <Link href="/delivery/provider/onboard" className="px-5 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl inline-block">
          Become a Delivery Provider
        </Link>
      </div>
    );
  }

  const isApproved = provider.verificationStatus === "APPROVED";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* DISPATCHER HEADER CARD */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                ✓ {provider.verificationStatus} PROVIDER
              </span>
              <span className="text-xs font-bold text-stone-400">Rating: ★ {provider.ratingAverage || "5.0"}</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white">
              Rider Dispatcher Dashboard
            </h1>
            <p className="text-xs text-stone-500">
              Completed Jobs: {provider.completedDeliveriesCount || 0} • Active Vehicle: {provider.vehicles?.[0]?.make || "Motorbike"}
            </p>
          </div>

          {/* PRIMARY GO ONLINE / OFFLINE TOGGLE BUTTON */}
          <div className="w-full md:w-auto">
            <button
              onClick={handleToggleOnline}
              disabled={togglingStatus}
              className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${
                provider.isOnline
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
              }`}
            >
              <Power className="w-5 h-5" />
              <span>{togglingStatus ? "Updating..." : provider.isOnline ? "GO OFFLINE" : "GO ONLINE"}</span>
            </button>
          </div>
        </div>

        {/* UNVERIFIED WARNING BANNER */}
        {!isApproved && (
          <div className="p-5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-3xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm mb-0.5">Verification Under Administrator Review</h4>
              <p className="leading-relaxed">
                Your identity document and vehicle details are currently being inspected. Unverified providers cannot toggle **GO ONLINE** or accept live delivery jobs until approval is completed.
              </p>
            </div>
          </div>
        )}

        {/* EARNINGS METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase">Wallet Available</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatGHS(Number(provider.walletBalance || 0))}
              </h3>
            </div>
            <Link href="/delivery/provider/wallet" className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Total Completed Earnings</span>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-1">
              {formatGHS(Number(provider.totalEarnings || 0))}
            </h3>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Completed Deliveries</span>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {provider.completedDeliveriesCount || 0} Jobs
            </h3>
          </div>
        </div>

        {/* ACTIVE DELIVERY ACTION CARD */}
        {activeDelivery && (
          <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-black animate-pulse">
                  ACTIVE DELIVERY IN PROGRESS
                </span>
                <span className="text-xs font-mono text-stone-400">#{activeDelivery.trackingNumber}</span>
              </div>

              <span className="text-xl font-black text-emerald-400">
                Earnings: {formatGHS(Number(activeDelivery.providerEarnings || 0))}
              </span>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase">1. Pickup Address</span>
                <p className="text-sm font-black">{activeDelivery.pickupAddress}</p>
                <p className="text-xs text-stone-400">Contact: {activeDelivery.pickupContactName} ({activeDelivery.pickupContactPhone})</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-rose-400 font-extrabold uppercase">2. Destination Address</span>
                <p className="text-sm font-black">{activeDelivery.destinationAddress}</p>
                <p className="text-xs text-stone-400">Recipient: {activeDelivery.recipientName} ({activeDelivery.recipientPhone})</p>
              </div>
            </div>

            {/* STATUS TRANSITION BUTTONS */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-stone-300 uppercase">Update Delivery Milestone:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleUpdateStatus("AT_PICKUP")}
                  className="py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl border border-stone-700"
                >
                  📍 Arrived at Pickup
                </button>
                <button
                  onClick={() => handleUpdateStatus("PACKAGE_COLLECTED")}
                  className="py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl border border-stone-700"
                >
                  📦 Package Collected
                </button>
                <button
                  onClick={() => handleUpdateStatus("IN_TRANSIT")}
                  className="py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl border border-stone-700"
                >
                  🛵 In Transit
                </button>
                <button
                  onClick={() => handleUpdateStatus("ARRIVING_AT_DESTINATION")}
                  className="py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl border border-stone-700"
                >
                  🎯 Arrived at Recipient
                </button>
              </div>
            </div>

            {/* RECIPIENT PIN OTP VERIFICATION CARD */}
            <form onSubmit={handleVerifyOtpPin} className="bg-stone-900 border border-amber-500/40 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                <KeyRound className="w-4 h-4" /> Enter Recipient 4-Digit Proof of Delivery PIN
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 font-bold">{pinError}</p>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-Digit PIN"
                  className="flex-1 bg-stone-950 border border-stone-700 text-amber-400 font-mono font-black text-center text-xl tracking-widest py-2 rounded-xl focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={verifyingPin}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition"
                >
                  {verifyingPin ? "Verifying..." : "Verify PIN & Complete Delivery"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AVAILABLE JOBS FEED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-stone-900 dark:text-white">
              Available Delivery Jobs ({availableJobs.length})
            </h3>
            <button onClick={fetchDashboardData} className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {!provider.isOnline ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center text-xs text-stone-500 space-y-2">
              <Power className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="font-extrabold text-stone-800 dark:text-stone-200">You are currently OFFLINE.</p>
              <p>Toggle **GO ONLINE** at the top to start receiving nearby delivery requests.</p>
            </div>
          ) : availableJobs.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center text-xs text-stone-500 space-y-2">
              <Clock className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="font-extrabold text-stone-800 dark:text-stone-200">Searching for nearby delivery jobs...</p>
              <p>New delivery requests in Tamale will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                        {job.packageCategory}
                      </span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatGHS(Number(job.providerEarnings || 0))}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold line-clamp-2">
                      {job.packageDescription}
                    </p>

                    <div className="text-xs text-stone-500 space-y-1 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-100 dark:border-stone-700">
                      <p className="truncate"><strong className="text-stone-800 dark:text-stone-200">Pickup:</strong> {job.pickupAddress}</p>
                      <p className="truncate"><strong className="text-stone-800 dark:text-stone-200">Destination:</strong> {job.destinationAddress}</p>
                      <p className="text-[11px] font-bold text-emerald-600">Est. Distance: ~{job.estimatedDistanceKm} km</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Accept Job ({formatGHS(Number(job.providerEarnings || 0))})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
