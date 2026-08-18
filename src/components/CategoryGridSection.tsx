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
  Car,
  Home,
  Heart,
  Sparkles,
} from "lucide-react";

interface CategoryGridSectionProps {
  onPostRequestClick?: () => void;
}

export function CategoryGridSection({ onPostRequestClick }: CategoryGridSectionProps) {
  const categories = [
    {
      label: "Post Job",
      icon: Plus,
      color: "bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 font-black",
      isAction: true,
      onClick: onPostRequestClick,
    },
    {
      label: "Trending",
      icon: Flame,
      color: "bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400",
      href: "/requests?sort=popular",
    },
    {
      label: "Phones & Tech",
      icon: Smartphone,
      color: "bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400",
      href: "/products?category=Electronics",
    },
    {
      label: "Electronics",
      icon: Laptop,
      color: "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400",
      href: "/products?category=Electronics",
    },
    {
      label: "Fugu & Fashion",
      icon: Shirt,
      color: "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400",
      href: "/products?category=Fashion%20%26%20Fugu",
    },
    {
      label: "Services",
      icon: Wrench,
      color: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400",
      href: "/requests",
    },
    {
      label: "Repair & Solar",
      icon: HardHat,
      color: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400",
      href: "/services/electricians/tamale",
    },
    {
      label: "Tool Rentals",
      icon: Tractor,
      color: "bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400",
      href: "/rentals",
    },
    {
      label: "Agribusiness",
      icon: Wheat,
      color: "bg-lime-100 dark:bg-lime-950/80 text-lime-700 dark:text-lime-400",
      href: "/products?category=Agribusiness",
    },
    {
      label: "Tailoring",
      icon: Scissors,
      color: "bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400",
      href: "/services/fugu-tailors/tamale",
    },
    {
      label: "Property & Sites",
      icon: Home,
      color: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400",
      href: "/community",
    },
    {
      label: "Jobs & CVs",
      icon: Briefcase,
      color: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400",
      href: "/community",
    },
  ];

  return (
    <section className="py-6 sm:py-8 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Explore Northern Categories</span>
          </h3>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* 4 Columns on Mobile (grid-cols-4), 6 on Tablet, 12 on Desktop */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3 sm:gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;

            if (cat.isAction) {
              return (
                <button
                  key={idx}
                  onClick={cat.onClick}
                  className="flex flex-col items-center group cursor-pointer text-center"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.color} border border-amber-300 shadow-md group-hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center justify-center`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-amber-700 dark:text-amber-400 mt-1.5 leading-tight truncate max-w-full">
                    {cat.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={cat.href || "#"}
                className="flex flex-col items-center group text-center"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.color} border border-stone-200/80 dark:border-stone-800 shadow-2xs group-hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center justify-center`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mt-1.5 leading-tight truncate max-w-full">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
