"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, MapPin, ArrowLeft, Star, ShieldCheck, Tag, Eye } from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { ProductQASubsystem } from "@/components/ProductQASubsystem";
import { TrustBadge } from "@/components/TrustBadge";
import { formatGHS, parseJsonArray } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Product not found.");
      setProduct(data.product);
    } catch (err: any) {
      setError(err.message);
    } fontFinally: {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-stone-500">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Product Not Found</h2>
        <Link href="/products" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = parseJsonArray(product.images);
  const mainImage = images[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPct = hasDiscount ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100) : 0;

  const whatsappText = `Hello ${product.provider?.businessName}, I would like to buy/inquire about your product "${product.title}" (${formatGHS(product.price)}) on Servora Tamale. https://servora.vercel.app/products/${product.slug}`;

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-600">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="w-full h-80 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative">
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
              {hasDiscount && (
                <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> {discountPct}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full mb-3 inline-block">
                {product.category}
              </span>

              <h1 className="text-2xl font-black text-stone-900 dark:text-white mb-2">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatGHS(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through font-semibold">
                    {formatGHS(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>

              {/* Seller Business Card */}
              <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-100 dark:border-stone-700 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-lg flex items-center justify-center border border-emerald-300 dark:border-emerald-700 shrink-0 overflow-hidden shadow-sm">
                  {product.provider?.logoUrl || product.provider?.user?.avatarUrl ? (
                    <img
                      src={product.provider?.logoUrl || product.provider?.user?.avatarUrl}
                      alt={product.provider?.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    product.provider?.businessName?.charAt(0) || "B"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Sold By Verified Local Business</span>
                  <Link
                    href={`/provider/${product.provider?.slug}`}
                    className="font-bold text-sm text-stone-900 dark:text-white hover:text-emerald-600 transition truncate block"
                  >
                    {product.provider?.businessName}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {product.provider?.serviceArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {product.provider?.ratingAverage > 0 ? product.provider?.ratingAverage : "New"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
              <WhatsAppShareButton
                variant="direct"
                phone={product.provider?.user?.phone}
                text={whatsappText}
                label="Order via WhatsApp"
                className="w-full py-3.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Public Product Q&A Widget */}
        <ProductQASubsystem
          productId={product.id}
          vendorName={product.provider?.businessName}
        />
      </div>
    </div>
  );
}
