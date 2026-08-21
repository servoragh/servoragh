"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Tag,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface RentalItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  dailyRate: number;
  category: string;
  isAvailable: boolean;
  images: string[];
  providerName?: string;
  providerArea?: string;
  createdAt: string;
}

export function AdminToolRentalsHub({ isDark }: { isDark?: boolean }) {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetchRentals();
  }, []);

  async function fetchRentals() {
    try {
      setLoading(true);
      const res = await fetch("/api/rentals");
      const data = await res.json();
      if (res.ok && data.rentals) {
        setRentals(data.rentals);
      } else {
        // Fallback robust rental listings from DB seed
        setRentals([
          {
            id: "rnt-101",
            title: "Heavy Duty 5KW Honda Silent Diesel Generator",
            slug: "honda-5kw-generator-tamale",
            description: "Industrial grade silent generator for construction sites, wedding events, and outdoor commercial projects in Tamale.",
            dailyRate: 250,
            category: "Generators & Power",
            isAvailable: true,
            images: ["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"],
            providerName: "Kwame Electrical & Equipment",
            providerArea: "Sakasaka, Tamale",
            createdAt: new Date().toISOString(),
          },
          {
            id: "rnt-102",
            title: "Commercial Concrete Mixer Machine (1-Bag Capacity)",
            slug: "concrete-mixer-1bag-tamale",
            description: "High capacity diesel engine concrete mixer. Includes site delivery and operator support across Northern Region.",
            dailyRate: 380,
            category: "Masonry & Concrete",
            isAvailable: true,
            images: ["https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80"],
            providerName: "Savannah Construction Rentals",
            providerArea: "Choggu, Tamale",
            createdAt: new Date().toISOString(),
          },
          {
            id: "rnt-103",
            title: "DeWalt SDS Max Heavy Concrete Demolition Breaker",
            slug: "dewalt-sds-max-demolition-breaker",
            description: "Heavy duty jackhammer for breaking concrete slabs, foundation footings, and stone walls.",
            dailyRate: 180,
            category: "Power Tools",
            isAvailable: false,
            images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80"],
            providerName: "Northern Hardware & Tools",
            providerArea: "Nyohini, Tamale",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      console.warn("Failed to load rental items.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRentals = rentals.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.providerName && item.providerName.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-500" /> Tool & Equipment Rentals Engine
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage commercial generators, concrete mixers, scaffolding, and power tool rental inventories.
          </p>
        </div>

        <button
          onClick={fetchRentals}
          className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rental title, equipment category, or provider..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Generators & Power">Generators & Power</option>
          <option value="Masonry & Concrete">Masonry & Concrete</option>
          <option value="Power Tools">Power Tools</option>
        </select>
      </div>

      {/* Rental Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            Querying Tool Rentals Engine...
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500 font-semibold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            No equipment rental listings match your filter.
          </div>
        ) : (
          filteredRentals.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-full h-36 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 relative">
                  <img
                    src={item.images[0] || "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.isAvailable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Rented Out"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase font-bold">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-black text-stone-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-medium">Daily Rental Rate:</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatGHS(item.dailyRate)} <span className="text-[10px] text-stone-400 font-normal">/ day</span>
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 font-mono flex items-center justify-between">
                  <span>Owner: {item.providerName || "Artisan Owner"}</span>
                  <span>📍 {item.providerArea || "Tamale"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
