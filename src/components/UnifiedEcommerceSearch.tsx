"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Wrench,
  Building2,
  MapPin,
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { CustomDropdown, CustomDropdownOption } from "@/components/CustomDropdown";
import { formatGHS } from "@/lib/utils";

interface UnifiedEcommerceSearchProps {
  placeholder?: string;
  variant?: "hero" | "compact";
  className?: string;
}

const POPULAR_SUGGESTIONS = [
  { label: "Fugu & Smocks 🥻", query: "Fugu" },
  { label: "Solar & Electrical ⚡", query: "Electrical" },
  { label: "Phone & Screen Repair 📱", query: "Phone" },
  { label: "Heavy Equipment Rentals 🚜", query: "Generator" },
  { label: "AC & Refrigerator ❄️", query: "AC" },
  { label: "Plumbing & Water 🚰", query: "Plumbing" },
];

export function UnifiedEcommerceSearch({
  placeholder = "Search products, electricians, solar, tailors in Northern Ghana...",
  variant = "hero",
  className = "",
}: UnifiedEcommerceSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "products" | "services" | "providers">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [results, setResults] = useState<{
    products: any[];
    services: any[];
    providers: any[];
    community?: any[];
  }>({ products: [], services: [], providers: [], community: [] });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scopeOptions: CustomDropdownOption[] = [
    { value: "all", label: "All Catalog", icon: Sparkles },
    { value: "products", label: "Products", icon: ShoppingBag },
    { value: "services", label: "Services", icon: Wrench },
    { value: "providers", label: "Shops & Artisans", icon: Building2 },
  ];

  const categoryOptions: CustomDropdownOption[] = [
    { value: "all", label: "All Categories" },
    { value: "Electronics", label: "Electronics & Phones" },
    { value: "Fashion", label: "Fashion & Fugu" },
    { value: "Electrical", label: "Electrical & Solar" },
    { value: "Plumbing", label: "Plumbing" },
    { value: "Tailoring", label: "Tailoring" },
    { value: "Tools", label: "Tools & Equipment" },
  ];

  const areaOptions: CustomDropdownOption[] = [
    { value: "all", label: "All Northern Ghana" },
    { value: "Tamale", label: "Tamale Metro" },
    { value: "Bolgatanga", label: "Bolgatanga" },
    { value: "Wa", label: "Wa" },
    { value: "Yendi", label: "Yendi" },
    { value: "Sakasaka", label: "Sakasaka" },
    { value: "Aboabo", label: "Aboabo" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], services: [], providers: [] });
      setLoading(false);
      setIsFallback(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, scope, selectedCategory, selectedArea]);

  async function performSearch(searchQuery = query) {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsFallback(false);

    try {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      if (scope !== "all") params.set("scope", scope);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedArea !== "all") params.set("area", selectedArea);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      const prod = data.results?.products || data.products || [];
      const serv = data.results?.services || data.services || [];
      const prov = data.results?.providers || data.providers || [];
      const comm = data.results?.community || data.community || [];

      setResults({ products: prod, services: serv, providers: prov, community: comm });
      setIsFallback(Boolean(data.isFallback));
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsOpen(false);

    if (scope === "products") {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else if (scope === "services") {
      router.push(`/requests?q=${encodeURIComponent(query)}`);
    } else {
      performSearch();
    }
  }

  const totalResultsCount =
    (results.products?.length || 0) +
    (results.services?.length || 0) +
    (results.providers?.length || 0) +
    (results.community?.length || 0);

  // -------------------------------------------------------------
  // 1. HEADER COMPACT VARIANT
  // -------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div ref={searchContainerRef} className={`relative w-full ${className}`}>
        <form
          onSubmit={handleFormSubmit}
          className={`flex items-center bg-stone-100 dark:bg-stone-800 border ${
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-stone-300 dark:border-stone-700"
          } rounded-full h-10 px-1.5 transition-all duration-200 relative z-30 w-full overflow-hidden`}
        >
          <CustomDropdown
            options={[
              { value: "all", label: "All" },
              { value: "products", label: "Products" },
              { value: "services", label: "Services" },
              { value: "providers", label: "Shops" },
            ]}
            value={scope}
            onChange={(val) => setScope(val as any)}
            buttonClassName="border-0 bg-transparent text-stone-800 dark:text-stone-200 px-1 hover:bg-transparent text-xs shrink-0 font-bold"
          />

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5 shrink-0" />

          <div
            className="flex items-center gap-1.5 flex-1 min-w-0 px-1 cursor-text"
            onClick={() => {
              inputRef.current?.focus();
              setIsOpen(true);
            }}
          >
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className="bg-transparent text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none w-full min-w-0 py-1 font-medium pointer-events-auto cursor-text"
            />
            {query && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full text-stone-400 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition shrink-0 shadow-xs ml-1 cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {isOpen && renderAutocompleteResults(true)}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. HERO VARIANT (Minimalist, Super-Modern Pill Search Bar)
  // -------------------------------------------------------------
  return (
    <div ref={searchContainerRef} className={`relative w-full z-50 ${className}`}>
      <form
        onSubmit={handleFormSubmit}
        className={`bg-white/90 dark:bg-stone-900/90 border ${
          isOpen ? "border-emerald-500 ring-4 ring-emerald-500/15 shadow-2xl" : "border-stone-200/90 dark:border-stone-800/90 shadow-xl"
        } rounded-full p-2 backdrop-blur-xl transition-all duration-200 relative z-50 flex items-center gap-2`}
      >
        {/* Main Input Box */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 px-3 py-1.5 cursor-text"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="bg-transparent text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none w-full min-w-0 font-semibold pointer-events-auto cursor-text"
          />
          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full text-stone-400 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`p-2.5 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition shrink-0 cursor-pointer ${
            showAdvancedFilters || selectedCategory !== "all" || selectedArea !== "all"
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
              : ""
          }`}
          title="Filter search"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Search Submit Action Button */}
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md hover:shadow-emerald-600/20 active:scale-95 transition-all duration-150 shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvancedFilters && (
        <div className="mt-2 p-3 bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl backdrop-blur-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 relative z-30">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
            <span>Filter Search Catalog</span>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedArea("all");
                setScope("all");
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <CustomDropdown
              options={scopeOptions}
              value={scope}
              onChange={(val) => setScope(val as any)}
              buttonClassName="w-full bg-stone-50 dark:bg-stone-800 py-2 rounded-xl border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs"
            />
            <CustomDropdown
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              buttonClassName="w-full bg-stone-50 dark:bg-stone-800 py-2 rounded-xl border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs"
            />
            <CustomDropdown
              options={areaOptions}
              value={selectedArea}
              onChange={(val) => setSelectedArea(val)}
              buttonClassName="w-full bg-stone-50 dark:bg-stone-800 py-2 rounded-xl border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs"
            />
          </div>
        </div>
      )}

      {/* Live Dropdown Preview */}
      {isOpen && renderAutocompleteResults(false)}
    </div>
  );

  // -------------------------------------------------------------
  // 3. Shared Autocomplete Results Dropdown Popover
  // -------------------------------------------------------------
  function renderAutocompleteResults(isCompact = false) {
    const popoverPositionClass = isCompact
      ? "absolute top-full left-0 right-0 sm:left-auto sm:right-0 w-full sm:w-[520px] lg:w-[580px] max-w-[calc(100vw-32px)]"
      : "absolute top-full left-0 right-0 w-full";

    return (
      <div className={`${popoverPositionClass} mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl z-[100] max-h-[75vh] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 text-stone-900 dark:text-stone-100 transition pointer-events-auto`}>
        
        {/* POPULAR QUICK SEARCH SUGGESTIONS */}
        {!query.trim() && totalResultsCount === 0 && (
          <div className="p-4 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Popular Quick Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.query}
                  type="button"
                  onClick={() => {
                    setQuery(sug.query);
                    performSearch(sug.query);
                  }}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-bold rounded-xl border border-stone-200 dark:border-stone-700 transition cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching products, artisans & services across Northern Ghana...</span>
          </div>
        ) : query.trim() && totalResultsCount === 0 ? (
          <div className="p-6 text-center space-y-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl m-2 border border-amber-200/60 dark:border-amber-900/40">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-stone-900 dark:text-stone-100">
                No direct matches for "{query}" yet.
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Broadcast your request to verified artisans, local workshops & tool suppliers across Tamale & Northern Ghana.
              </p>
            </div>
            <Link
              href={`/requests?new=true&title=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Broadcast Request for "{query}" to Tamale Artisans & Suppliers</span>
            </Link>
          </div>
        ) : totalResultsCount > 0 && (
          <>
            {/* Header result stats */}
            <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-800/90 flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-700">
              {isFallback ? (
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  No exact match for "{query}". Showing popular recommendations:
                </span>
              ) : (
                <span>MATCHING RESULTS ({totalResultsCount})</span>
              )}
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black">NORTHERN MARKETPLACE</span>
            </div>

            {/* PRODUCTS SECTION */}
            {results.products && results.products.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Products ({results.products.length})
                  </span>
                  <Link
                    href={`/products?q=${encodeURIComponent(query)}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold flex items-center gap-0.5"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.products.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-stone-700 rounded-2xl border border-stone-200 dark:border-stone-700 transition group flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full inline-block">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                          {item.provider?.businessName}
                        </span>
                      </div>

                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                        {formatGHS(item.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SERVICES SECTION */}
            {results.services && results.services.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Services ({results.services.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.services.map((item) => (
                    <Link
                      key={item.id}
                      href={`/requests?category=${encodeURIComponent(item.name)}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50 dark:hover:bg-stone-700 rounded-2xl border border-stone-200 dark:border-stone-700 transition group flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full inline-block">
                          {item.category?.name || "General Service"}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 truncate">
                          {item.name}
                        </h4>
                      </div>

                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* PROVIDERS / SHOPS / ARTISANS SECTION */}
            {results.providers && results.providers.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Shops & Artisans ({results.providers.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.providers.map((item) => (
                    <Link
                      key={item.id}
                      href={`/provider/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/60 hover:bg-purple-50 dark:hover:bg-stone-700 rounded-2xl border border-stone-200 dark:border-stone-700 transition group flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate">
                            {item.businessName}
                          </h4>
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {item.serviceArea || "Northern Ghana"}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-[10px] font-bold text-stone-700 dark:text-stone-200 rounded-lg shrink-0">
                        ⭐️ {item.ratingAverage || 5.0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* COMMUNITY CALLS & SERVICE REQUESTS SECTION */}
            {results.community && results.community.length > 0 && (
              <div className="p-3 space-y-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Community Calls & Requests ({results.community.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.community.map((item) => (
                    <Link
                      key={item.id}
                      href={item.type === "COMMUNITY_POST" ? `/community#post-${item.id}` : `/requests/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/60 hover:bg-teal-50 dark:hover:bg-stone-700 rounded-2xl border border-stone-200 dark:border-stone-700 transition group flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-full inline-block">
                          {item.type === "COMMUNITY_POST" ? "Community Post" : "Work Request"}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                          {item.authorName} • {item.locationOrArea || "Tamale"}
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
