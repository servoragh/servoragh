"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShoppingBag,
  Wrench,
  Building2,
  Users,
  X,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";

interface SearchHit {
  id: string;
  entityType: "product" | "rental" | "artisan" | "community";
  title: string;
  slug?: string;
  subtitle: string;
  category: string;
  zone: string;
  priceDisplay?: string;
  image?: string;
  isVerified?: boolean;
  score: number;
  highlightedTitle: string;
}

export function GlobalSearchCommandModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "products" | "artisans" | "rentals" | "community">("all");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<{
    all: SearchHit[];
    products: SearchHit[];
    artisans: SearchHit[];
    rentals: SearchHit[];
    community: SearchHit[];
  }>({
    all: [],
    products: [],
    artisans: [],
    rentals: [],
    community: [],
  });
  const [trending, setTrending] = useState<Array<{ tag: string; query: string; category: string }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("servora_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    } catch {}
  }, []);

  // Fetch trending searches
  useEffect(() => {
    fetch("/api/v1/search/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data?.trending) setTrending(data.trending.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  // Global Keyboard Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Debounced Search Execution
  useEffect(() => {
    if (!query.trim()) {
      setHits({ all: [], products: [], artisans: [], rentals: [], community: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/search/universal?q=${encodeURIComponent(query.trim())}&limit=12&device=WEB`
        );
        const data = await res.json();
        if (data?.hits) {
          setHits(data.hits);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Command palette search error:", err);
      } finally {
        setLoading(false);
      }
    }, 140);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("servora_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleSelectHit = (hit: SearchHit) => {
    saveRecentSearch(hit.title);
    setIsOpen(false);

    if (hit.entityType === "product") {
      router.push(`/products/${hit.slug || hit.id.replace("prod-", "").replace("leg-prod-", "")}`);
    } else if (hit.entityType === "artisan") {
      router.push(`/biz/${hit.slug || hit.id.replace("art-", "")}`);
    } else if (hit.entityType === "rental") {
      router.push(`/search?q=${encodeURIComponent(hit.title)}&entity=rentals`);
    } else {
      router.push(`/search?q=${encodeURIComponent(hit.title)}`);
    }
  };

  const handleExecuteFullSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  if (!isOpen) return null;

  const currentHits = activeTab === "all" ? hits.all : hits[activeTab] || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all transform scale-100"
      >
        {/* Command Bar Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (currentHits.length > 0 && selectedIndex < currentHits.length) {
                  handleSelectHit(currentHits[selectedIndex]);
                } else {
                  handleExecuteFullSearch(query);
                }
              }
            }}
            placeholder="Search solar, artisans, fugu smocks, rentals in Tamale (e.g. 'cemet mixer sakasaka')..."
            className="w-full bg-transparent border-0 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Entity Filter Tabs (When Query Exists) */}
        {query && hits.all.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              All ({hits.all.length})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Products ({hits.products.length})
            </button>
            <button
              onClick={() => setActiveTab("artisans")}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === "artisans"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Artisans ({hits.artisans.length})
            </button>
            <button
              onClick={() => setActiveTab("rentals")}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === "rentals"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Rentals ({hits.rentals.length})
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === "community"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Requests ({hits.community.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Loading Shimmer */}
          {loading && (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse"
                >
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && query && currentHits.length > 0 && (
            <div className="space-y-2">
              {currentHits.map((hit, idx) => (
                <div
                  key={hit.id}
                  onClick={() => handleSelectHit(hit)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    selectedIndex === idx
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Entity Icon / Image */}
                    <div className="relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {hit.image ? (
                        <img src={hit.image} alt="" className="w-full h-full object-cover" />
                      ) : hit.entityType === "product" ? (
                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                      ) : hit.entityType === "artisan" ? (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      ) : hit.entityType === "rental" ? (
                        <Wrench className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Users className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm text-slate-900 dark:text-white truncate"
                          dangerouslySetInnerHTML={{ __html: hit.highlightedTitle || hit.title }}
                        />
                        {hit.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {hit.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    {hit.priceDisplay && (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                        {hit.priceDisplay}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleExecuteFullSearch(query)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  View All Search Results for "{query}" ↗
                </button>
              </div>
            </div>
          )}

          {/* Zero-Match Unfulfilled Demand Capture */}
          {!loading && query && currentHits.length === 0 && (
            <div className="py-8 text-center px-4 space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  No instant catalog matches for "{query}"
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  We couldn't find an exact listing in Tamale right now. Broadcast a live community call so local artisans & suppliers can reach out to you directly.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/requests?new=true&title=${encodeURIComponent(query)}`);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Zap className="w-4 h-4" />
                Broadcast Request for "{query}"
              </button>
            </div>
          )}

          {/* Default State: Trending & Recent Searches */}
          {!query && (
            <div className="space-y-5 py-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("servora_recent_searches");
                      }}
                      className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(s);
                          handleExecuteFullSearch(s);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Trending in Northern Ghana
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trending.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(t.query);
                        handleExecuteFullSearch(t.query);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-left transition-all group"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {t.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Press <kbd className="font-semibold text-slate-600 dark:text-slate-300">↵</kbd> to select
          </span>
          <span>⚡ Sub-50ms Universal Search Engine</span>
        </div>
      </div>
    </div>
  );
}
