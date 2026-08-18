"use client";

import React from "react";
import Link from "next/link";
import { Tag, MapPin, Star, ShoppingBag, Eye, CheckCircle2 } from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { formatGHS, parseJsonArray } from "@/lib/utils";

export interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    stockQuantity?: number;
    category: string;
    images?: string;
    provider: {
      businessName: string;
      slug: string;
      logoUrl?: string | null;
      serviceArea: string;
      ratingAverage: number;
      verificationStatus: string;
      user?: {
        name?: string;
        phone?: string;
        avatarUrl?: string | null;
      };
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseJsonArray(product.images);
  const mainImage = images[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPct = hasDiscount ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100) : 0;

  const sellerLogo = product.provider?.logoUrl || product.provider?.user?.avatarUrl;
  const whatsappMessage = `Hello ${product.provider?.businessName}, I saw your product "${product.title}" (${formatGHS(product.price)}) listed on Servora Tamale and I would like to purchase/inquire. https://servora.vercel.app/products/${product.slug}`;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-700 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="relative h-32 sm:h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          {/* Category Overlay Pill */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-stone-900 dark:text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-stone-200/80 dark:border-stone-700 shadow-2xs max-w-[80%] truncate">
            {product.category}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-stone-950 font-black text-[9px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{discountPct}%</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-5">
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-stone-900 dark:text-white text-xs sm:text-base hover:text-emerald-700 dark:hover:text-emerald-400 transition line-clamp-2 mb-1 block leading-snug"
          >
            {product.title}
          </Link>

          {/* Price & Compare Price */}
          <div className="flex flex-wrap items-baseline gap-1.5 mb-2">
            <span className="text-sm sm:text-lg font-black text-emerald-700 dark:text-emerald-400">
              {formatGHS(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-stone-400 font-semibold line-through">
                {formatGHS(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Seller Business Info */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">
            <Link
              href={`/provider/${product.provider?.slug}`}
              className="font-bold text-stone-800 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 min-w-0"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center overflow-hidden shrink-0">
                {sellerLogo ? (
                  <img src={sellerLogo} alt={product.provider?.businessName} className="w-full h-full object-cover" />
                ) : (
                  product.provider?.businessName?.charAt(0) || "B"
                )}
              </div>
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{product.provider?.businessName}</span>
            </Link>

            <div className="flex items-center gap-0.5 shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[60px] sm:max-w-[90px]">{product.provider?.serviceArea?.split(",")[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-3 sm:p-5 pt-0 flex items-center gap-1.5">
        <Link
          href={`/products/${product.slug}`}
          className="flex-1 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition truncate"
        >
          View
        </Link>
        <WhatsAppShareButton
          variant="direct"
          phone={product.provider?.user?.phone}
          text={whatsappMessage}
          label="Buy"
          className="py-1.5 px-2.5 sm:py-2 sm:px-3 text-[10px] sm:text-xs font-bold"
        />
      </div>
    </div>
  );
}
