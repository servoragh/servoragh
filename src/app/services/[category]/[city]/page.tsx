"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { ProviderCard } from "@/components/ProviderCard";
import { RequestWizardModal } from "@/components/RequestWizardModal";

export default function ServiceSeoPage() {
  const params = useParams();
  const categorySlug = (params?.category as string) || "electricians";
  const city = (params?.city as string) || "tamale";

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const formattedCategory = categorySlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);

  useEffect(() => {
    fetchProviders();
  }, [categorySlug]);

  async function fetchProviders() {
    try {
      setLoading(true);
      const res = await fetch(`/api/providers?category=${categorySlug}`);
      const data = await res.json();
      if (data.providers) setProviders(data.providers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-12 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO Header */}
        <div className="bg-stone-900 text-white rounded-3xl p-8 mb-10 border border-stone-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs font-bold rounded-full">
              <ShieldCheck className="w-4 h-4" /> Verified Local Services in {formattedCity}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">
              Top Rated {formattedCategory} in {formattedCity}, Ghana
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              Find and hire verified {formattedCategory.toLowerCase()} in Sakasaka, Nyohini, Choggu, Aboabo, and across {formattedCity}. Compare ratings, check trust badges, and request free quotes.
            </p>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Post Job & Get Quotes in {formattedCity}
            </button>
          </div>
        </div>

        {/* Provider List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
            Available {formattedCategory} ({providers.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              Searching for verified {formattedCategory.toLowerCase()} in {formattedCity}...
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl text-center border border-stone-200 dark:border-stone-800">
              <h4 className="font-bold text-stone-900 dark:text-white mb-2">
                No active {formattedCategory.toLowerCase()} found yet in this category.
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Submit a service request and our Tamale dispatch system will alert local artisans.
              </p>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Request a Service Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
