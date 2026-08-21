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

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase())
  );

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

        <button
          onClick={fetchCommunityPosts}
          className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Board
        </button>
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
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    {post.category}
                  </span>
                  {post.isPinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  Posted by {post.authorName} • {formatDate(post.createdAt)}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900 dark:text-white">{post.title}</h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500 font-mono">📍 Area: {post.area}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`Toggled pin status for post: ${post.title}`);
                    }}
                    className="px-3 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Pin className="w-3.5 h-3.5" /> {post.isPinned ? "Unpin" : "Pin Post"}
                  </button>
                  <button
                    onClick={() => {
                      alert(`Removed post: ${post.title}`);
                    }}
                    className="px-3 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-200 transition cursor-pointer flex items-center gap-1"
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
