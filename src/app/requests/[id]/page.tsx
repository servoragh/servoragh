"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Clock, ArrowLeft, Send, CheckCircle2, Star, ShieldCheck, AlertCircle,
  PhoneCall, Navigation, Lock, FileText, Video, Image as ImageIcon, Heart,
  MessageCircle, Share2, Eye, Zap, CheckCircle, XCircle, Users, ExternalLink,
  BadgeCheck, Timer, ThumbsUp, ChevronRight, Loader2,
} from "lucide-react";
import { formatGHS, formatDate } from "@/lib/utils";

// ─────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────
function UrgencyBadge({ urgency }: { urgency: string }) {
  const map: Record<string, { label: string; cls: string; icon: string }> = {
    EMERGENCY_ASAP: { label: "🚨 Emergency", cls: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700", icon: "" },
    SAME_DAY:       { label: "⚡ Same Day",   cls: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700", icon: "" },
    SCHEDULED:      { label: "📅 Scheduled", cls: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700", icon: "" },
    FLEXIBLE:       { label: "🌱 Flexible",  cls: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700", icon: "" },
  };
  const u = map[urgency] || { label: urgency, cls: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700", icon: "" };
  return <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${u.cls}`}>{u.label}</span>;
}

function StatusBanner({ status }: { status: string }) {
  if (status === "IN_PROGRESS" || status === "OFFER_ACCEPTED") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-2xl">
        <Timer className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="font-black text-amber-800 dark:text-amber-300 text-xs">Job In Progress — Taken</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-400">This request has been accepted and is currently being handled by an artisan.</p>
        </div>
      </div>
    );
  }
  if (status === "COMPLETED") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 rounded-2xl">
        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        <p className="font-black text-teal-800 dark:text-teal-300 text-xs">Job Completed ✅</p>
      </div>
    );
  }
  if (status === "SUSPENDED" || status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-700 rounded-2xl">
        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
        <p className="font-black text-red-800 dark:text-red-300 text-xs">Request {status}</p>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────
export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string;

  const [req, setReq] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quote form
  const [quotePrice, setQuotePrice] = useState("");
  const [completionTime, setCompletionTime] = useState("Same day");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Comments + likes
  const [comments, setComments] = useState<any[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [communityPostId, setCommunityPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [guestCommentName, setGuestCommentName] = useState("");

  // Media lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Polled refresh interval
  const refreshRef = useRef<any>(null);

  const fetchRequestDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found.");
      setReq(data.request);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/requests/${requestId}/comments`);
    const data = await res.json();
    if (res.ok) {
      setComments(data.comments || []);
      setLikesCount(data.likes || 0);
      setCommunityPostId(data.communityPostId);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
      fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setSession(d.user); });
      fetchComments();

      // Auto-refresh every 15s for real-time quote updates
      refreshRef.current = setInterval(() => {
        fetchRequestDetail();
        fetchComments();
      }, 15000);
    }
    return () => clearInterval(refreshRef.current);
  }, [requestId, fetchRequestDetail, fetchComments]);

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quotePrice || !quoteMsg) return;
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, price: quotePrice, completionTime, message: quoteMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote.");
      setQuotePrice(""); setQuoteMsg(""); setQuoteSuccess(true);
      fetchRequestDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleQuoteAction(quoteId: string, action: "ACCEPT" | "PROVIDER_CONFIRM" | "REJECT") {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      fetchRequestDetail();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleLike() {
    const res = await fetch(`/api/requests/${requestId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "LIKE" }),
    });
    const d = await res.json();
    if (res.ok) {
      setLiked(d.liked);
      setLikesCount((prev) => d.liked ? prev + 1 : prev - 1);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "COMMENT", content: commentText, guestName: guestCommentName || "Anonymous" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCommentText("");
      fetchComments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCommentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-stone-500 text-sm">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !req) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Request Not Found</h2>
          <Link href="/requests" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.id === req.customerId;
  const isProvider = session?.role === "PROVIDER" || session?.role === "ADMIN";
  const isTaken = ["IN_PROGRESS", "OFFER_ACCEPTED", "COMPLETED"].includes(req.status);
  const myQuote = req.quotes?.find((q: any) => q.providerId === session?.id);
  const acceptedQuote = req.quotes?.find((q: any) => q.status === "ACCEPTED" || q.status === "CUSTOMER_ACCEPTED");
  const imageMedia = (req.media || []).filter((m: any) => m.mediaType === "IMAGE");
  const otherMedia = (req.media || []).filter((m: any) => m.mediaType !== "IMAGE");

  const tagsList = (() => { try { return JSON.parse(req.tags || "[]"); } catch { return []; } })();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white">

      {/* ── Lightbox ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
        </div>
      )}

      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/requests" className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 hover:text-emerald-600 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Requests Board
          </Link>
          <div className="flex items-center gap-2">
            {/* Share */}
            <button onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition text-stone-600 dark:text-stone-300">
              <Share2 className="w-4 h-4" />
            </button>
            {/* Like */}
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                liked ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950"
              }`}>
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ════════════════════ LEFT / MAIN ════════════════════ */}
        <div className="lg:col-span-7 space-y-6">

          {/* ── Hero Card ── */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">

            {/* Image gallery (if any) */}
            {imageMedia.length > 0 && (
              <div className={`grid gap-1 ${imageMedia.length === 1 ? "grid-cols-1" : imageMedia.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {imageMedia.slice(0, 3).map((m: any, i: number) => (
                  <div key={m.id} className="relative aspect-video overflow-hidden cursor-zoom-in group bg-stone-100 dark:bg-stone-800" onClick={() => setLightbox(m.mediaUrl)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.mediaUrl} alt="Request media" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {i === 2 && imageMedia.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-black text-xl">+{imageMedia.length - 3}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Status banner */}
              <StatusBanner status={req.status} />

              {/* Category + Urgency badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {req.service?.name || req.customCategory || "Custom Service"}
                </span>
                <UrgencyBadge urgency={req.urgency} />
                {req.isLiveTrackingOptIn && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> GPS Tracking
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  req.status === "OPEN" || req.status === "PUBLISHED" ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700" :
                  isTaken ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700" :
                  "bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700"
                }`}>
                  {isTaken ? "🔒 Taken" : "🟢 Open"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">{req.title}</h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {req.landmark || req.location?.area || "Tamale"}
                </span>
                {!req.streetAddress && (
                  <span className="flex items-center gap-1 text-stone-400">
                    <Lock className="w-3 h-3 text-amber-500" /> Exact address private
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Posted by <strong className="text-stone-700 dark:text-stone-300">{req.customer?.name || req.guestName}</strong>
                </span>
                <span>{formatDate(req.createdAt)}</span>
              </div>

              {/* GPS link */}
              {req.latitude && req.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  GPS: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)} — Open in Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Budget */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-0.5">Budget</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {req.budgetMin || req.budgetMax
                      ? `GH₵ ${req.budgetMin || 0} – ${req.budgetMax || "Open"}`
                      : "Open to Quotes"}
                  </span>
                </div>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagsList.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 rounded-lg text-[10px] font-mono">#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {req.description || "No additional description provided."}
              </div>

              {/* Other media (video / PDF) */}
              {otherMedia.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {otherMedia.map((m: any) => (
                    <a key={m.id} href={m.mediaUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium hover:border-emerald-400 transition">
                      {m.mediaType === "VIDEO" ? <Video className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-amber-500" />}
                      {m.fileName || "Attachment"}
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quotes / Offers ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">
                Price Offers
                <span className="ml-2 px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-xs font-bold">
                  {req.quotes?.length || 0}
                </span>
              </h2>
              {req.quotes?.length > 0 && (
                <p className="text-xs text-stone-400">Refreshes every 15s</p>
              )}
            </div>

            {(!req.quotes || req.quotes.length === 0) ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 text-center space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-stone-300" />
                <p className="font-bold text-stone-500">No offers yet</p>
                <p className="text-xs text-stone-400">Local artisans will see this and send price offers shortly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {req.quotes.map((q: any) => {
                  const isAccepted = q.status === "ACCEPTED";
                  const isCustomerAccepted = q.status === "CUSTOMER_ACCEPTED";
                  const isPending = q.status === "PENDING";
                  const isRejected = q.status === "REJECTED";
                  const isMyQuote = q.providerId === session?.id;

                  return (
                    <div key={q.id} className={`bg-white dark:bg-stone-900 border rounded-3xl p-5 shadow-sm transition ${
                      isAccepted ? "border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20" :
                      isCustomerAccepted ? "border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20" :
                      isRejected ? "border-stone-200 dark:border-stone-800 opacity-50" :
                      "border-stone-200 dark:border-stone-800"
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        {/* Provider info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 text-white flex items-center justify-center font-black text-base shrink-0">
                            {(q.provider?.providerProfile?.businessName || q.provider?.name || "A").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-sm text-stone-900 dark:text-white">
                                {q.provider?.providerProfile?.businessName || q.provider?.name}
                              </span>
                              {q.provider?.providerProfile?.verificationStatus === "VERIFIED" && (
                                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {isAccepted && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full">CONFIRMED ✓</span>}
                              {isCustomerAccepted && <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full">ACCEPTED — Awaiting Provider</span>}
                              {isMyQuote && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black rounded-full border border-blue-300 dark:border-blue-700">Your Offer</span>}
                            </div>
                            <p className="text-[11px] text-stone-500">
                              {q.provider?.name} · ⏱ {q.completionTime}
                              {q.provider?.providerProfile?.ratingAverage > 0 && ` · ⭐ ${q.provider.providerProfile.ratingAverage.toFixed(1)}`}
                            </p>
                          </div>
                        </div>
                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{formatGHS(q.price)}</span>
                          {isRejected && <span className="text-[10px] text-stone-400 font-bold">DECLINED</span>}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="mt-3 text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 p-3 rounded-xl leading-relaxed">{q.message}</p>

                      {/* Actions */}
                      {isAccepted && (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-black text-emerald-800 dark:text-emerald-300">Job confirmed by both parties!</p>
                            <p className="text-emerald-700 dark:text-emerald-400">
                              Direct contact: <a href={`tel:${q.provider?.phone}`} className="font-black underline">{q.provider?.phone}</a>
                            </p>
                          </div>
                          <a href={`tel:${q.provider?.phone}`} className="ml-auto px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5" /> Call
                          </a>
                        </div>
                      )}

                      {isCustomerAccepted && isMyQuote && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-amber-700 dark:text-amber-300 font-bold text-center">Customer accepted your offer! Confirm you're taking the job:</p>
                          <button onClick={() => handleQuoteAction(q.id, "PROVIDER_CONFIRM")}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition">
                            <CheckCircle2 className="w-4 h-4" /> Yes, I'll Take This Job!
                          </button>
                        </div>
                      )}

                      {isOwner && isPending && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleQuoteAction(q.id, "ACCEPT")}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
                            <ThumbsUp className="w-3.5 h-3.5" /> Accept This Offer
                          </button>
                          <button onClick={() => handleQuoteAction(q.id, "REJECT")}
                            className="px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950 text-stone-500 hover:text-red-600 font-bold text-xs rounded-xl cursor-pointer transition">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Comments Section ── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="font-black text-sm">Comments</h3>
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-full text-[11px] font-bold text-stone-500">{comments.length}</span>
            </div>

            {/* Comment list */}
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {(c.author?.name || c.guestName || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-xs text-stone-900 dark:text-white">{c.author?.name || c.guestName || "Anonymous"}</span>
                      <span className="text-[10px] text-stone-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-3 py-2 rounded-xl rounded-tl-none">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment form */}
            <form onSubmit={handleComment} className="px-5 pb-4 space-y-2 border-t border-stone-100 dark:border-stone-800 pt-3">
              {!session && (
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={guestCommentName}
                  onChange={(e) => setGuestCommentName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none"
                />
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={session ? "Add a comment..." : "Comment as guest..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none focus:border-emerald-500 transition"
                  required
                />
                <button type="submit" disabled={commentLoading}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs cursor-pointer transition disabled:opacity-60">
                  {commentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ════════════════════ RIGHT / SIDEBAR ════════════════════ */}
        <div className="lg:col-span-5 space-y-5">

          {/* ── Submit Quote (provider) ── */}
          {isProvider && !myQuote && !isTaken ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm sticky top-20">
              <div className="p-5 bg-gradient-to-br from-emerald-700 to-teal-900 text-white">
                <h3 className="font-black text-base">Send a Price Offer</h3>
                <p className="text-emerald-200 text-xs mt-0.5">Give a fair, transparent price in GH₵</p>
              </div>

              {quoteSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-black text-stone-900 dark:text-white">Offer Sent! 🎉</p>
                  <p className="text-xs text-stone-500">The customer will be notified and can accept your offer.</p>
                  <button onClick={() => setQuoteSuccess(false)} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">Send another offer</button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="p-5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">Your Price (GH₵) *</label>
                    <input type="number" placeholder="e.g. 120" value={quotePrice} onChange={e => setQuotePrice(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-black text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500 transition" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">Completion Time</label>
                    <input type="text" placeholder="e.g. Same day (2 hours)" value={completionTime} onChange={e => setCompletionTime(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1">Your Pitch / Note *</label>
                    <textarea rows={3} placeholder="Describe your approach, tools, experience..." value={quoteMsg} onChange={e => setQuoteMsg(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none focus:border-emerald-500 transition resize-none" required />
                  </div>
                  <button type="submit" disabled={quoteLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60">
                    {quoteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {quoteLoading ? "Sending..." : "Send Offer to Customer"}
                  </button>
                </form>
              )}
            </div>
          ) : myQuote ? (
            <div className="bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> You submitted an offer</p>
              <p className="text-2xl font-black text-emerald-600">{formatGHS(myQuote.price)}</p>
              <p className="text-xs text-stone-500 mt-1">{myQuote.message}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-stone-400">Status: <span className={`${myQuote.status === "CUSTOMER_ACCEPTED" ? "text-amber-600" : myQuote.status === "ACCEPTED" ? "text-emerald-600" : "text-stone-500"}`}>{myQuote.status}</span></p>
            </div>
          ) : !isProvider && !isOwner ? (
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="font-black text-base mb-1">Are you a local artisan?</h4>
              <p className="text-xs text-slate-300 mb-4">Log in as a provider to send price offers for jobs in Tamale.</p>
              <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow transition">
                Log In to Send Offer <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/register" className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-2xl transition">
                Register as Artisan / Business
              </Link>
            </div>
          ) : null}

          {/* ── Request Stats Card ── */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-black text-sm text-stone-700 dark:text-stone-300">Request Details</h4>
            {[
              { icon: <Eye className="w-4 h-4 text-stone-400" />, label: "Quotes received", value: req.quotes?.length || 0 },
              { icon: <Heart className="w-4 h-4 text-rose-400" />, label: "Likes", value: likesCount },
              { icon: <MessageCircle className="w-4 h-4 text-blue-400" />, label: "Comments", value: comments.length },
              { icon: <Clock className="w-4 h-4 text-amber-400" />, label: "Posted", value: formatDate(req.createdAt) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-stone-500">{icon}{label}</span>
                <span className="text-xs font-bold text-stone-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* ── Share ── */}
          <div className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-3xl p-5 text-white space-y-3">
            <p className="font-black text-sm">Know a skilled artisan?</p>
            <p className="text-emerald-200 text-xs">Share this job with someone who can help and earn a referral tip!</p>
            <button
              onClick={() => {
                const text = `Job Request: "${req.title}" in ${req.landmark || "Tamale"}. Send a price offer here: ${window.location.href}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="w-full py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer">
              <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
