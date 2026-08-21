"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Package,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  DollarSign,
  Phone,
  User,
  Info,
} from "lucide-react";
import { calculateDeliveryPrice, formatGHS } from "@/lib/delivery/pricingEngine";

function DeliveryRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);

  // Pickup Details
  const [pickupAddress, setPickupAddress] = useState("Sakasaka Main Street, Tamale");
  const [pickupContactName, setPickupContactName] = useState("");
  const [pickupContactPhone, setPickupContactPhone] = useState("");

  // Destination Details
  const [destinationAddress, setDestinationAddress] = useState("Central Market, Tamale");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Package Specs
  const [packageCategory, setPackageCategory] = useState("PARCEL");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageWeightKg, setPackageWeightKg] = useState(
    searchParams.get("weight") ? parseFloat(searchParams.get("weight")!) : 2.0
  );
  const [packageSize, setPackageSize] = useState(
    searchParams.get("size") || "MEDIUM"
  );
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [prohibitedConfirmed, setProhibitedConfirmed] = useState(true);

  // Vehicle & Payment
  const [requiredVehicleType, setRequiredVehicleType] = useState(
    searchParams.get("vehicle") || "MOTORCYCLE"
  );
  const [distanceKm, setDistanceKm] = useState(
    searchParams.get("distance") ? parseFloat(searchParams.get("distance")!) : 5.0
  );
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setPickupContactName(data.user.name || "");
          setPickupContactPhone(data.user.phone || "");
        }
      })
      .catch(() => {});
  }, []);

  const pricing = calculateDeliveryPrice({
    vehicleType: requiredVehicleType,
    distanceKm,
    packageWeightKg,
    packageSize,
  });

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prohibitedConfirmed) {
      alert("Please confirm that the package does not contain prohibited or hazardous items.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/delivery/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress,
          pickupContactName,
          pickupContactPhone,
          destinationAddress,
          recipientName,
          recipientPhone,
          packageCategory,
          packageDescription,
          packageWeightKg,
          packageSize,
          specialInstructions,
          requiredVehicleType,
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create delivery request.");

      // Redirect to live tracking page
      router.push(`/delivery/track/${json.delivery.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back Button */}
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Delivery Overview
        </Link>

        {/* Header Title */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest">
              Step {step} of 4
            </span>
            <h1 className="text-xl font-black text-stone-900 dark:text-white">
              {step === 1 && "1. Pickup Location & Sender Info"}
              {step === 2 && "2. Destination & Recipient Contact"}
              {step === 3 && "3. Package Specifications"}
              {step === 4 && "4. Vehicle & Payment Confirmation"}
            </h1>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-stone-400">
            <Truck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* STEP 1: PICKUP */}
        {step === 1 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Pickup Address & Contact
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Pickup Address / Landmark *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="e.g. Sakasaka Total Filling Station, Tamale"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Sender Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={pickupContactName}
                  onChange={(e) => setPickupContactName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Sender Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={pickupContactPhone}
                  onChange={(e) => setPickupContactPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!pickupAddress || !pickupContactName || !pickupContactPhone) {
                  alert("Please fill in pickup address, contact name, and phone.");
                  return;
                }
                setStep(2);
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Next: Destination Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: DESTINATION */}
        {step === 2 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" /> Destination Address & Recipient
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Destination Address / Landmark *
              </label>
              <input
                type="text"
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="e.g. Central Market Shop #42, Tamale"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient Name"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Recipient Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!destinationAddress || !recipientName || !recipientPhone) {
                    alert("Please fill in destination address, recipient name, and phone.");
                    return;
                  }
                  setStep(3);
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Next: Package Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PACKAGE SPECS */}
        {step === 3 && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" /> Package Specifications
            </h3>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Package Category *
              </label>
              <select
                value={packageCategory}
                onChange={(e) => setPackageCategory(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
              >
                <option value="DOCUMENTS">Documents & Official Letters</option>
                <option value="FOOD">Prepared Food & Catering</option>
                <option value="CLOTHING">Clothing & Fashion Fugu</option>
                <option value="ELECTRONICS">Electronics & Phones</option>
                <option value="GROCERIES">Groceries & Market Produce</option>
                <option value="HOUSEHOLD">Household Supplies</option>
                <option value="BUSINESS_GOODS">Business Hardware & Spare Parts</option>
                <option value="AGRICULTURAL">Agricultural Products & Farm Goods</option>
                <option value="OTHER">Other Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Package Description *
              </label>
              <textarea
                rows={2}
                required
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="Describe package contents e.g., 2 boxes of spare motorcycle parts..."
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Approx. Weight (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={packageWeightKg}
                  onChange={(e) => setPackageWeightKg(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Package Size
                </label>
                <select
                  value={packageSize}
                  onChange={(e) => setPackageSize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold"
                >
                  <option value="SMALL">Small (Fits in backpack)</option>
                  <option value="MEDIUM">Medium (Fits on bike carrier)</option>
                  <option value="LARGE">Large (Car boot required)</option>
                  <option value="HEAVY_BULK">Heavy Bulk (Pickup / Van required)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Handle with care / Call recipient before arrival..."
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <input
                type="checkbox"
                id="prohibited"
                checked={prohibitedConfirmed}
                onChange={(e) => setProhibitedConfirmed(e.target.checked)}
                className="mt-0.5 accent-amber-600"
              />
              <label htmlFor="prohibited" className="cursor-pointer leading-snug">
                I confirm that this package does NOT contain illegal, hazardous, or prohibited items.
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!packageDescription) {
                    alert("Please provide a package description.");
                    return;
                  }
                  setStep(4);
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Next: Vehicle & Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VEHICLE, PRICE SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <form onSubmit={handleSubmitDelivery} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" /> Transportation & Payment Summary
            </h3>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 dark:text-stone-300 mb-2">
                Preferred Vehicle Type
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
                    onClick={() => setRequiredVehicleType(v.id)}
                    className={`p-2.5 rounded-2xl border text-xs transition flex flex-col items-center gap-1 ${
                      requiredVehicleType === v.id
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

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 dark:text-stone-300 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("MOBILE_MONEY")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === "MOBILE_MONEY"
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600"
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Mobile Money
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === "CARD"
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" /> Bank Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    paymentMethod === "CASH"
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600"
                  }`}
                >
                  <span>💵 Cash</span>
                </button>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="bg-stone-50 dark:bg-stone-800/80 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                <span>Base Rate ({requiredVehicleType}):</span>
                <span className="font-bold">{formatGHS(pricing.baseFee)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                <span>Distance Fee (~{distanceKm} km):</span>
                <span className="font-bold">{formatGHS(pricing.distanceFee)}</span>
              </div>
              {pricing.weightSurcharge > 0 && (
                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                  <span>Weight Surcharge ({packageWeightKg} kg):</span>
                  <span className="font-bold">{formatGHS(pricing.weightSurcharge)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-stone-200 dark:border-stone-700 pt-3">
                <span className="text-xs font-black uppercase text-stone-800 dark:text-stone-200">
                  Total Delivery Charge:
                </span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatGHS(pricing.deliveryFee)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3.5 px-5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{submitting ? "Creating Delivery Request..." : "Confirm & Dispatch Delivery"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RequestDeliveryWizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs font-semibold">
        Loading delivery request wizard...
      </div>
    }>
      <DeliveryRequestContent />
    </Suspense>
  );
}
