"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  MapPin,
  PlusCircle,
  Users,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Send,
  Upload,
  X,
  Filter,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  Wrench,
  AlertTriangle,
  Flag,
  Briefcase,
  Clock,
  ExternalLink,
  Tag,
  Check,
} from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { formatDate, formatGHS, parseJsonArray } from "@/lib/utils";

const TAMALE_AREAS = [
  { id: "ALL_TAMALE", label: "All Northern Ghana 🇬🇭" },
  { id: "Tamale", label: "Tamale Metro & Environs" },
  { id: "Bolgatanga", label: "Bolgatanga (Upper East)" },
  { id: "Wa", label: "Wa (Upper West)" },
  { id: "Yendi", label: "Yendi & Eastern Corridor" },
  { id: "Damongo", label: "Damongo (Savannah Region)" },
  { id: "Nalerigu", label: "Nalerigu (North East)" },
  { id: "Sakasaka", label: "Sakasaka Hub" },
  { id: "Nyohini", label: "Nyohini" },
  { id: "Choggu", label: "Choggu (Hilltop/Yapala)" },
  { id: "Aboabo", label: "Aboabo Trade Hub" },
  { id: "Dungu", label: "Dungu (UDS Campus/Surroundings)" },
  { id: "Lamashegu", label: "Lamashegu" },
];

