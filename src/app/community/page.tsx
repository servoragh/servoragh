"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  ThumbsUp,
  MessageCircle,
  Phone,
  Zap,
  Wrench,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertTriangle,
  Send,
  Users,
  CheckCircle2,
  X,
  Share2,
} from "lucide-react";
import { CommunityPostItem, RegionZone, PostCategory, ItemStatus } from "@/lib/communityTypes";
import { PostNoticeModal } from "@/components/PostNoticeModal";
import { formatGHS, formatDate } from "@/lib/utils";

export default function CommunityHubPage() {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<RegionZone | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "ALL">("ALL_DISCUSSIONS");
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | "ALL">("OPEN_ACTIVE");

  // Post Submission Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Threaded Comments Drawer State
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commenting, setCommenting] = useState(false);

  const [targetPostId, setTargetPostId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("postId");
      if (pid) setTargetPostId(pid);
    }
    const timer = setTimeout(() => {
      fetchCommunityPosts();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedZone, selectedCategory, selectedStatus, search]);

  async function fetchCommunityPosts() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedZone !== "ALL") params.set("zone", selectedZone);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/community/posts?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.posts) {
        setPosts(data.posts);
      }
    } catch (e) {
      console.error("Failed to fetch community posts:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchCommunityPosts();
  }

  async function handleUpvote(postId: string) {
    try {
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, upvotesCount: data.upvotesCount, hasUpvoted: true }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddComment(postId: string) {
    if (!commentInput.trim()) return;
    try {
      setCommenting(true);
      const res = await fetch(`/api/community/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setCommentInput("");
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  commentsCount: p.commentsCount + 1,
                  comments: [...(p.comments || []), data.comment],
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommenting(false);
    }
  }

  const categoryPills: { id: PostCategory | "ALL"; label: string; icon: string }[] = [
    { id: "ALL_DISCUSSIONS", label: "All Discussions 🗨️", icon: "🗨️" },
    { id: "SERVICE_CALL", label: "Urgent Service Calls / Gigs 💼", icon: "💼" },
    { id: "TOOL_RENTAL", label: "Equipment & Tool Rentals 🛠️", icon: "🛠️" },
    { id: "ARTISAN_MEETUP", label: "Artisan Meetups 🤝", icon: "🤝" },
    { id: "GRID_ALERT", label: "Grid & Neighborhood Alerts 📢", icon: "📢" },
    { id: "SKILL_SHARE", label: "Skill Share & Apprenticeships 🎓", icon: "🎓" },
    { id: "RECOMMENDATION", label: "Supplier Recommendations ⭐️", icon: "⭐️" },
    { id: "LOST_AND_FOUND", label: "Lost & Found 🔍", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 1. TOP ANNOUNCEMENT BANNER */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-stone-900 text-white rounded-2xl p-3 sm:p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center font-extrabold text-amber-300 text-sm">
              ✨
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Monetize your skills, offer local services & get Ghana Card verified in Northern Ghana!
            </span>
          </div>
          <Link
            href="/register"
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition shadow cursor-pointer shrink-0"
          >
            Become Verified Merchant →
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. HERO COMMUNITY BANNER */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 text-[11px] font-extrabold rounded-full border border-amber-500/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Northern Ghana Trade & Community Ecosystem
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Northern Ghana Community Hub & Trade Board 💬
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-medium">
              Hyper-local real-time feed connecting artisans, suppliers, contractors, and residents across Tamale, Sakasaka, Choggu, Nyohini, and Aboabo for equipment rentals, live service calls, grid alerts, and trade meetups.
            </p>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-stone-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/10 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Post Notice / Equipment Call</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. FILTERING & CONTROL TOOLBAR */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
          {/* Top Filter Bar: Zone, Status & Search */}
          <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trade notices (e.g. generator rental, solar wiring, Nyohini alert)..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </form>

            {/* Neighborhood Zone Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <MapPin className="w-4 h-4 text-rose-500" />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value as any)}
                className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-bold outline-none"
              >
                <option value="ALL">All Northern Ghana GH</option>
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
                <option value="DATOYILI">Datoyili</option>
                <option value="BILPELA">Bilpela</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-bold outline-none"
              >
                <option value="OPEN_ACTIVE">Status: Open / Active 🟢</option>
                <option value="RESOLVED">Resolved / Completed ⚪</option>
                <option value="EXPIRED">Expired 🔴</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>
          </div>

          {/* Scrollable Category Pill Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {categoryPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-3.5 py-2 rounded-2xl transition cursor-pointer shrink-0 ${
                  selectedCategory === pill.id
                    ? "bg-amber-500 text-stone-950 font-black shadow-xs"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. FEED STATES & CARD PRESENTATION */}
        {/* ------------------------------------------------------------- */}
        {loading ? (
          <div className="py-20 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            Fetching Trade & Community Feed...
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                No Community Discussions Found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Be the first to post a service call, equipment rental request, or neighborhood alert in this area!
              </p>
            </div>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
            >
              + Post Notice Now
            </button>
          </div>
        ) : (
          /* Active Post Cards Feed */
          <div className="space-y-4">
            {posts.map((post) => {
              const isTargeted = targetPostId === post.id;
              return (
                <div
                  key={post.id}
                  id={`post-${post.id}`}
                  className={`border rounded-3xl p-5 sm:p-6 shadow-xs transition duration-300 space-y-4 ${
                    isTargeted
                      ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/50 shadow-lg"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:shadow-md"
                  }`}
                >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 text-stone-950 font-black flex items-center justify-center text-sm shrink-0">
                        {post.authorName[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-stone-900 dark:text-white">
                          {post.authorName}
                        </span>
                        {post.isVerifiedArtisan && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <MapPin className="w-3 h-3" /> {post.zone}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  {post.urgency && (
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        post.urgency === "Immediate"
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 animate-pulse"
                          : post.urgency === "Today"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-stone-500/20 text-stone-600 dark:text-stone-400 border border-stone-500/30"
                      }`}
                    >
                      {post.urgency}
                    </span>
                  )}
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                      {post.title}
                    </h2>
                    {post.budget !== undefined && post.budget !== null && (
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs shrink-0 border border-emerald-300">
                        Budget: {formatGHS(post.budget)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Photo Grid Attachment */}
                {post.photos && post.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="w-32 h-32 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100"
                      >
                        <img src={photo} alt="Attached" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Interaction Bar */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(post.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        post.hasUpvoted
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotesCount} Upvotes</span>
                    </button>

                    {/* Comments Toggle Button */}
                    <button
                      onClick={() =>
                        setExpandedCommentsPostId(
                          expandedCommentsPostId === post.id ? null : post.id
                        )
                      }
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} Comments</span>
                    </button>
                  </div>

                  {/* Contact Outreach Actions */}
                  <div className="flex items-center gap-2">
                    {post.authorWhatsApp && (
                      <a
                        href={`https://wa.me/${post.authorWhatsApp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                    {post.authorPhone && (
                      <a
                        href={`tel:${post.authorPhone}`}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded Threaded Comments Drawer */}
                {expandedCommentsPostId === post.id && (
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Threaded Discussion Comments
                    </span>

                    {/* Add Comment Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Write a response or offer equipment..."
                        className="flex-1 p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs outline-none font-medium"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={commenting || !commentInput.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-emerald-600 dark:text-emerald-400">{c.authorName}</span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {formatDate(c.createdAt)}
                              </span>
                            </div>
                            <p className="text-stone-700 dark:text-stone-300 font-medium">{c.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-400 text-xs italic py-1">No comments posted yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Post Notice Submission Modal */}
      <PostNoticeModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={fetchCommunityPosts}
      />
    </div>
  );
}
