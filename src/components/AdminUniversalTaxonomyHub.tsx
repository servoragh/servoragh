"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Tag,
  Search,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  Info,
} from "lucide-react";

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  capabilities: string; // JSON string array
  verificationRequirement: string;
  disclaimerText?: string | null;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
  subcategories: SubcategoryItem[];
}

export function AdminUniversalTaxonomyHub({ isDark }: { isDark?: boolean }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  async function fetchTaxonomy() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/taxonomy");
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch {
      console.warn("Failed to load category taxonomy.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCategory() {
    if (!editingCategory?.name?.trim()) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Category saved successfully to PostgreSQL!");
        setShowModal(false);
        setEditingCategory(null);
        fetchTaxonomy();
      } else {
        alert(data.error || "Failed to save category.");
      }
    } catch {
      alert("Network error saving category.");
    } finally {
      setSaving(false);
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" /> Universal Category & Taxonomy Core (18 Industry Verticals)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Database-first dynamic taxonomy engine. Create categories, subcategories, capabilities, and verification disclaimers live in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingCategory({
                name: "",
                slug: "",
                description: "",
                icon: "Tag",
                capabilities: JSON.stringify(["SERVICES", "PRODUCTS"]),
                verificationRequirement: "NONE",
                isActive: true,
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Category ➕
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold outline-none"
          />
        </div>

        <button
          onClick={fetchTaxonomy}
          className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Taxonomy
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-stone-400 font-bold">
            Loading PostgreSQL Category Taxonomy...
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const capabilitiesList: string[] = JSON.parse(cat.capabilities || "[]");

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500" /> {cat.name}
                      </h3>
                      <span className="text-[10px] font-mono text-stone-400 block">{cat.slug}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        cat.isActive
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {cat.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">{cat.description}</p>

                  {/* Capabilities Badges */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-bold block">
                      Enabled Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {capabilitiesList.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[9px] font-mono font-bold rounded-lg uppercase"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verification & Disclaimer Note */}
                  {cat.verificationRequirement !== "NONE" && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Requires: <strong>{cat.verificationRequirement}</strong></span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-stone-400 font-bold">
                    {cat.subcategories?.length || 0} Subcategories
                  </span>

                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Category
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-500" /> {editingCategory.id ? "Edit Category" : "Create New Industry Category"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-xs font-bold text-stone-400">
                Close (X)
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Category Name:</label>
                  <input
                    type="text"
                    value={editingCategory.name || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                    placeholder="e.g. Healthcare & Clinics"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Slug:</label>
                  <input
                    type="text"
                    value={editingCategory.slug || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-mono outline-none"
                    placeholder="e.g. healthcare-clinics"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Description:</label>
                <textarea
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Verification Requirement:</label>
                <select
                  value={editingCategory.verificationRequirement || "NONE"}
                  onChange={(e) => setEditingCategory({ ...editingCategory, verificationRequirement: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                >
                  <option value="NONE">NONE (Standard Access)</option>
                  <option value="ID_VERIFIED">ID_VERIFIED (Ghana Card Required)</option>
                  <option value="BUSINESS_LICENSE">BUSINESS_LICENSE (RGD Business Registration Required)</option>
                  <option value="PROFESSIONAL_LICENSE">PROFESSIONAL_LICENSE (Professional Board License Required)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Legal / Regulatory Disclaimer Text:</label>
                <textarea
                  value={editingCategory.disclaimerText || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, disclaimerText: e.target.value })}
                  rows={2}
                  placeholder="Optional disclaimer shown on category search and offer listings..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={saving || !editingCategory.name?.trim()}
                onClick={handleSaveCategory}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                Save Category 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
