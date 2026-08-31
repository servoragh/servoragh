"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tag, MapPin, Star, ShoppingBag, Eye, CheckCircle2, Play } from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { formatGHS, parseJsonArray } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/timeFormatter";

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
    images?: string | string[];
    videoUrl?: string | null;
    createdAt?: string | Date;
    provider?: {
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
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const images = Array.isArray(product.images) ? product.images : parseJsonArray(product.images);
  const mainImage = imgError || !images[0]
    ? "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80"
    : images[0];

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPct = hasDiscount ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100) : 0;

  const sellerLogo = product.provider?.logoUrl || product.provider?.user?.avatarUrl;
  const whatsappMessage = `Hello ${product.provider?.businessName || "Vendor"}, I saw your product "${product.title}" (${formatGHS(product.price)}) listed on Servora Tamale and I would like to purchase/inquire.`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate to product page
    router.push(`/products/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
    >
      <div>
        {/* Product Image */}
        <div className="relative h-36 sm:h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <img
            src={mainImage}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition duration-500 ease-out"
          />

          {/* Category Overlay Pill */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-stone-900 dark:text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-stone-200/80 dark:border-stone-700 shadow-2xs max-w-[80%] truncate">
            {product.category}
          </div>

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1">
            {product.videoUrl && (
              <span className="bg-purple-600/90 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-white" /> Video
              </span>
            )}
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="bg-amber-500 text-stone-950 font-black text-[9px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{discountPct}%</span>
              </div>
            )}
          </div>

          {/* Product Posted Date Overlay (Bottom Right of Image) */}
          {product.createdAt && (
            <div className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/15 shadow-sm">
              🕒 {formatRelativeTime(product.createdAt)}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-5">
          <h3 className="font-bold text-stone-900 dark:text-white text-xs sm:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 mb-1.5 block leading-snug">
            {product.title}
          </h3>

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
          {product.provider && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/provider/${product.provider?.slug}`);
                }}
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
              </span>

              <div className="flex items-center gap-0.5 shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[60px] sm:max-w-[90px]">{product.provider?.serviceArea?.split(",")[0]}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-3 sm:p-5 pt-0 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${product.slug}`);
          }}
          className="flex-1 py-2 text-center text-[10px] sm:text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition truncate"
        >
          View Details
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <WhatsAppShareButton
            variant="direct"
            phone={product.provider?.user?.phone}
            text={whatsappMessage}
            label="Buy"
            className="py-1.5 px-2.5 sm:py-2 sm:px-3 text-[10px] sm:text-xs font-bold"
          />
        </div>
      </div>
    </div>
  );
}
