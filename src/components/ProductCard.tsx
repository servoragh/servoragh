"use client";

import React from "react";
import Link from "next/link";
import { Tag, MapPin, Star, ShoppingBag, Eye } from "lucide-react";
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
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-700">
            {product.category}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{discountPct}% OFF</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-stone-900 dark:text-white text-base hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-1 mb-1 block"
          >
            {product.title}
          </Link>

          {/* Price & Compare Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatGHS(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 font-semibold line-through">
                {formatGHS(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Seller Business Info */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <Link
              href={`/provider/${product.provider?.slug}`}
              className="font-semibold text-stone-800 dark:text-stone-200 hover:underline flex items-center gap-1.5 min-w-0"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden shrink-0">
                {sellerLogo ? (
                  <img src={sellerLogo} alt={product.provider?.businessName} className="w-full h-full object-cover" />
                ) : (
                  product.provider?.businessName?.charAt(0) || "B"
                )}
              </div>
              <span className="truncate max-w-[120px]">{product.provider?.businessName}</span>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{product.provider?.serviceArea?.split(",")[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <Link
          href={`/products/${product.slug}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition"
        >
          View Details
        </Link>
        <WhatsAppShareButton
          variant="direct"
          phone={product.provider?.user?.phone}
          text={whatsappMessage}
          label="Inquire/Buy"
          className="py-2 px-3 text-xs"
        />
      </div>
    </div>
  );
}
