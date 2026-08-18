"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Zap,
  Tag,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  UserCheck,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PostCategory, RegionZone } from "@/lib/communityTypes";

interface PostNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PostNoticeModal({ isOpen, onClose, onSuccess }: PostNoticeModalProps) {
  const [session, setSession] = useState<any>(null);
  const [postType, setPostType] = useState<PostCategory>("ALL_DISCUSSIONS");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [zone, setZone] = useState<RegionZone>("SAKASAKA");
  const [budget, setBudget] = useState<string>("");
  const [urgency, setUrgency] = useState<"Immediate" | "Today" | "Scheduled" | "Flexible">("Immediate");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photosList, setPhotosList] = useState<string[]>([]);
  const [contactPref, setContactPref] = useState<"CHAT" | "WHATSAPP" | "CALL">("WHATSAPP");

  // Guest Verification
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestWhatsApp, setGuestWhatsApp] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  function handleAddPhoto() {
    if (!photoUrl.trim()) return;
    if (!photosList.includes(photoUrl.trim())) {
      setPhotosList([...photosList, photoUrl.trim()]);
      setPhotoUrl("");
    }
  }

  function handleVerifyOtp() {
    if (!otpCode || otpCode.trim().length < 4) {
      alert("Please enter a valid 4-digit SMS OTP code (e.g. 1234).");
      return;
    }
    setIsOtpVerified(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content || !zone) {
      setError("Please fill out title, detailed description, and neighborhood zone.");
      return;
    }

    if (!session && (!guestName || !guestPhone)) {
      setError("Guest name and phone number are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalPhotos = photosList.length > 0 ? photosList : photoUrl ? [photoUrl] : [];

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category: postType,
          zone,
          budget: budget ? Number(budget) : undefined,
          currency: "GHS",
          urgency,
          photos: finalPhotos,
          contactPreference: contactPref,
          guestName: !session ? guestName : undefined,
          guestPhone: !session ? guestPhone : undefined,
          guestWhatsApp: !session ? guestWhatsApp || guestPhone : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Failed to publish community notice.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-stone-900 dark:text-white transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-stone-950 flex items-center justify-center font-black shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Post Community Notice / Equipment Call 📢
              </h2>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                Northern Ghana Trade & Community Ecosystem
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Post Category Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl font-bold border border-stone-200 dark:border-stone-700">
            {[
              { id: "ALL_DISCUSSIONS", label: "Discussion 🗨️" },
              { id: "SERVICE_CALL", label: "Service Call 💼" },
              { id: "TOOL_RENTAL", label: "Tool Rental 🛠️" },
              { id: "GRID_ALERT", label: "Grid Alert 📢" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPostType(t.id as any)}
                className={`py-2 rounded-xl transition cursor-pointer text-center ${
                  postType === t.id
                    ? "bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs font-black"
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Title & Detailed Scope */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Notice Title / Scope *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                postType === "TOOL_RENTAL"
                  ? "e.g. Urgent: 5.5KVA Generator Needed for Sakasaka Site Work"
                  : postType === "SERVICE_CALL"
                  ? "e.g. Emergency Electrical Wire Fault Repair in Choggu"
                  : "e.g. Planned Grid Maintenance Notice in Nyohini Zone"
              }
              className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Detailed Scope / Equipment Specs / Description *
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe exact specifications, daily rental rate, location directions, duration, or service requirement..."
              className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Neighborhood Zone & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                Neighborhood Zone *
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as any)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
              >
                <option value="ALL_NORTHERN_GH">All Northern Ghana</option>
                <option value="SAKASAKA">Sakasaka, Tamale</option>
                <option value="NYOHINI">Nyohini, Tamale</option>
                <option value="CHOGGU">Choggu, Tamale</option>
                <option value="ABOABO">Aboabo Market</option>
                <option value="DUNGU_UDS">Dungu UDS Campus</option>
                <option value="LAMASHEGU">Lamashegu</option>
                <option value="VITTIN">Vittin Target</option>
                <option value="GUMANI">Gumani</option>
                <option value="KALPOHIN">Kalpohin Estate</option>
                <option value="CENTRAL_MARKET">Tamale Central Market</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                Budget / Rental Rate (GHS GH₵)
              </label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 250 (Optional)"
                className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
              >
                <option value="Immediate">Emergency / Immediate</option>
                <option value="Today">Needed Today</option>
                <option value="Scheduled">Scheduled Date</option>
                <option value="Flexible">Flexible / Discussion</option>
              </select>
            </div>
          </div>

          {/* Photos Dropzone / Link */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Attach Photo / Site Location Image (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Unauthenticated Guest Seller Verification Form */}
          {!session && (
            <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-3">
              <span className="font-extrabold text-stone-800 dark:text-stone-200 block">
                Guest Contact & Instant SMS OTP Validation *
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Master Issahaku"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border rounded-xl outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+233240000000"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border rounded-xl outline-none font-medium"
                  />
                </div>
              </div>

              {/* OTP Simulation */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-stone-400 font-mono">
                  {isOtpVerified ? "✓ Phone Verified via SMS" : "Enter 1234 for instant verification"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isOtpVerified ? (
                    <>
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="1234"
                        className="w-16 p-1.5 text-center bg-white dark:bg-stone-900 border rounded-xl font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-xl border border-emerald-300">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-stone-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Trade Board Notice 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
