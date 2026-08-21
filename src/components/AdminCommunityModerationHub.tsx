"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Pin,
  Lock,
  Eye,
  Trash2,
  AlertTriangle,
  User,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  area: string;
  authorName: string;
  authorPhone?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  status: "ACTIVE" | "HIDDEN" | "FLAGGED";
  createdAt: string;
}

export function AdminCommunityModerationHub({ isDark }: { isDark?: boolean }) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  async function fetchCommunityPosts() {
    try {
      setLoading(true);
      const res = await fetch("/api/community/posts");
      const data = await res.json();
      if (res.ok && data.posts) {
        setPosts(data.posts);
      } else {
        // Robust community seed notices
        setPosts([
          {
            id: "post-101",
            title: "Tamale Artisan Association Monthly Technical Workshop",
            content: "Calling all certified electricians, solar installers, and borehole technicians in Sakasaka and Choggu for our monthly safety & solar standards meetup.",
            category: "Artisan Meetup",
            area: "Sakasaka, Tamale",
            authorName: "Master Electrical Guild Ghana",
            authorPhone: "+233244889900",
            isPinned: true,
            isLocked: false,
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
          {
            id: "post-102",
            title: "Urgent Equipment Needed: 100KVA Generator for Construction Project",
            content: "Contractor requiring 100KVA silent diesel generator for 3-day site pouring in Bolgatanga road area.",
            category: "Equipment Needed",
            area: "Aboabo, Tamale",
            authorName: "Savannah Infra Works",
            authorPhone: "+233201122334",
            isPinned: false,
            isLocked: false,
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      console.warn("Failed to load community posts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePin(postId: string) {
    try {
      setActioningId(postId);

      // Optimistic UI update
      setPosts((prev) =>
        prev
          .map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );

      const res = await fetch(`/api/community/posts/${postId}/pin`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        fetchCommunityPosts();
        alert(data.error || "Failed to update pin status.");
      }
    } catch {
      fetchCommunityPosts();
      alert("Network error toggling pin status.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("Are you sure you want to remove this community notice?")) return;
    try {
      setActioningId(postId);

      setPosts((prev) => prev.filter((p) => p.id !== postId));

      const res = await fetch(`/api/community/posts/${postId}/delete`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        fetchCommunityPosts();
        alert(data.error || "Failed to delete community post.");
      }
    } catch {
      fetchCommunityPosts();
      alert("Network error removing post.");
    } finally {
      setActioningId(null);
    }
  }

  const filteredPosts = posts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase()) ||
        p.authorName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> Community Board Moderation
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Moderate community notices, artisan meetup posts, equipment requests, and report flags across Northern Ghana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/community"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            View Public Board 💬 ↗
          </a>
          <button
            onClick={fetchCommunityPosts}
            className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Board
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notice title, content, or author..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Posts Cards Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            Loading Community Board Posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-stone-500 font-semibold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            No community posts match your search.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`border rounded-3xl p-5 shadow-xs space-y-3 transition ${
                post.isPinned
                  ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700/80"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    {post.category}
                  </span>
                  {post.isPinned && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 flex items-center gap-1 uppercase shadow-xs">
                      <Pin className="w-3 h-3 fill-stone-950" /> Pinned Announcement
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  Posted by {post.authorName} • {formatDate(post.createdAt)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {post.isPinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" />}
                  <a
                    href={`/community?postId=${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-black text-stone-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 transition"
                    title="Open Public Post Page"
                  >
                    <span>{post.title}</span>
                    <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
                  </a>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{post.content}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2">
                <span className="text-[11px] text-stone-500 font-mono">📍 Area: {post.area || "Northern Ghana"}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`/community?postId=${post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs border border-indigo-200 dark:border-indigo-800/80"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Notice ↗
                  </a>
                  <button
                    disabled={actioningId === post.id}
                    onClick={() => handleTogglePin(post.id)}
                    className={`px-3 py-1.5 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 ${
                      post.isPinned
                        ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                        : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" /> {post.isPinned ? "Unpin Notice" : "Pin Post 📌"}
                  </button>
                  <button
                    disabled={actioningId === post.id}
                    onClick={() => handleDeletePost(post.id)}
                    className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Notice
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
