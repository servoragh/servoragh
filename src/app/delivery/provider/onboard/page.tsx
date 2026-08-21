"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Bike,
  Truck,
  Car,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  User,
} from "lucide-react";

export default function DeliveryProviderOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Identity Form State
  const [idType, setIdType] = useState("GHANA_CARD");
  const [idNumber, setIdNumber] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80");
  const [selfieUrl, setSelfieUrl] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");

  // Vehicle Form State
  const [vehicleType, setVehicleType] = useState("MOTORCYCLE");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");
  const [plateNumber, setPlateNumber] = useState("");
  const [color, setColor] = useState("");
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoadingProfile(true);
      const res = await fetch("/api/delivery/provider/onboard");
      const json = await res.json();
      if (json.provider) {
        setProviderProfile(json.provider);
        if (json.provider.idNumber) setIdNumber(json.provider.idNumber);
        if (json.provider.residentialAddress) setResidentialAddress(json.provider.residentialAddress);
      }
    } catch {
      // Ignore profile fetch error
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Submit Identity Verification
      const idRes = await fetch("/api/delivery/provider/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idType,
          idNumber,
          idDocumentUrl,
          selfieUrl,
          emergencyContactName,
          emergencyContactPhone,
          residentialAddress,
        }),
      });

      const idJson = await idRes.json();
      if (!idRes.ok) throw new Error(idJson.error || "Identity submission failed.");

      // 2. Submit Vehicle Registration
      if (make && model) {
        await fetch("/api/delivery/provider/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleType,
            make,
            model,
            year,
            plateNumber,
            color,
            photoUrl: vehiclePhotoUrl,
          }),
        });
      }

      // Re-fetch updated profile and navigate to dashboard
      await fetchProfile();
      alert("Registration submitted! Your documents are under review by Administrators.");
      router.push("/delivery/provider/dashboard");
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs">
        Loading provider verification status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Delivery Portal
        </Link>

        {/* HERO TITLE CARD */}
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 border border-white/10">
              <UserCheck className="w-3.5 h-3.5" /> Provider Onboarding System
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Become a Delivery Provider</h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              Turn your bike, car, van, or truck into daily earnings. Submit identity and vehicle verification documents for administrator approval.
            </p>
          </div>

          {providerProfile && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 space-y-1">
              <span className="text-[10px] text-stone-300 uppercase font-bold tracking-widest block">
                Verification Status
              </span>
              <span className={`text-xs font-black px-3 py-1 rounded-full inline-block ${
                providerProfile.verificationStatus === "APPROVED"
                  ? "bg-emerald-500 text-white"
                  : providerProfile.verificationStatus === "REJECTED"
                  ? "bg-rose-500 text-white"
                  : "bg-amber-500 text-stone-950"
              }`}>
                {providerProfile.verificationStatus}
              </span>
            </div>
          )}
        </div>

        {/* VERIFICATION FORM */}
        <form onSubmit={handleSubmitVerification} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Section 1: Personal & Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-2">
              1. Identity & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ID Type *
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                >
                  <option value="GHANA_CARD">Ghana Card (National ID)</option>
                  <option value="PASSPORT">Ghanaian Passport</option>
                  <option value="DRIVERS_LICENSE">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ID Document Number *
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="GHA-000000000-0"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Residential Address in Ghana *
              </label>
              <input
                type="text"
                required
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="House Number, Street Name, Neighborhood e.g. Sakasaka, Tamale"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Parent / Spouse Name"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Registration */}
          <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-2">
              2. Vehicle Registration & Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                Select Vehicle Type *
              </label>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { id: "MOTORCYCLE", label: "Motorbike", icon: "🏍️" },
                  { id: "BICYCLE", label: "Bicycle", icon: "🚲" },
                  { id: "CAR", label: "Car", icon: "🚗" },
                  { id: "TRICYCLE", label: "Tricycle", icon: "🛺" },
                  { id: "PICKUP", label: "Pickup", icon: "🛻" },
                  { id: "VAN", label: "Van", icon: "🚐" },
                  { id: "TRUCK", label: "Heavy Truck", icon: "🚛" },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id)}
                    className={`p-2.5 rounded-2xl border text-xs transition flex flex-col items-center gap-1 ${
                      vehicleType === v.id
                        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black"
                        : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    <span className="text-base">{v.icon}</span>
                    <span className="text-[10px] font-bold truncate">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Make / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Royal / Honda / Toyota"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 125cc / Corolla / Hilux"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. M-24-NR"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? "Submitting Documents..." : "Submit Registration for Verification"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
