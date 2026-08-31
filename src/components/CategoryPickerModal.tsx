"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Tag,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CLASSIFIED_CATEGORIES, CategoryDefinition, SubCategoryDefinition } from "@/lib/categoriesData";
import { matchProductTaxonomy } from "@/lib/taxonomyResolver";

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  selectedSubCategory?: string;
  onSelect: (category: string, subCategory?: string) => void;
  title?: string;
}

export function CategoryPickerModal({
  isOpen,
  onClose,
  selectedCategory,
  selectedSubCategory,
  onSelect,
  title = "Select Category & Subcategory",
}: CategoryPickerModalProps) {
  const [search, setSearch] = useState("");
  const [mobileStep, setMobileStep] = useState<1 | 2>(1);
  const [categoriesList, setCategoriesList] = useState<CategoryDefinition[]>(CLASSIFIED_CATEGORIES);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<CategoryDefinition | null>(() => {
    return CLASSIFIED_CATEGORIES.find((c) => c.name === selectedCategory) || CLASSIFIED_CATEGORIES[0];
  });
  const [tempSubCat, setTempSubCat] = useState<string | undefined>(selectedSubCategory);

  React.useEffect(() => {
    async function loadLiveCategoryCounts() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        const data = await catRes.json();
        const prodData = await prodRes.json();

        if (prodData.products && Array.isArray(prodData.products)) {
          setRawProducts(prodData.products);
        }

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
          if (selectedCategory) {
            const found = hydrated.find((h: any) => h.name === selectedCategory);
            if (found) setActiveCat(found);
          }
        }
      } catch (_) {}
    }
    if (isOpen) {
      loadLiveCategoryCounts();
    }
  }, [isOpen, selectedCategory]);

  function getSubcategoryAdCount(catName: string, subName: string) {
    let count = 0;
    for (const p of rawProducts) {
      if (matchProductTaxonomy(p, catName, subName)) {
        count++;
      }
    }
    return count;
  }

  // Filter categories and subcategories based on search input
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categoriesList;
    const q = search.toLowerCase().trim();
    return categoriesList.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.subcategories.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [search, categoriesList]);

  if (!isOpen) return null;

  function handleCategoryClick(cat: CategoryDefinition) {
    setActiveCat(cat);
    setTempSubCat(cat.subcategories[0]?.name);
    setMobileStep(2); // On mobile, automatically advance to Subcategory view!
  }

  function handleConfirmSelection(categoryName: string, subCategoryName?: string) {
    onSelect(categoryName, subCategoryName);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50 shrink-0">
          <div className="flex items-center gap-3">
            {mobileStep === 2 && (
              <button
                onClick={() => setMobileStep(1)}
                className="md:hidden w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold active:scale-95 transition"
                title="Back to categories"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-stone-900 dark:text-white tracking-tight leading-tight">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {mobileStep === 2 && activeCat
                  ? `Select subcategory for ${activeCat.name}`
                  : `Total ${totalListings} Active Classified Ads Across 17 Verticals`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="p-3.5 sm:p-4 bg-stone-100/60 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 px-3.5 py-2 sm:py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <Search className="w-4 h-4 text-emerald-500 shrink-0" />
            <input
              type="text"
              placeholder="Search category or subcategory (e.g. Laptops, Solar Inverters, Cars, Plumbing)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (mobileStep === 2) setMobileStep(1); // Return to category view on search
              }}
              className="w-full bg-transparent text-xs sm:text-sm text-stone-900 dark:text-white outline-none font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-stone-400 hover:text-stone-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Modal Body (Mobile 2-Step Flow, Desktop 2-Column Side-by-Side) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-0 custom-scrollbar">
          
          {/* Categories List (Shown on Desktop, or Mobile Step 1) */}
          <div className={`md:col-span-7 p-4 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800 space-y-2 ${
            mobileStep === 1 ? "block" : "hidden md:block"
          }`}>
            <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-3 flex items-center justify-between">
              <span>Select Primary Category ({filteredCategories.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCategories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = activeCat?.slug === cat.slug;

                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={`p-3 rounded-2xl text-left border transition duration-150 cursor-pointer flex items-center justify-between gap-3 relative ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-stone-50/70 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected ? "bg-emerald-600 text-white border-emerald-500" : cat.color
                        }`}
                      >
                        <CatIcon className="w-4.5 h-4.5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`block text-xs font-black truncate leading-tight ${
                            isSelected ? "text-emerald-900 dark:text-emerald-300" : "text-stone-900 dark:text-white"
                          }`}
                        >
                          {cat.name}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-medium truncate mt-0.5">
                          {cat.subcategories.length} subcategories
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      <ChevronRight className="w-4 h-4 text-stone-400 md:hidden" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories Selector (Shown on Desktop, or Mobile Step 2) */}
          <div className={`md:col-span-5 p-4 sm:p-5 bg-stone-50/50 dark:bg-stone-950/40 flex flex-col justify-between ${
            mobileStep === 2 ? "block" : "hidden md:flex"
          }`}>
            {activeCat ? (
              <div>
                {/* Mobile Back to Categories Header */}
                <button
                  type="button"
                  onClick={() => setMobileStep(1)}
                  className="md:hidden mb-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>‹ Back to All Categories</span>
                </button>

                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${activeCat.color}`}>
                    {React.createElement(activeCat.icon, { className: "w-4.5 h-4.5" })}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-white leading-tight">
                      {activeCat.name}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium">Pick a subcategory below</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                  {(() => {
                    const generalCount = getSubcategoryAdCount(activeCat.name, "");
                    return (
                      <button
                        type="button"
                        onClick={() => setTempSubCat(undefined)}
                        className={`w-full p-2.5 sm:p-3 rounded-xl text-left text-xs font-bold transition border flex items-center justify-between cursor-pointer ${
                          !tempSubCat
                            ? "bg-emerald-600 text-white border-emerald-600 shadow"
                            : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">All ({activeCat.name})</span>
                          <span className={`text-[10px] font-medium ${!tempSubCat ? "text-emerald-100" : (generalCount > 0 ? "text-emerald-600 font-bold" : "text-stone-400")}`}>
                            {generalCount > 0 ? `${generalCount} ${generalCount === 1 ? 'ad' : 'ads'} in vertical` : '0 active listings'}
                          </span>
                        </div>
                        {!tempSubCat && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    );
                  })()}

                  {activeCat.subcategories.map((sub) => {
                    const isSubSelected = tempSubCat === sub.name;
                    const subCount = getSubcategoryAdCount(activeCat.name, sub.name);

                    return (
                      <button
                        key={sub.slug}
                        type="button"
                        onClick={() => setTempSubCat(sub.name)}
                        className={`w-full p-2.5 sm:p-3 rounded-xl text-left text-xs font-bold transition border flex items-center justify-between cursor-pointer ${
                          isSubSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow"
                            : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{sub.name}</span>
                          <span className={`text-[10px] font-medium ${isSubSelected ? "text-emerald-100" : (subCount > 0 ? "text-emerald-600 font-bold" : "text-stone-400")}`}>
                            {subCount > 0 ? `${subCount} ${subCount === 1 ? 'ad' : 'ads'} live` : '0 active listings'}
                          </span>
                        </div>
                        {isSubSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-stone-400">
                Select a category to choose subcategory
              </div>
            )}

            {/* Confirm Selection Footer Button */}
            {activeCat && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={() => handleConfirmSelection(activeCat.name, tempSubCat)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Confirm: {activeCat.name} {tempSubCat ? `› ${tempSubCat}` : ""}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
