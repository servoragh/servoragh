"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  MapPin,
  AlertCircle,
  Navigation,
  Globe,
  Tag,
  Clock,
  DollarSign,
  UserCheck,
  Shield,
  FileText,
  Video,
  Image as ImageIcon,
  Lock,
  Phone,
  MessageSquare,
  Key,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { InstantQuoteEstimator } from "@/components/InstantQuoteEstimator";

interface RequestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategorySlug?: string;
}

export function RequestWizardModal({ isOpen, onClose, initialCategorySlug }: RequestWizardModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Current session status
  const [user, setUser] = useState<any>(null);
  const [verifyingGuest, setVerifyingGuest] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  // Form Step 1: Category & Problem
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Array<{ mediaUrl: string; mediaType: string; fileName: string; fileSize?: number }>>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form Step 2: Dual Geolocation & GPS
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [landmark, setLandmark] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);
  const [gettingGps, setGettingGps] = useState(false);
  const [isLiveTrackingOptIn, setIsLiveTrackingOptIn] = useState(false);

  // Form Step 3: Urgency, Scheduling & Budget
  const [urgency, setUrgency] = useState<"EMERGENCY_ASAP" | "SAME_DAY" | "SCHEDULED" | "FLEXIBLE">("SAME_DAY");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [pricingType, setPricingType] = useState<"OPEN_FOR_QUOTES" | "FIXED" | "RANGE" | "HOURLY">("OPEN_FOR_QUOTES");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("GHS");

  // Form Step 4: Contact & Guest Onboarding
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [accessInstructions, setAccessInstructions] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState("WHATSAPP_SMS");
  const [visibility, setVisibility] = useState("PUBLIC_ALL");

  useEffect(() => {
    if (isOpen) {
      checkAuthSession();
    }
  }, [isOpen]);

  async function checkAuthSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setGuestName(data.user.name || "");
        setGuestPhone(data.user.phone || "");
        setGuestEmail(data.user.email || "");
      }
    } catch {}
  }

  // Handle GPS location click
  function handleFetchDeviceLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracyRadius(pos.coords.accuracy);
        setLandmark("Exact GPS Position Captured 📍");
        setGettingGps(false);
      },
      (err) => {
        alert("Failed to fetch GPS coordinates. Please specify landmark manually.");
        setGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Handle file attachment upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok || !d.url) throw new Error("File upload failed.");

      let mediaType = "IMAGE";
      if (file.type.startsWith("video/")) mediaType = "VIDEO";
      else if (file.type === "application/pdf" || file.type.includes("document")) mediaType = "DOCUMENT";

      setAttachments((prev) => [
        ...prev,
        { mediaUrl: d.url, mediaType, fileName: file.name, fileSize: file.size },
      ]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  // Submit complete request payload
  async function handleSubmitRequest() {
    if (!title.trim()) {
      setError("Please provide a job title or category.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId || null,
          customCategory: isCustomCategory ? customCategory : null,
          title,
          description,
          tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()) : [],
          attachments,

          // Location
          locationId: selectedLocationId || null,
          landmark,
          streetAddress,
          latitude,
          longitude,
          accuracyRadius,
          isLiveTrackingOptIn,

          // Urgency & Budget
          urgency,
          scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null,
          pricingType,
          budgetMin: budgetMin ? parseFloat(budgetMin) : null,
          budgetMax: budgetMax ? parseFloat(budgetMax) : null,
          currency,

          // Access & Contact
          accessInstructions,
          preferredContactMethod,
          visibility,

          // Guest User
          isGuestPost: !user,
          guestName: user ? user.name : guestName,
          guestPhone: user ? user.phone : guestPhone,
          guestEmail: user ? user.email : guestEmail,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to submit request.");

      setCreatedRequestId(resData.request?.id);

      if (resData.isPendingVerification) {
        setPendingRequestId(resData.request?.id);
        setSimulatedOtp(resData.otpCode || "1234");
        setVerifyingGuest(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP for Guest
  async function handleVerifyGuestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingRequestId || !otpCodeInput) return;
    setLoading(true);

    try {
      const res = await fetch("/api/requests/verify-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: pendingRequestId,
          otpCode: otpCodeInput,
        }),
      });

      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Verification failed.");

      setVerifyingGuest(false);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl transition-all text-stone-900 dark:text-white text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-stone-900 p-6 flex items-center justify-between border-b border-emerald-800 dark:border-stone-800 text-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
              Step {step} of 4 &bull; Universal Service Request Engine
            </span>
            <h3 className="text-lg font-black text-white">Post Service Request</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-white/80 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 dark:bg-stone-950 h-1.5">
          <div className="bg-emerald-500 h-1.5 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Verification Modal for Guest */}
          {verifyingGuest ? (
            <div className="py-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/80">
                <Key className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-stone-900 dark:text-white">Verify Phone & Claim Request</h4>
              <p className="text-stone-600 dark:text-stone-400 text-xs max-w-sm mx-auto">
                We sent a 4-digit code to <strong className="text-amber-600 dark:text-amber-400">{guestPhone}</strong>. Enter it below to publish your job & claim your temporary account!
              </p>

              {simulatedOtp && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-mono max-w-xs mx-auto">
                  Dev Test OTP Code: <strong>{simulatedOtp}</strong>
                </div>
              )}

              <form onSubmit={handleVerifyGuestOtp} className="max-w-xs mx-auto space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 4-digit code"
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value)}
                  className="w-full p-3.5 bg-stone-50 dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Publish Job Request"}
                </button>
              </form>
            </div>
          ) : success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-stone-900 dark:text-white">Service Request Broadcasted!</h4>
              <p className="text-stone-600 dark:text-stone-400 text-xs max-w-md mx-auto">
                Your request in Tamale has been published to verified local providers. You will receive quotes directly via WhatsApp & In-app messaging!
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={`/requests/${createdRequestId}`}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition text-center shadow"
                >
                  View Request & Quotes
                </a>
                <button onClick={onClose} className="w-full py-2.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Service Category, Description & Attachments */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>Step 1: Service Category & Scope of Work</span>
                  </h4>

                  {/* Category Picker */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Select Service Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "serv-1", name: "Electrical Wiring & Repairs" },
                        { id: "serv-2", name: "AC & Fridge Technician" },
                        { id: "serv-3", name: "Plumbing & Leakage" },
                        { id: "serv-4", name: "Phone & Laptop Repair" },
                        { id: "serv-5", name: "Tailoring & Fugu Smocks" },
                        { id: "custom", name: "Other / Custom Service ✍️" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            if (cat.id === "custom") {
                              setIsCustomCategory(true);
                              setSelectedServiceId("");
                            } else {
                              setIsCustomCategory(false);
                              setSelectedServiceId(cat.id);
                              setTitle(cat.name);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-left font-bold transition border cursor-pointer ${
                            (isCustomCategory && cat.id === "custom") || selectedServiceId === cat.id
                              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
                              : "bg-stone-50 dark:bg-stone-850 border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Category Input */}
                  {isCustomCategory && (
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Specify Custom Service Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Solar Inverter Installation, Generator Repair..."
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setTitle(e.target.value);
                        }}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white rounded-xl outline-none font-bold"
                      />
                    </div>
                  )}

                  {/* Title & Description */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Broken Samsung Screen / Fuse Replacement in Sakasaka"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Detailed Problem Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what is broken, model numbers, symptoms, or custom instructions..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Tags / Keywords (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="wiring, generator, solar, instant"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-300 placeholder-stone-400 rounded-xl outline-none font-medium"
                    />
                  </div>

                  {/* Multi-file Attachments */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Upload Diagnostic Media (Photos, Video, PDF)</label>
                    <div className="border border-dashed border-stone-300 dark:border-stone-700 p-4 rounded-xl text-center bg-stone-50 dark:bg-stone-850 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                        <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span>{uploadingFile ? "Uploading file..." : "Attach photo, short video or invoice PDF"}</span>
                      </div>
                      <label className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer">
                        <span>Browse File</span>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*,.pdf" />
                      </label>
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 overflow-x-auto">
                        {attachments.map((att, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 rounded-lg font-mono text-[10px] border border-stone-300 dark:border-stone-700 truncate max-w-[150px]">
                            {att.fileName} ({att.mediaType})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Dual Geolocation & Live GPS Tracking */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>Step 2: Dual Geolocation & Live GPS Navigation</span>
                  </h4>

                  {/* One-Tap GPS */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-stone-900 dark:text-white text-xs">One-Tap Device GPS Location</h5>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">Fetch exact latitude & longitude for emergency dispatch.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleFetchDeviceLocation}
                        disabled={gettingGps}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{gettingGps ? "Locating..." : "Use GPS"}</span>
                      </button>
                    </div>

                    {latitude && (
                      <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-white dark:bg-stone-900 p-2 rounded-lg border border-emerald-300 dark:border-emerald-800">
                        GPS Captured: {latitude.toFixed(4)}, {longitude?.toFixed(4)} (±{Math.round(accuracyRadius || 0)}m accuracy)
                      </div>
                    )}
                  </div>

                  {/* Live Tracking Opt-in Toggle */}
                  <div className="p-3 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-white block">Live GPS Tracking Opt-In 🛰️</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">Stream position to provider while en route for emergency response.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isLiveTrackingOptIn}
                      onChange={(e) => setIsLiveTrackingOptIn(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Manual Address & Landmark */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Landmark / Neighborhood (Tamale)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Sakasaka Taxi Rank / Behind Aboabo Market"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Street Address (Private until quote accepted)</label>
                    <input
                      type="text"
                      placeholder="House No / Street Name"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Urgency, Schedule & Budget */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>Step 3: Urgency & Budget Structure</span>
                  </h4>

                  {/* Instant Rate Calculator Widget */}
                  <InstantQuoteEstimator
                    onApplyEstimate={(est) => {
                      setBudgetMax(est.toString());
                      setPricingType("RANGE");
                    }}
                  />

                  {/* Urgency Status */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Urgency Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "EMERGENCY_ASAP", label: "🚨 Emergency (ASAP)", color: "border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60" },
                        { id: "SAME_DAY", label: "⚡ Same Day", color: "border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60" },
                        { id: "SCHEDULED", label: "📅 Scheduled Date", color: "border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60" },
                        { id: "FLEXIBLE", label: "🌱 Flexible / Open", color: "border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60" },
                      ].map((urg) => (
                        <button
                          key={urg.id}
                          type="button"
                          onClick={() => setUrgency(urg.id as any)}
                          className={`p-2.5 rounded-xl font-bold border text-left transition cursor-pointer ${
                            urgency === urg.id ? urg.color : "bg-stone-50 dark:bg-stone-850 border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          {urg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Date */}
                  {urgency === "SCHEDULED" && (
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Preferred Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white rounded-xl outline-none font-medium"
                      />
                    </div>
                  )}

                  {/* Pricing Type */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Pricing Structure</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "OPEN_FOR_QUOTES", label: "Open to Bids / Quotes" },
                        { id: "FIXED", label: "Fixed Price" },
                        { id: "RANGE", label: "Price Range (Min - Max)" },
                        { id: "HOURLY", label: "Hourly Rate" },
                      ].map((pr) => (
                        <button
                          key={pr.id}
                          type="button"
                          onClick={() => setPricingType(pr.id as any)}
                          className={`p-2.5 rounded-xl font-bold border text-left transition cursor-pointer ${
                            pricingType === pr.id
                              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
                              : "bg-stone-50 dark:bg-stone-850 border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          {pr.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Min / Max */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Min Budget (GH₵)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Max Budget (GH₵)</label>
                      <input
                        type="number"
                        placeholder="e.g. 250"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Contact & Guest Onboarding */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    <span>Step 4: Contact & Guest Verification</span>
                  </h4>

                  {!user && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                      <strong>Guest User Workflow:</strong> Enter your details below. We will auto-create a lightweight account so you can track quotes!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">WhatsApp Phone</label>
                      <input
                        type="text"
                        placeholder="+233500000000"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-mono font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Gate / Entry Access Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Call at the gate, green fence house"
                      value={accessInstructions}
                      onChange={(e) => setAccessInstructions(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-semibold mb-1">Preferred Communication</label>
                    <select
                      value={preferredContactMethod}
                      onChange={(e) => setPreferredContactMethod(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white rounded-xl outline-none font-bold"
                    >
                      <option value="WHATSAPP_SMS">WhatsApp & SMS</option>
                      <option value="PHONE_CALL">Direct Phone Call</option>
                      <option value="CHAT">In-App Chat Only</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    {loading ? "Broadcasting Request..." : "Submit & Broadcast Job Request"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