const COMMUNITY_CATEGORIES = [
  { id: "ALL", label: "All Discussions 💬" },
  { id: "SERVICE_REQUEST", label: "Urgent Service Calls / Gigs 💼" },
  { id: "EQUIPMENT_RENTAL", label: "Equipment & Tool Rentals 🛠️" },
  { id: "MEETUP", label: "Artisan Meetups 🤝" },
  { id: "ALERT", label: "Grid & Neighborhood Alerts 📢" },
  { id: "SKILL_SHARE", label: "Skill Share & Apprenticeships 🎓" },
  { id: "RECOMMENDATION", label: "Supplier & Spare Parts ⭐️" },
  { id: "LOST_AND_FOUND", label: "Lost & Found / Notices 🔍" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedArea, setSelectedArea] = useState("ALL_TAMALE");
  const [selectedStatus, setSelectedStatus] = useState("OPEN");

  // Create Post Modal / Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("ALERT");
  const [postArea, setPostArea] = useState("Sakasaka");
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [allowDirectCall, setAllowDirectCall] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quote Drawer / Bid Modal state for Service Calls
  const [activeBidRequest, setActiveBidRequest] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  // Comment State
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    fetchCommunityPosts();
  }, [selectedCategory, selectedArea, selectedStatus]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setSession(data.user);
        setGuestName(data.user.name || "");
        setGuestPhone(data.user.phone || "");
      }
    } catch {}
  }

  async function fetchCommunityPosts() {
    try {
      setLoading(true);
      const url = `/api/community?category=${encodeURIComponent(selectedCategory)}&area=${encodeURIComponent(selectedArea)}&status=${encodeURIComponent(selectedStatus)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Handle Photo Upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.url) setPostImages((prev) => [...prev, d.url]);
    } catch {
      alert("Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  // Submit Community Post
  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          category: postCategory,
          area: postArea,
          images: postImages,
          allowWhatsApp,
          allowDirectCall,
          guestName: session ? undefined : guestName,
          guestPhone: session ? undefined : guestPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post.");

      setIsCreateOpen(false);
      setPostTitle("");
      setPostContent("");
      setPostImages([]);
      fetchCommunityPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Upvote / Like
  async function handleToggleUpvote(postId: string) {
    if (!session) {
      alert("Please sign in to upvote posts.");
      return;
    }

    try {
      const res = await fetch("/api/community/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, hasUpvoted: data.hasUpvoted, upvotesCount: data.upvotesCount }
              : p
          )
        );
      }
    } catch (e) {}
  }

  // Handle Comment Submission
  async function handleAddComment(postId: string) {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    if (!session) {
      alert("Please sign in to reply.");
      return;
    }

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text }),
      });

      const data = await res.json();
      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        fetchCommunityPosts();
      }
    } catch (e) {
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  }

  // Toggle Post Resolution Status
  async function handleToggleStatus(postId: string, currentStatus: string) {
    const newStatus = currentStatus === "OPEN" ? "RESOLVED" : "OPEN";
    try {
      const res = await fetch(`/api/community/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchCommunityPosts();
    } catch (e) {}
  }

  // Report Flag Post
  async function handleReportPost(postId: string) {
    const reason = prompt("Why are you reporting this post? (e.g. Spam, Off-topic, Phone scam)");
    if (!reason) return;

    try {
      const res = await fetch(`/api/community/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      alert(data.message || "Report submitted.");
    } catch (e) {}
  }

  // Submit Bid for Syndicated Service Call
  async function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBidRequest || !bidPrice) return;
    setBidLoading(true);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: activeBidRequest.id,
          price: bidPrice,
          completionTime: "Same day",
          message: bidMessage || "I can complete this service call in Tamale.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit bid.");

      alert("Price Quote Submitted Successfully!");
      setActiveBidRequest(null);
      setBidPrice("");
      setBidMessage("");
      fetchCommunityPosts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBidLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-8 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/80 text-purple-300 text-xs font-bold rounded-full mb-2 border border-purple-700">
              <Users className="w-3.5 h-3.5" /> Northern Ghana Trade & Community Ecosystem
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Northern Ghana Community Hub & Trade Board
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Real-time feed connecting local artisans, contractors, suppliers, and residents across Northern Ghana. Explore tool rentals, live service calls, and grid alerts.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 border border-purple-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Notice / Equipment Call</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-stone-800 dark:text-stone-200">Neighborhood Zone:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-bold outline-none text-xs"
              >
                {TAMALE_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    📍 {a.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white font-bold outline-none text-xs"
              >
                <option value="OPEN">Status: Open / Active</option>
                <option value="RESOLVED">Status: Fulfilled / Resolved</option>
                <option value="EXPIRED">Status: Expired</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {COMMUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 border ${
                  selectedCategory === cat.id
                    ? "bg-purple-600 border-purple-500 text-white shadow"
                    : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Community Feed List */}
        {loading ? (
          <div className="text-center py-12 text-stone-500 font-semibold">Loading community discussions & live service calls...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-12 rounded-3xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-900 dark:text-white">No Community Discussions Found</h3>
            <p className="text-stone-500">Be the first to post a notice, equipment call, or service request in this neighborhood!</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow"
            >
              Post Notice Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const parsedImages = parseJsonArray(post.images);
              const isServiceCall = post.category === "SERVICE_REQUEST" || post.serviceRequest;
              const sr = post.serviceRequest;

              // Parse author contact details
              const guestInfo = post.guestContact ? JSON.parse(post.guestContact) : null;
              const authorName =
                post.author?.providerProfile?.businessName ||
                post.author?.name ||
                guestInfo?.name ||
                "Tamale Resident";
              const authorPhone = post.author?.phone || guestInfo?.phone || "";
              const isVerifiedProvider = post.author?.providerProfile?.verificationStatus === "VERIFIED";

              const isOwner = session && session.id === post.authorId;

              return (
                <div
                  key={post.id}
                  className={`bg-white dark:bg-stone-900 border rounded-3xl p-6 shadow-sm space-y-4 transition ${
                    isServiceCall
                      ? "border-emerald-500/80 bg-gradient-to-b from-emerald-950/10 via-white dark:via-stone-900 to-white dark:to-stone-900"
                      : "border-stone-200 dark:border-stone-800"
                  }`}
                >
                  {/* Top Bar: Author, Verification & Category Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0 shadow border border-stone-700">
                        {post.author?.providerProfile?.logoUrl || post.author?.avatarUrl ? (
                          <img
                            src={post.author?.providerProfile?.logoUrl || post.author?.avatarUrl}
                            alt={authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          authorName.charAt(0)
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-stone-900 dark:text-white">{authorName}</h4>
                          {isVerifiedProvider && (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded-md text-[9px] border border-emerald-800 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> VERIFIED ARTISAN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" /> {post.area} &bull; {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Category Badge */}
                      <span className={`px-3 py-1 font-bold rounded-full text-[10px] border ${
                        isServiceCall
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : post.category === "EQUIPMENT_RENTAL"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : post.category === "ALERT"
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : "bg-purple-950 text-purple-300 border-purple-800"
                      }`}>
                        {isServiceCall ? "🛠️ Service Call / Gig" : post.category}
                      </span>

                      {/* Post Status Badge */}
                      <span className={`px-2.5 py-0.5 font-mono text-[9px] font-bold rounded-full uppercase ${
                        post.status === "OPEN"
                          ? "bg-emerald-500 text-white"
                          : post.status === "RESOLVED"
                          ? "bg-purple-600 text-white"
                          : "bg-stone-700 text-stone-300"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-1.5">
                    <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2">
                      <span>{post.title}</span>
                    </h3>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Syndicated Service Call Snapshot Card */}
                  {sr && (
                    <div className="p-4 bg-stone-900 text-white rounded-2xl border border-emerald-800/80 space-y-3 shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs text-emerald-400 uppercase tracking-wide">
                            Live Gig Snapshot ({sr.service?.name || "Service Request"})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          Urgency: <strong className="text-amber-400">{sr.urgency}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Budget Range</span>
                          <span className="text-base font-black text-emerald-400">
                            {sr.budgetMin || sr.budgetMax
                              ? `GH₵ ${sr.budgetMin || 0} - GH₵ ${sr.budgetMax || "Open"}`
                              : "Open to Bids"}
                          </span>
                        </div>
                        <span className="text-xs text-stone-300 font-semibold bg-stone-800 px-3 py-1 rounded-xl border border-stone-700">
                          {sr.quotes?.length || 0} Provider Bids Submitted
                        </span>
                      </div>

                      {/* Direct Actions for Service Call */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800">
                        <button
                          onClick={() => setActiveBidRequest(sr)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5 transition"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>I Can Do This (Submit Bid)</span>
                        </button>

                        <Link
                          href={`/requests/${sr.id}`}
                          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold rounded-xl border border-stone-700 flex items-center gap-1"
                        >
                          <span>Full Job Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Optional Photos */}
                  {parsedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {parsedImages.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Attachment"
                          className="h-32 w-full object-cover rounded-xl border border-stone-200 dark:border-stone-800"
                        />
                      ))}
                    </div>
                  )}

                  {/* Direct Contact CTAs & Social Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* One-Click WhatsApp CTA */}
                      {post.allowWhatsApp && authorPhone && (
                        <a
                          href={`https://wa.me/${authorPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, I saw your post on Tamale Community Hub: "${post.title}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Direct Call CTA */}
                      {post.allowDirectCall && authorPhone && (
                        <a
                          href={`tel:${authorPhone}`}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl flex items-center gap-1.5 border border-stone-700"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Direct Call</span>
                        </a>
                      )}

                      {/* Upvote Button */}
                      <button
                        onClick={() => handleToggleUpvote(post.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                          post.hasUpvoted
                            ? "bg-purple-600 text-white"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.upvotesCount}</span>
                      </button>

                      <span className="text-stone-500 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                        <span>{post.commentsCount}</span>
                      </span>
                    </div>

                    {/* Report & Resolution Controls */}
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <button
                          onClick={() => handleToggleStatus(post.id, post.status)}
                          className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 font-bold rounded-xl text-[10px]"
                        >
                          {post.status === "OPEN" ? "Mark as Resolved ✓" : "Re-open Post"}
                        </button>
                      )}

                      <button
                        onClick={() => handleReportPost(post.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg transition"
                        title="Flag / Report Post"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Threaded Comments Section */}
                  <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl space-y-3 border border-stone-100 dark:border-stone-800">
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments.map((cm: any) => (
                          <div key={cm.id} className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-stone-900 dark:text-white">
                                {cm.author?.providerProfile?.businessName || cm.author?.name}
                              </span>
                              <span className="text-[9px] text-stone-400">{formatDate(cm.createdAt)}</span>
                            </div>
                            <p className="text-stone-600 dark:text-stone-300">{cm.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a community reply..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        className="flex-1 p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={submittingComment[post.id]}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Post Community Notice or Equipment Call</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Post Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scaffolding Needed in Choggu / Weekly Skill Share"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Category Topic</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="ALERT">Grid & Neighborhood Alert 📢</option>
                    <option value="EQUIPMENT_RENTAL">Equipment & Tool Rental 🛠️</option>
                    <option value="MEETUP">Artisan Meetup 🤝</option>
                    <option value="SKILL_SHARE">Skill Share 🎓</option>
                    <option value="RECOMMENDATION">Supplier & Parts ⭐️</option>
                    <option value="LOST_AND_FOUND">Lost & Found 🔍</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Neighborhood Zone</label>
                  <select
                    value={postArea}
                    onChange={(e) => setPostArea(e.target.value)}
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold outline-none"
                  >
                    {TAMALE_AREAS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!session && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-800/80 rounded-xl border border-stone-700">
                  <div>
                    <label className="block font-bold text-stone-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 text-white rounded-lg outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-300 mb-1">WhatsApp Phone</label>
                    <input
                      type="text"
                      placeholder="+233..."
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2.5 bg-stone-900 border border-stone-700 text-white rounded-lg outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-300 mb-1">Content / Message</label>
                <textarea
                  rows={4}
                  placeholder="Share details, dates, equipment specs, or neighborhood notice..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              {/* Direct Contact Options */}
              <div className="p-3 bg-stone-850 border border-stone-800 rounded-xl flex items-center justify-between gap-4">
                <span className="font-bold text-stone-300">Contact Preferences:</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-stone-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowWhatsApp}
                      onChange={(e) => setAllowWhatsApp(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <span>WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-stone-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowDirectCall}
                      onChange={(e) => setAllowDirectCall(e.target.checked)}
                      className="accent-purple-500 rounded"
                    />
                    <span>Direct Call</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-stone-300 mb-1">Attach Photo (Optional)</label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-stone-800 border border-stone-700 hover:bg-stone-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>{uploadingImage ? "Uploading..." : "Add Photo"}</span>
                    <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </label>
                  {postImages.length > 0 && (
                    <span className="text-emerald-400 font-bold">{postImages.length} photo attached</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-stone-400 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow transition"
                >
                  {submitting ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provider Bid Drawer Modal for Syndicated Service Call */}
      {activeBidRequest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>Submit Provider Price Quote (GH₵)</span>
              </h3>
              <button onClick={() => setActiveBidRequest(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
              <h4 className="font-bold text-stone-200">{activeBidRequest.title}</h4>
              <p className="text-[11px] text-stone-400 line-clamp-2">{activeBidRequest.description}</p>
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Your Price Quote (GH₵)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-emerald-400 font-black text-lg outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Turnaround & Work Approach</label>
                <textarea
                  rows={3}
                  placeholder="Explain your approach, availability, and guaranteed work..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button type="button" onClick={() => setActiveBidRequest(null)} className="px-4 py-2 text-stone-400 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bidLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition"
                >
                  {bidLoading ? "Submitting Bid..." : "Send Quote to Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
