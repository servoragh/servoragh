"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  X,
  CheckCircle,
  MapPin,
  AlertCircle,
  Navigation,
  Key,
  Zap,
  Clock,
  CalendarDays,
  Leaf,
  Phone,
  Users,
  Eye,
  ArrowRight,
} from "lucide-react";
import { MediaUploader, type UploadedMedia } from "@/components/MediaUploader";

interface RequestWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategorySlug?: string;
}

// These are QUICK-FILL shortcuts — user can always type anything
const QUICK_FILLS = [
  { emoji: "⚡", label: "Electrical" },
  { emoji: "❄️", label: "AC / Fridge" },
  { emoji: "🔧", label: "Plumbing" },
  { emoji: "📱", label: "Phone Repair" },
  { emoji: "🪡", label: "Tailoring" },
  { emoji: "🏠", label: "Painting" },
  { emoji: "🚗", label: "Auto / Mechanic" },
  { emoji: "🌞", label: "Solar / Generator" },
  { emoji: "🛋️", label: "Furniture" },
  { emoji: "🧹", label: "Cleaning" },
  { emoji: "🔐", label: "Security / CCTV" },
  { emoji: "💈", label: "Barbing / Salon" },
];

const URGENCY_OPTIONS = [
  { id: "EMERGENCY_ASAP", label: "ASAP", emoji: "🚨", color: "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
  { id: "SAME_DAY",       label: "Today",    emoji: "⚡", color: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "SCHEDULED",      label: "Schedule", emoji: "📅", color: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300" },
  { id: "FLEXIBLE",       label: "Flexible", emoji: "🌱", color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
];

export function RequestWizardModal({ isOpen, onClose }: RequestWizardModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  // OTP guest verification
  const [verifyingGuest, setVerifyingGuest] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [otpCodeInput, setOtpCodeInput] = useState("");

  // Auth
  const [user, setUser] = useState<any>(null);

  // Form fields
  const [title, setTitle] = useState("");           // free-text: anything they want
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [urgency, setUrgency] = useState("SAME_DAY");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // GPS
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingGps, setGettingGps] = useState(false);

  // Media
  const [media, setMedia] = useState<UploadedMedia[]>([]);

  useEffect(() => {
    if (isOpen) checkAuthSession();
  }, [isOpen]);

  async function checkAuthSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setGuestName(data.user.name || "");
        setGuestPhone(data.user.phone || "");
      }
    } catch {}
  }

  function handleGps() {
    if (!navigator.geolocation) return;
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLandmark(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setGettingGps(false);
        toast.success("📍 GPS Captured", "Exact location locked.");
      },
      () => { setGettingGps(false); toast.error("GPS Failed", "Enter landmark manually."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Please describe what service you need."); return; }
    if (!guestName.trim()) { setError("Please enter your name."); return; }
    if (!guestPhone.trim()) { setError("Please enter your WhatsApp number."); return; }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          media,
          landmark,
          latitude,
          longitude,
          urgency,
          isGuestPost: !user,
          guestName: user ? user.name : guestName,
          guestPhone: user ? user.phone : guestPhone,
          guestEmail: user ? user.email : "",
          pricingType: "OPEN_FOR_QUOTES",
          visibility: "PUBLIC_ALL",
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingRequestId || !otpCodeInput) return;
    setLoading(true);
    try {
      const res = await fetch("/api/requests/verify-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: pendingRequestId, otpCode: otpCodeInput }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Verification failed.");
      setVerifyingGuest(false);
      setSuccess(true);
      toast.success("🎉 Request Published!", "Your request is live for local providers.");
    } catch (err: any) {
      toast.error("Verification Error", err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setSuccess(false); setVerifyingGuest(false); setError(null); setOtpCodeInput("");
    setTitle(""); setDescription(""); setLandmark(""); setMedia([]);
    setLatitude(null); setLongitude(null); setUrgency("SAME_DAY");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-900 dark:text-white text-xs">

        {/* ─── Header ─── */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-900 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-0.5">Servora · Post Any Job</p>
            <h3 className="text-base font-black text-white">What do you need help with?</h3>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── "Where it appears" Banner ─── */}
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-900 px-5 py-2.5 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-800 dark:text-emerald-300">Publicly listed on</span>
            <a href="/requests" target="_blank" className="font-black text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-600">
              /requests board
            </a>
          </div>
          <span className="text-emerald-600 dark:text-emerald-500 mx-1">·</span>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400">Artisans & providers will see it and send you price offers</span>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── OTP Verification ── */}
          {verifyingGuest ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
                <Key className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold">Verify Your Phone</h4>
              <p className="text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                We sent a 4-digit code to <strong className="text-amber-500">{guestPhone}</strong>. Enter it to publish your request.
              </p>
              {simulatedOtp && (
                <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl font-mono max-w-xs mx-auto">
                  Dev OTP: <strong>{simulatedOtp}</strong>
                </div>
              )}
              <form onSubmit={handleVerifyOtp} className="max-w-xs mx-auto space-y-3">
                <input
                  type="text" maxLength={6} placeholder="Enter code"
                  value={otpCodeInput} onChange={(e) => setOtpCodeInput(e.target.value)}
                  className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-center text-xl font-mono font-black tracking-widest text-emerald-600 outline-none"
                  required
                />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer transition">
                  {loading ? "Verifying..." : "Verify & Publish"}
                </button>
              </form>
            </div>

          ) : success ? (
            /* ── Success ── */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold">Your Request is Live! 🎉</h4>
              <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                It's now publicly listed on the <strong className="text-emerald-600">Service Requests Board</strong>. Verified artisans will see it and send you price offers directly!
              </p>

              {/* Where it appears — visual preview */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-left space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">Appears on</p>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white text-xs">servora.com/requests</p>
                    <p className="text-[10px] text-stone-500">Public Requests Board — visible to all artisans in Tamale</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a href={`/requests/${createdRequestId}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center transition shadow flex items-center justify-center gap-2">
                  View Your Request & Offers <ArrowRight className="w-4 h-4" />
                </a>
                <a href="/requests"
                  className="w-full py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-center transition">
                  Browse All Service Requests
                </a>
                <button onClick={resetAndClose} className="w-full py-2 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer">
                  Close
                </button>
              </div>
            </div>

          ) : (
            /* ── Main Form ── */
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* 1. Title — PRIMARY FREE-TEXT FIELD, front and centre */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Describe what you need <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fix broken pipe, repair Samsung phone, sew a kaba, weld gate..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-600 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none font-medium placeholder-stone-400 text-sm transition"
                  autoFocus
                />
                <p className="mt-1 text-[10px] text-stone-400">Type anything — any service, trade, or task in Tamale & Northern Ghana</p>
              </div>

              {/* 2. Quick-fill shortcuts — clearly labelled as optional helpers */}
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  ⚡ Quick-fill a common category (optional)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FILLS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setTitle(q.label);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold transition cursor-pointer text-[11px] ${
                        title === q.label
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                      }`}
                    >
                      <span>{q.emoji}</span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Description */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  More details <span className="text-stone-400 font-normal">(helps artisans quote accurately)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Model numbers, symptoms, size, quantity, or anything useful..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none font-medium placeholder-stone-400 resize-none transition"
                />
              </div>

              {/* 4. Urgency */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-2">How urgent?</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {URGENCY_OPTIONS.map((u) => (
                    <button key={u.id} type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl border font-bold transition cursor-pointer ${
                        urgency === u.id ? u.color : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500"
                      }`}
                    >
                      <span className="text-base">{u.emoji}</span>
                      <span className="text-[10px]">{u.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Location */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  Your location / landmark
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Near Sakasaka Taxi Rank, Tamale"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="flex-1 p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none font-medium placeholder-stone-400 transition"
                  />
                  <button type="button" onClick={handleGps} disabled={gettingGps}
                    title="Auto-detect my GPS location"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition disabled:opacity-60">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">{gettingGps ? "..." : "GPS"}</span>
                  </button>
                </div>
                {latitude && (
                  <p className="mt-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    📍 {latitude.toFixed(4)}, {longitude?.toFixed(4)} — GPS captured
                  </p>
                )}
              </div>

              {/* 6. Photos / Video */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Photos / Video <span className="text-stone-400 font-normal">(optional — helps artisans quote accurately)</span>
                </label>
                <MediaUploader
                  value={media}
                  onChange={setMedia}
                  maxImages={6}
                  maxVideoSeconds={30}
                  maxSizeMB={15}
                />
              </div>

              {/* 7. Contact */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl space-y-3">
                <p className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5" /> Your Contact — artisans will reach you here
                </p>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] font-mono text-stone-500">{user.phone}</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                      Logged in ✓
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-500 font-semibold mb-1 text-[11px]">Full Name *</label>
                      <input type="text" placeholder="Your name" value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-medium focus:border-emerald-500 transition"
                        required />
                    </div>
                    <div>
                      <label className="block text-stone-500 font-semibold mb-1 text-[11px]">WhatsApp Number *</label>
                      <input type="tel" placeholder="+233..." value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl outline-none font-mono font-medium focus:border-emerald-500 transition"
                        required />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2">
                {loading ? "Publishing..." : (
                  <>
                    <span>🚀 Post Request — Get Quotes from Artisans</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-stone-400">
                Your request will be publicly visible on the{" "}
                <a href="/requests" className="text-emerald-600 font-bold hover:underline" target="_blank">
                  Service Requests board
                </a>{" "}
                — artisans in Tamale will see it and send you price offers.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
