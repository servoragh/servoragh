"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Flame,
  Smartphone,
  Laptop,
  Shirt,
  Wrench,
  HardHat,
  Tractor,
  Wheat,
  Briefcase,
  Scissors,
  Home,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface CategoryGridSectionProps {
  onPostRequestClick?: () => void;
}

export function CategoryGridSection({ onPostRequestClick }: CategoryGridSectionProps) {
  const categories = [
    {
      label: "Post Job Request",
      desc: "Get instant artisan bids",
      icon: Plus,
      color: "from-amber-500 to-amber-400 text-stone-950 font-black",
      isAction: true,
      onClick: onPostRequestClick,
    },
    {
      label: "Electrical & Solar",
      desc: "Wiring, inverters & pumps",
      icon: HardHat,
      color: "from-amber-500/20 to-amber-600/20 text-amber-500 border-amber-500/30",
      href: "/services/electricians/tamale",
    },
    {
      label: "Phones & Tech",
      desc: "Mobiles, laptops & repairs",
      icon: Smartphone,
      color: "from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30",
      href: "/products?category=Electronics",
    },
    {
      label: "Fugu & Tailoring",
      desc: "Traditional Dagbon wear",
      icon: Shirt,
      color: "from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30",
      href: "/products?category=Fashion%20%26%20Fugu",
    },
    {
      label: "Tool & Heavy Rentals",
      desc: "Generators, drills & mixers",
      icon: Tractor,
      color: "from-teal-500/20 to-teal-600/20 text-teal-400 border-teal-500/30",
      href: "/rentals",
    },
    {
      label: "Agribusiness & Farm",
      desc: "Produce, seeds & equipment",
      icon: Wheat,
      color: "from-lime-500/20 to-lime-600/20 text-lime-400 border-lime-500/30",
      href: "/products?category=Agribusiness",
    },
    {
      label: "Trending Requests",
      desc: "Popular local jobs",
      icon: Flame,
      color: "from-rose-500/20 to-rose-600/20 text-rose-400 border-rose-500/30",
      href: "/requests?sort=popular",
    },
    {
      label: "Artisan Services",
      desc: "Plumbers, carpenters & masons",
      icon: Wrench,
      color: "from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30",
      href: "/requests",
    },
    {
      label: "Electronics & Appliances",
      desc: "TVs, fridges & sound",
      icon: Laptop,
      color: "from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
      href: "/products?category=Electronics",
    },
    {
      label: "Custom Tailoring",
      desc: "Smock weaving & fitting",
      icon: Scissors,
      color: "from-fuchsia-500/20 to-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30",
      href: "/services/fugu-tailors/tamale",
    },
    {
      label: "Property & Land Sites",
      desc: "Real estate & plot ads",
      icon: Home,
      color: "from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30",
      href: "/community",
    },
    {
      label: "Jobs & Gigs",
      desc: "Work opportunities",
      icon: Briefcase,
      color: "from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30",
      href: "/community",
    },
  ];

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Explore 18 Universal Industry Verticals</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium mt-1">
              Browse products, artisan services, equipment rentals, and trade calls across Northern Ghana.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline group"
          >
            <span>View All Verticals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2 columns on Mobile, 3 on Tablet, 6 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;

            if (cat.isAction) {
              return (
                <button
                  key={idx}
                  onClick={cat.onClick}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 text-stone-950 shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition duration-200 cursor-pointer text-left flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-950/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-stone-950" />
                  </div>
                  <div>
                    <span className="block text-sm font-black tracking-tight leading-tight">
                      {cat.label}
                    </span>
                    <span className="block text-[11px] font-bold opacity-80 mt-0.5">
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={cat.href || "#"}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 hover:border-emerald-500/50 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:-translate-y-1 transition duration-200 text-left flex flex-col justify-between group shadow-2xs"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-stone-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-tight">
                    {cat.label}
                  </span>
                  <span className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {cat.desc}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
