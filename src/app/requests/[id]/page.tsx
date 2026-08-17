"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, ArrowLeft, Send, CheckCircle2, Star, ShieldCheck, AlertCircle, PhoneCall, Navigation, Lock, FileText, Video, Image as ImageIcon } from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { TrustBadge } from "@/components/TrustBadge";
import { formatGHS, formatDate } from "@/lib/utils";

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params?.id as string;

  const [req, setReq] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit quote state
  const [quotePrice, setQuotePrice] = useState("");
  const [completionTime, setCompletionTime] = useState("Same day");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Chat state
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
      fetchSession();
    }
  }, [requestId]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setSession(data.user);
    } catch (e) {}
  }

  async function fetchRequestDetail() {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request not found.");
      setReq(data.request);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quotePrice || !quoteMsg) return;

    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          price: quotePrice,
          completionTime,
          message: quoteMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quote.");

      setQuotePrice("");
      setQuoteMsg("");
      fetchRequestDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleAcceptQuote(quoteId: string) {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      alert(`Quote accepted! Customer address & direct phone unlocked: ${data.providerContact || "Available in chat"}`);
      fetchRequestDetail();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSendMessage(conversationId: string) {
    if (!chatMessage.trim()) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, text: chatMessage }),
      });
      if (res.ok) {
        setChatMessage("");
        fetchRequestDetail();
      }
    } catch (e) {}
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-stone-500">Loading request details...</div>;
  }

  if (error || !req) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Job Request Not Found</h2>
        <Link href="/requests" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Requests
        </Link>
      </div>
    );
  }

  const isCustomerOwner = session?.id === req.customerId;
  const isProvider = session?.role === "PROVIDER" || session?.role === "ADMIN";
  const tagsList = (() => {
    try {
      return JSON.parse(req.tags || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Requests Board
        </Link>

        {/* Job Header */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                {req.service?.name || req.customCategory || "Custom Service"}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                req.urgency === "EMERGENCY_ASAP"
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "bg-amber-950 text-amber-300 border border-amber-800"
              }`}>
                Urgency: {req.urgency === "EMERGENCY_ASAP" ? "🚨 EMERGENCY (ASAP)" : req.urgency}
              </span>
              {req.isLiveTrackingOptIn && (
                <span className="px-3 py-1 bg-purple-950 text-purple-300 text-xs font-bold rounded-full border border-purple-800 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-purple-400" /> Live GPS Tracking Opt-In
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-stone-400">
              Status: <strong className="text-emerald-400 font-bold">{req.status}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
            {req.title}
          </h1>

          {/* Location & Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-4 h-4" />
              <span>{req.landmark || req.location?.area || "Tamale"}</span>
            </div>
            {req.streetAddress ? (
              <div className="text-stone-300 font-mono">
                Address: {req.streetAddress}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-stone-400 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Exact address masked for privacy until quote accepted</span>
              </div>
            )}
            <span>Posted by {req.customer?.name} &bull; {formatDate(req.createdAt)}</span>
          </div>

          {/* Budget & Pricing Card */}
          <div className="p-4 bg-stone-100 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Pricing Structure & Budget</span>
              <span className="text-xl font-black text-emerald-400 block">
                {req.budgetMin || req.budgetMax
                  ? `GH₵ ${req.budgetMin || 0} - GH₵ ${req.budgetMax || "Open"}`
                  : "Open to Bids / Quotes"}
              </span>
            </div>
            {tagsList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tagsList.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-stone-800 text-stone-300 text-[10px] font-bold rounded-lg border border-stone-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line">
            {req.description}
          </div>

          {/* Media Attachments */}
          {req.media && req.media.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Diagnostic Attachments & Media:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {req.media.map((m: any) => (
                  <a
                    key={m.id}
                    href={m.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-stone-800 border border-stone-700 rounded-xl hover:border-emerald-500 transition flex items-center gap-2"
                  >
                    {m.mediaType === "VIDEO" ? (
                      <Video className="w-5 h-5 text-purple-400" />
                    ) : m.mediaType === "DOCUMENT" ? (
                      <FileText className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="truncate text-stone-300 font-medium text-xs">{m.fileName || "View Attachment"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Share Request Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <WhatsAppShareButton
              variant="share"
              text={`Tamale Job Request: "${req.title}" in ${req.landmark || req.location?.area}. Artisans, view & submit quotes here: https://servora.vercel.app/requests/${req.id}`}
              label="Share Request to WhatsApp Artisans"
              className="text-xs py-2 px-4"
            />
          </div>
        </div>

        {/* Section 2: Bids & Quotes Received */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Provider Quotes Received ({req.quotes?.length || 0})
            </h2>

            {req.quotes?.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
                No provider quotes submitted yet. Verified artisans in Tamale will reply shortly.
              </div>
            ) : (
              <div className="space-y-4">
                {req.quotes.map((q: any) => (
                  <div
                    key={q.id}
                    className={`bg-white dark:bg-stone-900 border rounded-3xl p-6 shadow-sm ${
                      q.status === "ACCEPTED"
                        ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-base">
                          {q.provider?.providerProfile?.businessName || q.provider?.name}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {q.provider?.name} &bull; {q.completionTime}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-600 block">
                          {formatGHS(q.price)}
                        </span>
                        {q.status === "ACCEPTED" && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                            ACCEPTED QUOTE
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 mb-4 bg-stone-50 dark:bg-stone-800 p-3 rounded-xl">
                      {q.message}
                    </p>

                    {/* Customer Action or Provider Direct Phone */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                      {isCustomerOwner && q.status === "PENDING" && (
                        <button
                          onClick={() => handleAcceptQuote(q.id)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          Accept Quote & Contact Artisan
                        </button>
                      )}

                      {q.status === "ACCEPTED" && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                          <PhoneCall className="w-4 h-4" />
                          <span>Direct Phone: {q.provider?.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Submit Quote Sidebar for Providers */}
          <div className="lg:col-span-5">
            {isProvider ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">
                  Submit a Provider Quote
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Give a fair, transparent estimate in Ghanaian Cedi (GH₵).
                </p>

                <form onSubmit={handleQuoteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Estimated Price (GH₵)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none font-bold text-emerald-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Estimated Completion Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Same day (2 hours)"
                      value={completionTime}
                      onChange={(e) => setCompletionTime(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Quote Note / Approach
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain your approach, tools needed, and availability..."
                      value={quoteMsg}
                      onChange={(e) => setQuoteMsg(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs outline-none text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={quoteLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    {quoteLoading ? "Submitting Quote..." : "Send Quote to Customer"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800">
                <h4 className="font-bold text-base mb-2">Are you a verified service artisan in Tamale?</h4>
                <p className="text-xs text-stone-300 mb-4">
                  Log in as a provider to submit quotes for jobs in Sakasaka, Nyohini, and across Tamale.
                </p>
                <Link
                  href="/login"
                  className="block w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl text-center"
                >
                  Log In to Submit Quote
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
