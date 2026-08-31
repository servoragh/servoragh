"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, PlusCircle, Search, Filter, Tag, X, Loader2, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductSubmissionModal } from "@/components/ProductSubmissionModal";
import { CategoryGridSection } from "@/components/CategoryGridSection";
import { CLASSIFIED_CATEGORIES, getSubcategoriesForCategory } from "@/lib/categoriesData";
import { getCachedProducts, setCachedProducts } from "@/lib/productsCacheStore";

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 space-y-3 animate-pulse shadow-2xs">
      <div className="w-full h-40 sm:h-48 bg-stone-200 dark:bg-stone-800 rounded-xl" />
      <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded-md w-3/4" />
      <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded-md w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded-md w-24" />
        <div className="h-7 w-7 bg-stone-200 dark:bg-stone-800 rounded-lg" />
      </div>
    </div>
  );
}

function ProductsMarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSubCategory = searchParams.get("subCategory") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.has("category")) {
      setSelectedCategory(searchParams.get("category") || "");
    }
    if (searchParams.has("subCategory")) {
      setSelectedSubCategory(searchParams.get("subCategory") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    const cacheKey = `${selectedCategory}_${selectedSubCategory}_${searchQuery.trim()}`;
    const cached = getCachedProducts(cacheKey);

    if (cached && cached.length > 0) {
      // ⚡ INSTANT RENDER FROM CACHE (0ms delay)
      setProducts(cached);
      setLoading(false);
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    const timer = setTimeout(() => {
      fetchProducts(cacheKey, !!cached);
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSubCategory, searchQuery]);

  async function fetchProducts(cacheKey?: string, isBackgroundRefresh = false) {
    try {
      if (!isBackgroundRefresh && products.length === 0) {
        setLoading(true);
      }
      setIsRefreshing(true);

      let url = "/api/products";
      const queryParams: string[] = [];
      if (selectedCategory) queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (selectedSubCategory) queryParams.push(`subCategory=${encodeURIComponent(selectedSubCategory)}`);
      if (searchQuery.trim()) queryParams.push(`q=${encodeURIComponent(searchQuery.trim())}`);
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.products) {
        setProducts(data.products);
        const keyToSave = cacheKey || `${selectedCategory}_${selectedSubCategory}_${searchQuery.trim()}`;
        setCachedProducts(keyToSave, data.products);
      }
    } catch (e) {
      console.error("Fetch products error:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cacheKey = `${selectedCategory}_${selectedSubCategory}_${searchQuery.trim()}`;
    fetchProducts(cacheKey);
  }

  const currentSubcategories = selectedCategory ? getSubcategoriesForCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen py-6 sm:py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full mb-2 border border-emerald-300 dark:border-emerald-800">
              <ShoppingBag className="w-3.5 h-3.5" /> Classified Marketplace
              {isRefreshing && (
                <span className="inline-flex items-center gap-1 ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-normal animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {selectedCategory
                ? `${selectedCategory} ${selectedSubCategory ? `› ${selectedSubCategory}` : ""}`
                : "All Local Products & Supplies"}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Browse verified items across standard marketplace categories & subcategories in Northern Ghana.
            </p>
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Advert / Sale Item</span>
          </button>
        </div>

        {/* CATEGORY GRID EXPLORER */}
        <div className="mb-6 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xs">
          <CategoryGridSection onPostRequestClick={() => setIsPostModalOpen(true)} />
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-3xl mb-8 shadow-xs space-y-4">
          
          {/* Search bar & Category Dropdown */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products & classifieds (e.g. Toyota Voxy, Samsung TV, Fugu smock, Cement)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory("");
                }}
                className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold px-3 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Categories (17 Verticals)</option>
                {CLASSIFIED_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name} ({cat.adsCountText})
                  </option>
                ))}
              </select>

              {(selectedCategory || selectedSubCategory || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubCategory("");
                    setSearchQuery("");
                  }}
                  className="px-3 py-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Subcategory Pills */}
          {selectedCategory && currentSubcategories.length > 0 && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-500" />
                <span>Filter by {selectedCategory} Subcategory:</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  onClick={() => setSelectedSubCategory("")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 cursor-pointer ${
                    !selectedSubCategory
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900"
                      : "bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                  }`}
                >
                  All {selectedCategory}
                </button>

                {currentSubcategories.map((sub) => {
                  const isSubSel = selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                  return (
                    <button
                      key={sub.slug}
                      onClick={() => setSelectedSubCategory(isSubSel ? "" : sub.name)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition shrink-0 cursor-pointer ${
                        isSubSel
                          ? "bg-emerald-500 text-white border-emerald-500 font-bold"
                          : "bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Grid / Skeleton Loaders */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-10 rounded-3xl text-center border border-stone-200 dark:border-stone-800 shadow-sm max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base mb-1">No Listings Found</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
              No active classifieds found under "{selectedCategory || "All Categories"}" {selectedSubCategory ? `› ${selectedSubCategory}` : ""}. Be the first to post an advert!
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
            >
              Post Classified Advert
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <ProductSubmissionModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => fetchProducts(undefined, false)}
      />
    </div>
  );
}

export default function ProductsMarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    }>
      <ProductsMarketplaceContent />
    </Suspense>
  );
}
