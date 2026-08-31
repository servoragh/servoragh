"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Plus,
  Grid,
  Search,
  ArrowRight,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CLASSIFIED_CATEGORIES, CategoryDefinition } from "@/lib/categoriesData";

interface CategoryGridSectionProps {
  onPostRequestClick?: () => void;
}

export function CategoryGridSection({ onPostRequestClick }: CategoryGridSectionProps) {
  const [categoriesList, setCategoriesList] = useState<CategoryDefinition[]>(CLASSIFIED_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<CategoryDefinition>(CLASSIFIED_CATEGORIES[0]);
  const [mobileExpandedSlug, setMobileExpandedSlug] = useState<string | null>(null);
  const [showAllMobile, setShowAllMobile] = useState(false);

  const [totalListings, setTotalListings] = useState<number>(0);

  useEffect(() => {
    async function loadLiveCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
          const hydrated = data.categories.map((c: any) => {
            const original = CLASSIFIED_CATEGORIES.find((orig) => orig.slug === c.slug);
            return {
              ...c,
              icon: original ? original.icon : CLASSIFIED_CATEGORIES[0].icon,
            };
          });
          setCategoriesList(hydrated);
          if (data.totalListings !== undefined) {
            setTotalListings(data.totalListings);
          }
          setActiveCategory((prev) => hydrated.find((h: any) => h.slug === prev.slug) || hydrated[0]);
        }
      } catch (_) {}
    }
    loadLiveCategories();
  }, []);

  const IconComponent = activeCategory.icon;
  const mobileCategoriesList = showAllMobile ? categoriesList : categoriesList.slice(0, 6);

  return (
    <section className="py-6 sm:py-10 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-300 dark:border-emerald-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Marketplace Taxonomy ({totalListings} Active Ads)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Explore All Categories & Subcategories
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium mt-0.5">
              Browse products, artisan services, equipment rentals, and trade calls across Northern Ghana.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onPostRequestClick && (
              <button
                onClick={onPostRequestClick}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 text-xs font-black rounded-2xl shadow-md hover:shadow-amber-500/20 hover:scale-102 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Post Advert / Request</span>
              </button>
            )}
            <Link
              href="/products"
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1 group"
            >
              <span>All Listings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* DESKTOP 2-COLUMN CLASSIFIED PANEL (Hidden on Mobile) */}
        <div className="hidden lg:grid grid-cols-12 gap-0 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl bg-white dark:bg-stone-900 min-h-[520px]">
          
          {/* Left Column: Categories List (4 Cols) */}
          <div className="col-span-4 border-r border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/50 p-2 overflow-y-auto max-h-[560px] custom-scrollbar">
            <div className="p-2.5 text-[11px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span>Main Verticals</span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                17 Categories
              </span>
            </div>

            <div className="space-y-1 mt-2">
              {CLASSIFIED_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeCategory.slug === cat.slug;

                return (
                  <button
                    key={cat.slug}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-stone-800 shadow-md border border-emerald-500/40 text-stone-900 dark:text-white font-extrabold translate-x-1"
                        : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : `${cat.color}`
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs truncate leading-tight">
                          {cat.name}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-semibold truncate mt-0.5">
                          {cat.adsCountText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? "text-emerald-500 translate-x-1"
                          : "text-stone-400 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Subcategories & Fast Navigation Pane (8 Cols) */}
          <div className="col-span-8 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-stone-900 relative">
            <div>
              {/* Category Header Banner */}
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${activeCategory.color}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
                      <span>{activeCategory.name}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700">
                        {activeCategory.adsCountText}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                      {activeCategory.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/products?category=${encodeURIComponent(activeCategory.name)}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Browse All {activeCategory.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Subcategories Grid */}
              <div className="mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Subcategories in {activeCategory.name} ({activeCategory.subcategories.length})</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {activeCategory.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/products?category=${encodeURIComponent(activeCategory.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                      className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition duration-150 group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                          {sub.name}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="bg-gradient-to-r from-emerald-950/10 via-teal-950/10 to-stone-900/10 dark:from-emerald-950/40 dark:to-stone-900/60 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Looking for specific items in {activeCategory.name}? Filter by area or post an instant request.</span>
              </div>
              <Link
                href={`/requests?category=${encodeURIComponent(activeCategory.name)}`}
                className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 flex items-center gap-1"
              >
                <span>View Buyer Requests</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE COMPACT GRID VIEW (Top 6 Featured Categories with "Show All 17 Categories" Toggle) */}
        <div className="lg:hidden space-y-3">
          {mobileCategoriesList.map((cat) => {
            const CatIcon = cat.icon;
            const isExpanded = mobileExpandedSlug === cat.slug;

            return (
              <div
                key={cat.slug}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs"
              >
                <button
                  onClick={() =>
                    setMobileExpandedSlug(isExpanded ? null : cat.slug)
                  }
                  className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer active:bg-stone-50 dark:active:bg-stone-800/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}
                    >
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-extrabold text-stone-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                      <span className="block text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate mt-0.5">
                        {cat.adsCountText} • {cat.subcategories.length} subcategories
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-90 text-emerald-500" : ""
                    }`}
                  />
                </button>

                {/* Subcategory Accordion Body */}
                {isExpanded && (
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-100 dark:border-stone-800 space-y-2 animate-in fade-in duration-150">
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-3">
                      {cat.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/products?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`}
                          className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between active:scale-98 transition"
                        >
                          <span className="truncate">{sub.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                      >
                        <span>View All {cat.name} Listings</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Show All / Show Fewer Categories Toggle Button on Mobile */}
          <div className="pt-2">
            <button
              onClick={() => setShowAllMobile(!showAllMobile)}
              className="w-full py-3.5 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-white font-black text-xs rounded-2xl transition border border-stone-200 dark:border-stone-800 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
            >
              <span>{showAllMobile ? "Collapse Categories" : `Show All ${CLASSIFIED_CATEGORIES.length} Categories`}</span>
              {showAllMobile ? (
                <ChevronUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
