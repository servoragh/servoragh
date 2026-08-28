"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  ArrowLeft,
  Star,
  ShieldCheck,
  Tag,
  Eye,
  Play,
  Film,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  // Keyboard navigation for lightbox (Escape to close, Arrows to navigate)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") {
        const imagesLen = Array.isArray(product?.images) ? product.images.length : parseJsonArray(product?.images).length;
        if (imagesLen > 1) {
          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imagesLen - 1));
        }
      }
      if (e.key === "ArrowRight") {
        const imagesLen = Array.isArray(product?.images) ? product.images.length : parseJsonArray(product?.images).length;
        if (imagesLen > 1) {
          setActiveImageIndex((prev) => (prev < imagesLen - 1 ? prev + 1 : 0));
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, product]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Product not found.");
      setProduct(data.product);
      if (data.product?.videoUrl && (!data.product.images || data.product.images === "[]")) {
        setMediaType("video");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
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

  const images = Array.isArray(product.images)
    ? product.images
    : parseJsonArray(product.images);
  const mainImage = images[activeImageIndex] || images[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPct = hasDiscount ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100) : 0;

  const whatsappText = `Hello ${product.provider?.businessName || product.business?.businessName || "Vendor"}, I would like to buy/inquire about your product "${product.title}" (${formatGHS(product.price)}) on Servora Tamale.`;

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-600">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image & Video Gallery */}
          <div className="space-y-3">
            {product.videoUrl && (
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setMediaType("image")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    mediaType === "image"
                      ? "bg-white dark:bg-stone-900 text-emerald-600 shadow-sm"
                      : "text-stone-500"
                  }`}
                >
                  📸 Photos ({images.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType("video")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    mediaType === "video"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-purple-600 font-bold"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" /> 30s Video
                </button>
              </div>
            )}

            {mediaType === "video" && product.videoUrl ? (
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-black border border-stone-200 dark:border-stone-700 relative flex items-center justify-center">
                <video
                  src={product.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="cursor-zoom-in group/img w-full h-80 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative"
              >
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-3 py-1.5 bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" /> View Full Size
                  </span>
                </div>
                {hasDiscount && (
                  <div className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> {discountPct}% OFF
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail Strip: Display ALL photos */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setMediaType("image");
                    }}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx && mediaType === "image"
                        ? "border-emerald-600 scale-105 shadow-md"
                        : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full inline-block">
                  {product.category}
                </span>
                {product.stockQuantity !== undefined && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                    {product.stockQuantity > 0 ? `✓ In Stock: ${product.stockQuantity} items` : "Sold Out"}
                  </span>
                )}
              </div>

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

      {/* FULLSCREEN HIGH-RES IMAGE LIGHTBOX & ZOOM MODAL */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none cursor-pointer"
        >
          {/* Lightbox Top Control Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-4 text-white z-10 cursor-default"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {product.title}
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-bold text-stone-300">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                title={isZoomed ? "Zoom Out" : "Zoom In"}
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                <span className="hidden sm:inline">{isZoomed ? "Fit to Screen" : "Zoom 1.5x"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-white/10 hover:bg-rose-600 rounded-full text-white transition-all"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden cursor-default"
          >
            <img
              src={images[activeImageIndex] || mainImage}
              alt={`${product.title} full view`}
              className={`max-h-[75vh] max-w-full object-contain rounded-xl transition-all duration-300 ${
                isZoomed ? "scale-150 cursor-grab" : "scale-100 cursor-zoom-in"
              }`}
              onClick={() => setIsZoomed((prev) => !prev)}
            />

            {/* Prev / Next Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all backdrop-blur-sm shadow-xl hover:scale-110"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all backdrop-blur-sm shadow-xl hover:scale-110"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Row */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 cursor-default"
          >
            {images.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIndex(idx);
                  setIsZoomed(false);
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  activeImageIndex === idx
                    ? "border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30"
                    : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
