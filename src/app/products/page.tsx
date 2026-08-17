"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, PlusCircle, Search, Filter, MapPin } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { PostProductModal } from "@/components/PostProductModal";

export default function ProductsMarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  async function fetchProducts() {
    try {
      setLoading(true);
      let url = "/api/products";
      const queryParams: string[] = [];
      if (selectedCategory) queryParams.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchProducts();
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full mb-2 border border-emerald-300">
              <ShoppingBag className="w-3.5 h-3.5" /> Northern Business Marketplace
            </div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Local Products & Supplies for Sale
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Buy phone accessories, replacement parts, handmade Northern Fugu smocks, and electrical supplies directly from verified local Tamale shops.
            </p>
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Product for Sale</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-3xl mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products (e.g. copper cable, Samsung screen, Fugu smock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-stone-900 dark:text-white outline-none w-full"
            />
            <button type="submit" className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "", label: "All Items" },
              { id: "Electronics", label: "Electronics" },
              { id: "Electrical Supplies", label: "Electrical" },
              { id: "Fashion & Fugu", label: "Fugu & Fashion" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12 text-stone-500 text-sm">Loading marketplace products...</div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl text-center border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white mb-2">No Products Found</h3>
            <p className="text-xs text-stone-500 mb-4">Be the first local business to list a product in Tamale!</p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Post Product Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <PostProductModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
