"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { ProviderCard } from "@/components/ProviderCard";
import { ProductCard } from "@/components/ProductCard";

export default function NeighborhoodExplorerPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "sakasaka";

  const formattedArea = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [providers, setProviders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreaContent();
  }, [slug]);

  async function fetchAreaContent() {
    try {
      setLoading(true);
      const [provRes, prodRes] = await Promise.all([
        fetch(`/api/providers?area=${encodeURIComponent(formattedArea)}`),
        fetch(`/api/products?area=${encodeURIComponent(formattedArea)}`),
      ]);
      const provData = await provRes.json();
      const prodData = await prodRes.json();

      if (provData.providers) setProviders(provData.providers);
      if (prodData.products) setProducts(prodData.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Neighborhood Banner */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 mb-10 border border-stone-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
            <MapPin className="w-4 h-4" /> Tamale Neighborhood Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">
            Verified Services & Businesses in {formattedArea}, Tamale
          </h1>
          <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
            Discover verified artisans, service professionals, local products, and equipment for sale or rent specifically located in {formattedArea}.
          </p>
        </div>

        {/* Section 1: Artisans */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
            Service Artisans in {formattedArea} ({providers.length})
          </h2>
          {loading ? (
            <div className="text-stone-500 text-sm py-6">Loading {formattedArea} artisans...</div>
          ) : providers.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
              No registered providers in {formattedArea} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Products */}
        {products.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
              Products for Sale in {formattedArea} ({products.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
