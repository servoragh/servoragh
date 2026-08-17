"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { CustomDropdown, CustomDropdownOption } from "@/components/CustomDropdown";
import { formatGHS } from "@/lib/utils";

interface UnifiedEcommerceSearchProps {
  placeholder?: string;
  variant?: "hero" | "compact";
  className?: string;
}

export function UnifiedEcommerceSearch({
  placeholder = "Search products or services in Northern Ghana...",
  variant = "hero",
  className = "",
}: UnifiedEcommerceSearchProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "products" | "services" | "providers">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    products: any[];
    services: any[];
    providers: any[];
  }>({ products: [], services: [], providers: [] });

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
    { value: "all", label: "All Tamale Areas" },
    { value: "Sakasaka", label: "Sakasaka" },
    { value: "Aboabo", label: "Aboabo" },
    { value: "Choggu", label: "Choggu" },
    { value: "Nyohini", label: "Nyohini" },
    { value: "Lamashegu", label: "Lamashegu" },
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
    if (!query.trim() && selectedCategory === "all" && selectedArea === "all") {
      setResults({ products: [], services: [], providers: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 200);

    return () => clearTimeout(timer);
  }, [query, scope, selectedCategory, selectedArea]);

  async function performSearch() {
    if (!query.trim() && selectedCategory === "all" && selectedArea === "all") return;
    setLoading(true);
    setIsOpen(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (scope) params.set("scope", scope);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedArea !== "all") params.set("area", selectedArea);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const totalResultsCount =
    (results.products?.length || 0) +
    (results.services?.length || 0) +
    (results.providers?.length || 0);

  // -------------------------------------------------------------
  // 1. HEADER COMPACT VARIANT (Strict Overflow-Hidden Pill Box)
  // -------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div ref={searchContainerRef} className={`relative w-full ${className}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch();
          }}
          className={`flex items-center bg-stone-100 dark:bg-stone-800 border ${
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-stone-300 dark:border-stone-700"
          } rounded-full h-10 px-2 transition-all duration-200 relative z-20 w-full overflow-hidden`}
        >
          {/* Scope Dropdown */}
          <CustomDropdown
            options={[
              { value: "all", label: "All" },
              { value: "products", label: "Products" },
              { value: "services", label: "Services" },
              { value: "providers", label: "Shops" },
            ]}
            value={scope}
            onChange={(val) => setScope(val as any)}
            buttonClassName="border-0 bg-transparent text-stone-800 dark:text-stone-200 px-1.5 hover:bg-transparent text-xs shrink-0"
          />

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 shrink-0" />

          {/* Typable Input Field */}
          <div
            className="flex items-center gap-1.5 flex-1 min-w-0 px-1 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
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
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full text-stone-400 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full transition shrink-0 shadow-sm ml-1"
          >
            Search
          </button>
        </form>

        {/* Custom Autocomplete Results Dropdown Popover */}
        {isOpen && renderAutocompleteResults(true)}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. HERO VARIANT (High Impact E-Commerce Search)
  // -------------------------------------------------------------
  return (
    <div ref={searchContainerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performSearch();
        }}
        className={`bg-white dark:bg-stone-900 border ${
          isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xl" : "border-stone-200 dark:border-stone-800 shadow-xl"
        } rounded-3xl p-3 transition-all duration-200 space-y-2.5 relative z-20`}
      >
        {/* Scope Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-stone-100 dark:border-stone-800">
          <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest mr-1 shrink-0">
            SEARCH:
          </span>
          {scopeOptions.map((tab) => {
            const Icon = tab.icon;
            const active = scope === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScope(tab.value as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar & Multi-Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Main Query Input */}
          <div
            className="flex items-center gap-2.5 flex-1 w-full bg-stone-50 dark:bg-stone-800/80 px-3.5 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700/60 cursor-text min-w-0"
            onClick={() => inputRef.current?.focus()}
          >
            <Search className="w-4 h-4 text-emerald-500 shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setIsOpen(true);
              }}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className="bg-transparent text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none w-full min-w-0 font-medium pointer-events-auto cursor-text"
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
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full text-stone-400 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            buttonClassName="w-full sm:w-auto bg-stone-50 dark:bg-stone-800 py-2.5 rounded-2xl"
          />

          {/* Area Dropdown */}
          <CustomDropdown
            options={areaOptions}
            value={selectedArea}
            onChange={(val) => setSelectedArea(val)}
            buttonClassName="w-full sm:w-auto bg-stone-50 dark:bg-stone-800 py-2.5 rounded-2xl"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow transition shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Live Dropdown Preview */}
      {isOpen && renderAutocompleteResults(false)}
    </div>
  );

  // -------------------------------------------------------------
  // 3. Shared Autocomplete Results Dropdown Popover
  // -------------------------------------------------------------
  function renderAutocompleteResults(isCompact = false) {
    const popoverPositionClass = isCompact
      ? "absolute top-full left-0 sm:-left-32 w-full sm:w-[520px] lg:w-[580px] max-w-[94vw]"
      : "absolute top-full left-0 right-0 w-full";

    return (
      <div className={`${popoverPositionClass} mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 text-stone-900 dark:text-white transition pointer-events-auto`}>
        {loading ? (
          <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching products & services across Tamale...</span>
          </div>
        ) : totalResultsCount === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200">No matching items found</p>
            <p className="text-[11px] text-stone-400 mt-1">
              Try searching for "Fugu", "Solar", "Electrician", or "Phone".
            </p>
          </div>
        ) : (
          <>
            {/* Header result stats */}
            <div className="px-5 py-2.5 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between text-[11px] font-bold text-stone-500 border-b border-stone-200 dark:border-stone-800">
              <span>MATCHING RESULTS ({totalResultsCount})</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">NORTHERN MARKETPLACE</span>
            </div>

            {/* PRODUCTS SECTION */}
            {results.products && results.products.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Products ({results.products.length})
                  </span>
                  <Link
                    href={`/products?q=${encodeURIComponent(query)}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] text-stone-400 hover:text-emerald-600 font-bold flex items-center gap-0.5"
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
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/80 hover:bg-emerald-50 dark:hover:bg-stone-750 rounded-2xl border border-stone-200 dark:border-stone-700/60 transition group flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full inline-block">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 group-hover:text-emerald-600 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-stone-400 block truncate">
                          {item.provider?.businessName}
                        </span>
                      </div>

                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
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
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Services ({results.services.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.services.map((serv) => (
                    <div
                      key={serv.id}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white">{serv.name}</h4>
                        <p className="text-[10px] text-stone-400">{serv.category?.name || "General"}</p>
                      </div>

                      <Link
                        href={`/services/${serv.category?.slug || "general"}/tamale`}
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-xl hover:bg-amber-500 shrink-0"
                      >
                        Book
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROVIDERS / BUSINESSES SECTION */}
            {results.providers && results.providers.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Businesses ({results.providers.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {results.providers.map((prov) => (
                    <Link
                      key={prov.id}
                      href={`/provider/${prov.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 bg-stone-50 dark:bg-stone-800/80 hover:bg-purple-50 dark:hover:bg-stone-750 rounded-2xl border border-stone-200 dark:border-stone-700/60 transition group flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {prov.businessName.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-purple-600 truncate">
                            {prov.businessName}
                          </h4>
                          {prov.verificationStatus === "VERIFIED" && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 truncate">{prov.serviceArea}</p>
                      </div>
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
