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
  Grid2X2,
  LayoutList,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
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
  image?: any;
  images?: any;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  phone?: string;
  score: number;
  highlightedTitle: string;
  highlightedSubtitle: string;
  raw?: any;
}

function mapHitToProduct(hit: SearchHit) {
  let images: string[] = [];
  if (Array.isArray(hit.raw?.images)) {
    images = hit.raw.images.flat();
  } else if (typeof hit.raw?.images === "string") {
    try {
      const parsed = JSON.parse(hit.raw.images);
      images = Array.isArray(parsed) ? parsed.flat() : [hit.raw.images];
    } catch {
      images = [hit.raw.images];
    }
  } else if (Array.isArray(hit.image)) {
    images = hit.image.flat();
  } else if (typeof hit.image === "string") {
    images = [hit.image];
  } else if (Array.isArray(hit.images)) {
    images = hit.images.flat();
  }

  const raw = hit.raw || {};
  const providerName =
    raw.seller?.name ||
    raw.business?.businessName ||
    hit.subtitle?.split("•")[0]?.trim() ||
    "Tamale Merchant";

  return {
    id: String(raw.id || hit.id.replace(/^prod-|^leg-prod-/, "")),
    slug: String(raw.slug || hit.slug || hit.id.replace(/^prod-|^leg-prod-/, "")),
    title: raw.title || hit.title,
    description: raw.description || hit.description || "",
    price: Number(raw.price ?? hit.price ?? 0),
    originalPrice: raw.originalPrice
      ? Number(raw.originalPrice)
      : hit.originalPrice
      ? Number(hit.originalPrice)
      : null,
    stockQuantity: raw.stockQuantity ?? 1,
    category: raw.category || hit.category || "Classifieds",
    images: images,
    videoUrl: raw.videoUrl || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    provider: raw.provider || {
      businessName: providerName,
      slug: raw.business?.slug || raw.slug || hit.slug || "",
      logoUrl: raw.business?.logoUrl || raw.provider?.logoUrl || null,
      serviceArea: raw.area || hit.zone || "Tamale",
      ratingAverage: hit.rating || 4.8,
      verificationStatus: hit.isVerified ? "VERIFIED" : "ACTIVE",
      user: {
        name: raw.seller?.name || providerName,
        phone: raw.seller?.phone || hit.phone || "+233240000000",
        avatarUrl: raw.seller?.avatarUrl || null,
      },
    },
  };
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
  const [layoutView, setLayoutView] = useState<"two" | "one">("two");

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
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none no-scrollbar">
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
            {/* Sorting & Layout Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <span className="text-xs font-semibold text-slate-500">
                Showing {sortedHits.length} {selectedEntity !== "all" ? selectedEntity : "items"}
              </span>

              <div className="flex items-center gap-2">
                {/* 2-Column vs 1-Column Toggle */}
                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setLayoutView("two")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      layoutView === "two"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="2 Columns (Grid)"
                  >
                    <Grid2X2 className="w-3.5 h-3.5" />
                    <span>2 Col</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutView("one")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      layoutView === "one"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="1 Column (List)"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>1 Col</span>
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading Shimmer (2 Columns on mobile by default) */}
            {loading && (
              <div
                className={
                  layoutView === "two"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 space-y-3 animate-pulse shadow-2xs"
                  >
                    <div className="w-full h-36 sm:h-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-3/4" />
                    <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded-md w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded-md w-20" />
                      <div className="h-7 w-7 bg-stone-200 dark:bg-stone-800 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results Cards Grid (Two Columns on mobile, matching Product Page) */}
            {!loading && sortedHits.length > 0 && (
              <div
                className={
                  layoutView === "two"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {sortedHits.map((hit) => {
                  if (hit.entityType === "product") {
                    return <ProductCard key={hit.id} product={mapHitToProduct(hit)} />;
                  }

                  const targetUrl =
                    hit.entityType === "artisan"
                      ? `/biz/${hit.slug || hit.id.replace("art-", "")}`
                      : `/requests?query=${encodeURIComponent(hit.title)}`;

                  const rawImg =
                    typeof hit.image === "string"
                      ? hit.image
                      : Array.isArray(hit.image)
                      ? hit.image[0]
                      : Array.isArray(hit.images)
                      ? hit.images[0]
                      : null;

                  return (
                    <div
                      key={hit.id}
                      onClick={() => router.push(targetUrl)}
                      className="cursor-pointer bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
                    >
                      <div>
                        {/* Media Header */}
                        <div className="relative h-36 sm:h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center">
                          {rawImg ? (
                            <img
                              src={rawImg}
                              alt={hit.title}
                              className="w-full h-full object-cover group-hover:scale-108 transition duration-500 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-600 gap-1.5 bg-stone-100 dark:bg-stone-900">
                              {hit.entityType === "artisan" ? (
                                <Building2 className="w-8 h-8 opacity-40 text-emerald-600" />
                              ) : hit.entityType === "rental" ? (
                                <Wrench className="w-8 h-8 opacity-40 text-amber-500" />
                              ) : (
                                <Users className="w-8 h-8 opacity-40 text-blue-500" />
                              )}
                              <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500">
                                {hit.entityType === "artisan" ? "Verified Artisan" : "Local Listing"}
                              </span>
                            </div>
                          )}

                          {/* Category Overlay Pill */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-stone-200/80 dark:border-stone-700 shadow-2xs max-w-[80%] truncate">
                            {hit.category}
                          </div>

                          {/* Entity Badge */}
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1">
                            <span className="bg-stone-950/80 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                              {hit.entityType}
                            </span>
                            {hit.isVerified && (
                              <span
                                className="bg-emerald-600 text-white p-0.5 sm:p-1 rounded-full shadow-sm"
                                title="Verified"
                              >
                                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3 sm:p-5">
                          <h3
                            className="font-bold text-stone-900 dark:text-white text-xs sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 mb-1.5 block leading-snug"
                            dangerouslySetInnerHTML={{ __html: hit.highlightedTitle || hit.title }}
                          />

                          {/* Price / Rate */}
                          <div className="flex flex-wrap items-baseline gap-1.5 mb-2">
                            <span className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
                              {hit.priceDisplay ||
                                (hit.price ? `GH₵ ${hit.price.toLocaleString()}` : "Contact for Rate")}
                            </span>
                          </div>

                          {/* Subtitle & Area */}
                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">
                            <span className="truncate max-w-[120px] font-semibold text-stone-700 dark:text-stone-300">
                              {hit.subtitle?.split("•")[0]?.trim() || "Tamale Provider"}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[90px]">{hit.zone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-3 sm:p-5 pt-0 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(targetUrl);
                          }}
                          className="flex-1 py-2 text-center text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition truncate"
                        >
                          View Details
                        </button>
                        {hit.phone && (
                          <a
                            href={`tel:${hit.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shrink-0"
                            title="Call Provider"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
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
