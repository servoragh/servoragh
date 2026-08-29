"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Building2,
  Wrench,
  Users,
  MapPin,
  ShieldCheck,
  Zap,
  Tag,
  Star,
  ChevronRight,
  Filter,
  X,
  Phone,
  ArrowUpDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NORTHERN_GHANA_ZONES } from "@/lib/search/config";

interface SearchHit {
  id: string;
  entityType: "product" | "rental" | "artisan" | "community";
  title: string;
  slug?: string;
  subtitle: string;
  description: string;
  category: string;
  zone: string;
  price?: number;
  priceDisplay?: string;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  phone?: string;
  score: number;
  highlightedTitle: string;
  highlightedSubtitle: string;
}

function UniversalSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialZone = searchParams.get("zone") || "all";
  const initialEntity = searchParams.get("entity") || "all";
  const initialVerified = searchParams.get("verified") === "true";

  const [query, setQuery] = useState(initialQuery);
  const [selectedEntity, setSelectedEntity] = useState(initialEntity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedZone, setSelectedZone] = useState(initialZone);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    processingTimeMs: number;
    totalHits: number;
    facets: {
      categories: Record<string, number>;
      zones: Record<string, number>;
      entities: { products: number; rentals: number; artisans: number; community: number };
    };
    hits: {
      all: SearchHit[];
      products: SearchHit[];
      rentals: SearchHit[];
      artisans: SearchHit[];
      community: SearchHit[];
    };
    zeroMatchPrompt?: {
      isZeroMatch: boolean;
      broadcastMessage: string;
    };
  }>({
    processingTimeMs: 0,
    totalHits: 0,
    facets: { categories: {}, zones: {}, entities: { products: 0, rentals: 0, artisans: 0, community: 0 } },
    hits: { all: [], products: [], rentals: [], artisans: [], community: [] },
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedZone !== "all") params.set("zone", selectedZone);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedEntity !== "all") params.set("entity", selectedEntity);
      if (verifiedOnly) params.set("verified", "true");
      if (priceRange.min !== undefined) params.set("min_price", String(priceRange.min));
      if (priceRange.max !== undefined) params.set("max_price", String(priceRange.max));
      params.set("limit", "40");

      const res = await fetch(`/api/v1/search/universal?${params.toString()}`);
      const data = await res.json();
      if (data?.hits) {
        setResults(data);
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedZone, selectedCategory, selectedEntity, verifiedOnly, priceRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchSearchResults]);

  // Update browser URL query params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedZone !== "all") params.set("zone", selectedZone);
    if (selectedEntity !== "all") params.set("entity", selectedEntity);
    if (verifiedOnly) params.set("verified", "true");

    const newUrl = `/search${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [query, selectedCategory, selectedZone, selectedEntity, verifiedOnly]);

  const activeHits = selectedEntity === "all" ? results.hits.all : (results.hits as any)[selectedEntity] || [];

  // Sorting
  const sortedHits = [...activeHits].sort((a, b) => {
    if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
    return b.score - a.score;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Search Header Banner */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, verified artisans, rentals (e.g. 'fugu smock', 'cemet mixer sakasaka')..."
                  className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-medium text-sm sm:text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Performance Latency Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>{results.totalHits} results in {results.processingTimeMs}ms</span>
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Entity Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {[
            { id: "all", label: "All Feed", icon: Sparkles, count: results.totalHits },
            { id: "products", label: "Products", icon: ShoppingBag, count: results.facets.entities.products },
            { id: "artisans", label: "Verified Artisans", icon: Building2, count: results.facets.entities.artisans },
            { id: "rentals", label: "Tool Rentals", icon: Wrench, count: results.facets.entities.rentals },
            { id: "community", label: "Community Gigs", icon: Users, count: results.facets.entities.community },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedEntity === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedEntity(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Grid: Sidebar & Results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Faceted Filter Sidebar */}
          <aside
            className={`md:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 ${
              showMobileFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Faceted Filters
              </h3>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedZone("all");
                  setVerifiedOnly(false);
                  setPriceRange({});
                }}
                className="text-[11px] font-semibold text-emerald-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Verification Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Only</span>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Northern Ghana Neighborhood Zones */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Neighborhood / Zone
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
              >
                <option value="all">All Northern Ghana</option>
                {NORTHERN_GHANA_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone} {results.facets.zones[zone] ? `(${results.facets.zones[zone]})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Trade & Item Category
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400">{results.totalHits}</span>
                </button>
                {Object.entries(results.facets.categories).map(([catName, count]) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === catName
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{catName}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-2">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Price (GH₵)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min GH₵"
                  value={priceRange.min || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
                <input
                  type="number"
                  placeholder="Max GH₵"
                  value={priceRange.max || ""}
                  onChange={(e) =>
                    setPriceRange((prev) => ({
                      ...prev,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
          </aside>

          {/* Right Results Grid */}
          <div className="md:col-span-3 space-y-4">
            {/* Sorting Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500">
                Showing {sortedHits.length} {selectedEntity !== "all" ? selectedEntity : "items"}
              </span>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading Shimmer */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 animate-pulse"
                  >
                    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Results Cards Grid */}
            {!loading && sortedHits.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedHits.map((hit) => {
                  const targetUrl =
                    hit.entityType === "product"
                      ? `/products/${hit.slug || hit.id.replace("prod-", "").replace("leg-prod-", "")}`
                      : hit.entityType === "artisan"
                      ? `/biz/${hit.slug || hit.id.replace("art-", "")}`
                      : `/requests?query=${encodeURIComponent(hit.title)}`;

                  return (
                    <Link
                      key={hit.id}
                      href={targetUrl}
                      className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-600/5 transition-all overflow-hidden"
                    >
                      {/* Image Thumbnail with Badges */}
                      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {hit.image ? (
                          <img
                            src={hit.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            {hit.entityType === "product" ? (
                              <ShoppingBag className="w-10 h-10" />
                            ) : hit.entityType === "artisan" ? (
                              <Building2 className="w-10 h-10" />
                            ) : hit.entityType === "rental" ? (
                              <Wrench className="w-10 h-10" />
                            ) : (
                              <Users className="w-10 h-10" />
                            )}
                          </div>
                        )}

                        {/* Entity Pill Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-black/75 text-white backdrop-blur-sm shadow-sm">
                            {hit.entityType}
                          </span>
                        </div>

                        {/* Verified Badge */}
                        {hit.isVerified && (
                          <div className="absolute top-3 right-3 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                            <span>{hit.category}</span>
                            <span>•</span>
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {hit.zone}
                            </span>
                          </div>

                          <h4
                            className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors"
                            dangerouslySetInnerHTML={{ __html: hit.highlightedTitle || hit.title }}
                          />

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {hit.description || hit.subtitle}
                          </p>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            {hit.priceDisplay ? (
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                {hit.priceDisplay}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Contact</span>
                            )}
                          </div>

                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View ➔
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Zero-Match Unfulfilled Demand Capture Banner */}
            {!loading && sortedHits.length === 0 && (
              <div className="py-12 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-3xl">
                  🔍
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Can't find "{query || "matching listings"}" in Tamale?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Zero listings matched your exact search filters. You can broadcast a live Service Request to Tamale's network of over 500+ verified artisans, suppliers, and haulage providers.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/requests?new=true&title=${encodeURIComponent(query)}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    Broadcast Request for "{query}" ✈️
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function UniversalSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-emerald-600 font-bold text-sm">Loading Universal Search...</div>}>
      <UniversalSearchContent />
    </Suspense>
  );
}
