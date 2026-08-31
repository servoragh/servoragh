"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  MapPin,
  ArrowLeft,
  Star,
  ShieldCheck,
  Tag,
  Eye,
  CheckCircle2,
  Heart,
  Share2,
  Flag,
  MessageCircle,
  Phone,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Send,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  HelpCircle,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { EscrowDealModal } from "@/components/EscrowDealModal";
import { TrustBadge } from "@/components/TrustBadge";
import { PresenceBadge } from "@/components/PresenceBadge";
import { formatExactDateTime } from "@/lib/timeFormatter";
import { formatGHS } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Live Data State
  const [product, setProduct] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // UI & Interaction State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Modals
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Q&A Inputs
  const [newQuestionText, setNewQuestionText] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [sellerAnswerText, setSellerAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Review Form Inputs
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewPhotos, setNewReviewPhotos] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Report Form Inputs
  const [reportReason, setReportReason] = useState("MISLEADING_PRICE");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProductDetails();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [slug]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft" && product?.images?.length > 1) {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
      }
      if (e.key === "ArrowRight" && product?.images?.length > 1) {
        setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, product]);

  async function fetchProductDetails() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Product not found.");

      setProduct(data.product);
      setIsLiked(Boolean(data.isLiked));
      setLikesCount(data.likesCount || data.product?.likesCount || 0);
      setQuestions(data.questions || []);
      setReviews(data.reviews || []);
      setReviewsSummary(data.reviewsSummary || null);
      setRecommendations(data.recommendations || []);
      setActiveImageIndex(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Like Toggle with Optimistic Feedback
  async function handleToggleLike() {
    const nextState = !isLiked;
    const nextCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextState);
    setLikesCount(nextCount);

    try {
      const res = await fetch(`/api/products/${slug}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        // Revert if error
        setIsLiked(!nextState);
        setLikesCount(likesCount);
      } else {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch {
      setIsLiked(!nextState);
      setLikesCount(likesCount);
    }
  }

  // Share Actions
  function handleCopyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleShareWhatsApp() {
    if (!product) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(
      `Check out this verified listing on Servora.gh:\n*${product.title}*\nPrice: GH₵ ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}\nLocation: ${product.area}\n\nView details: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleOrderWhatsApp() {
    if (!product) return;
    const phone = (product.seller?.whatsapp || product.seller?.phone || "+233240000000").replace(/[^0-9]/g, "");
    const cleanPhone = phone.startsWith("0") ? "233" + phone.slice(1) : phone.startsWith("233") ? phone : "233" + phone;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const message = encodeURIComponent(
      `Hello ${product.seller?.businessName || product.seller?.name},\n\nI saw your listing on Servora.gh: *${product.title}* (GH₵ ${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}).\n\nI would like to order this item / arrange delivery in ${product.area}.\nItem link: ${url}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  }

  async function handleStartNativeChat() {
    if (!product) return;
    try {
      const recipientId = product.seller?.id || product.provider?.id;
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "C2B",
          recipientId,
          productId: product.id,
          title: `Inquiry: ${product.title}`,
        }),
      });
      const data = await res.json();
      if (data.room?.id) {
        router.push(`/messages?roomId=${data.room.id}`);
      } else {
        router.push("/messages");
      }
    } catch (_) {
      router.push("/messages");
    }
  }

  // Question Submission
  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/products/${slug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestionText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit question.");

      if (data.question) {
        setQuestions((prev) => [data.question, ...prev]);
        setNewQuestionText("");
      }
    } catch (err: any) {
      alert(err.message || "Please log in to ask a question.");
    } finally {
      setSubmittingQuestion(false);
    }
  }

  // Answer Submission
  async function handleAnswerQuestion(questionId: string) {
    if (!sellerAnswerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/products/${slug}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer: sellerAnswerText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post answer.");

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answer: sellerAnswerText.trim(), answeredBy: "Verified Seller", answeredAt: new Date() }
            : q
        )
      );
      setAnsweringQuestionId(null);
      setSellerAnswerText("");
    } catch (err: any) {
      alert(err.message || "Failed to post answer.");
    } finally {
      setSubmittingAnswer(false);
    }
  }

  // Review Submission
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          title: newReviewTitle.trim() || "Verified Purchase Review",
          comment: newReviewComment.trim(),
          photos: newReviewPhotos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review.");

      if (data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setIsReviewModalOpen(false);
        setNewReviewComment("");
        setNewReviewTitle("");
        setNewReviewPhotos([]);
        setNewPhotoInput("");
        fetchProductDetails();
      }
    } catch (err: any) {
      alert(err.message || "Please log in to submit a review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  // Report Submission
  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/products/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDetails.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report.");
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDetails("");
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Loading Verified Product...</h2>
        <p className="text-xs text-stone-500 mt-1">Connecting to Northern Ghana Trade Registry</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Listing Not Found</h2>
        <p className="text-sm text-stone-500 max-w-md mb-6">
          This classified listing or marketplace product may have expired, been marked as sold, or removed.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
        >
          Explore Tamale Marketplace
        </Link>
      </div>
    );
  }

  const images: string[] = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80"];

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const savings = hasDiscount ? product.originalPrice - product.price : 0;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 pb-24 md:pb-16 antialiased">
      {/* Top Header / Breadcrumb Bar */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like Heart Button */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isLiked
                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current scale-110" : ""}`} />
              <span>{likesCount}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Report Button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-red-500 transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-12">
        {/* =========================================================================
            SECTION A: MAIN PRODUCT SHOWCASE CARD (2-COLUMN GRID)
            ========================================================================= */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Media Carousel & Interactive Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 group">
                <img
                  src={images[activeImageIndex]}
                  alt={product.title}
                  onClick={() => setIsLightboxOpen(true)}
                  className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-300 ${
                    isZoomed ? "scale-125" : "scale-100 group-hover:scale-105"
                  }`}
                />

                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                  {hasDiscount && (
                    <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-[11px] rounded-lg tracking-wider shadow-md">
                      🏷️ {product.discountPercent}% OFF
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-md text-white font-bold text-[11px] rounded-lg shadow-md border border-white/10">
                    {product.condition === "BRAND_NEW"
                      ? "✨ Brand New"
                      : product.condition === "REFURBISHED"
                      ? "🔧 Refurbished"
                      : "✓ Tested Working"}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[11px] rounded-lg shadow-md">
                    ✓ In Stock: {product.stockQuantity} available
                  </span>
                </div>

                {/* Lightbox Trigger Icon */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 p-2 bg-stone-950/70 backdrop-blur-md hover:bg-stone-950 text-white rounded-xl shadow-lg transition-transform hover:scale-105"
                  title="Expand to Fullscreen Lightbox"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Left/Right Arrow Overlays for Multi-Photo */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Multi-Photo Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-16 sm:w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105"
                          : "border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Info & Sticky Checkout Hub */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category Pill & ID */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                    {product.category}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    ID: #{product.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                {/* Bold Primary Title & Exact Timestamp */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
                    {product.title}
                  </h1>
                  {product.createdAt && (
                    <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 mt-1">
                      📅 {formatExactDateTime(product.createdAt)}
                    </p>
                  )}
                </div>

                {/* Price Block */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                      GH₵ {Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    {hasDiscount && (
                      <span className="text-base text-stone-400 line-through font-semibold">
                        GH₵ {Number(product.originalPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs rounded-lg">
                      Save GH₵ {savings.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({product.discountPercent}%)
                    </span>
                  )}
                </div>

                {/* Description Text */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Specifications & Scope</h3>
                  <div className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed bg-stone-50/50 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800/60">
                    {product.description}
                  </div>
                </div>

                {/* Key Attributes Badges */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate font-semibold text-stone-700 dark:text-stone-300">{product.area}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs">
                    <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate font-semibold text-stone-700 dark:text-stone-300">Express Delivery Available</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate font-semibold text-stone-700 dark:text-stone-300">100% Buyer Protected</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-xs">
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="truncate font-semibold text-stone-700 dark:text-stone-300">Verified Condition</span>
                  </div>
                </div>

                {/* Seller Trust Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-50/50 via-white to-stone-50 dark:from-stone-800/50 dark:via-stone-900 dark:to-stone-800/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> SOLD BY VERIFIED LOCAL BUSINESS
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.seller?.ratingAverage || "5.0"}</span>
                      <span className="text-stone-400 font-normal">({product.seller?.reviewsCount || 18})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.seller?.logoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80"}
                        alt={product.seller?.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                          {product.seller?.businessName || product.seller?.name}
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-current text-white dark:text-stone-900" />
                        </h4>
                        <div className="mt-1">
                          <PresenceBadge
                            businessSlug={product.seller?.slug}
                            userId={product.seller?.id}
                            initialIsOnline={product.seller?.isOnline}
                            initialLastSeen={product.seller?.lastSeen}
                            businessHours={product.seller?.businessHours}
                          />
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{product.seller?.zone || product.area}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/biz/${product.seller?.slug || "royals-motors"}`}
                      className="px-3.5 py-1.5 bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                    >
                      <span>View Storefront</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Primary Action Row */}
              <div className="space-y-2 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp Order */}
                  <button
                    onClick={handleOrderWhatsApp}
                    className="sm:col-span-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    <span>✈️ Order via WhatsApp</span>
                  </button>

                  {/* MoMo Escrow Safe Buy */}
                  <button
                    onClick={() => setIsEscrowModalOpen(true)}
                    className="py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-stone-950" />
                    <span>Safe Escrow</span>
                  </button>
                </div>

                {/* Direct Native Servora Chat with Seller */}
                <button
                  onClick={handleStartNativeChat}
                  className="w-full py-3 px-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>💬 Chat on Servora (Ask about this item)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: CUSTOMER QUESTIONS & ANSWERS (COMMUNITY Q&A)
            ========================================================================= */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <span>Customer Questions & Answers ({questions.length})</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ask {product.seller?.businessName || product.seller?.name} or past buyers in Tamale
              </p>
            </div>
          </div>

          {/* Interactive Input Bar */}
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder="Have a question about specs, warranty, or delivery in Tamale?"
              className="flex-1 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={submittingQuestion || !newQuestionText.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-2xl transition-all shadow-md flex items-center gap-1.5"
            >
              {submittingQuestion ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask Question</span>
                </>
              )}
            </button>
          </form>

          {/* Threaded Answers List */}
          <div className="space-y-4 pt-2">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No questions yet. Be the first to ask about this listing!
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-800 dark:text-stone-200">
                          {q.asker?.name || "Customer Member"}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        Q: {q.question}
                      </p>
                    </div>
                  </div>

                  {/* Threaded Seller Answer */}
                  {q.answer ? (
                    <div className="ml-4 pl-4 border-l-2 border-emerald-500 space-y-1 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-r-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Seller
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300">
                        A: {q.answer}
                      </p>
                    </div>
                  ) : answeringQuestionId === q.id ? (
                    <div className="ml-4 pl-4 border-l-2 border-emerald-500 space-y-2 pt-2">
                      <textarea
                        value={sellerAnswerText}
                        onChange={(e) => setSellerAnswerText(e.target.value)}
                        placeholder="Write verified answer as seller/admin..."
                        rows={2}
                        className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAnswerQuestion(q.id)}
                          disabled={submittingAnswer}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                        >
                          {submittingAnswer ? "Posting..." : "Post Answer"}
                        </button>
                        <button
                          onClick={() => setAnsweringQuestionId(null)}
                          className="px-3 py-1.5 bg-stone-200 dark:bg-stone-700 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAnsweringQuestionId(q.id);
                        setSellerAnswerText("");
                      }}
                      className="ml-4 text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      + Answer this question
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION C: VERIFIED CUSTOMER REVIEWS & STAR RATINGS
            ========================================================================= */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span>Verified Customer Reviews</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Real verified ratings from Tamale buyers & clients</p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
            >
              Write a Review
            </button>
          </div>

          {/* Review Summary Breakdown Block */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200/70 dark:border-stone-800">
            {/* Left Rating Stat */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-700">
              <span className="text-5xl font-black text-stone-900 dark:text-white">
                {reviewsSummary?.averageRating?.toFixed(1) || "5.0"}
              </span>
              <div className="flex items-center gap-1 text-amber-500 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-stone-500 font-semibold">
                Based on {reviewsSummary?.totalReviews || reviews.length} verified reviews
              </span>
            </div>

            {/* Right 5-Star Visual Breakdown Bars */}
            <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsSummary?.ratingCounts?.[star] || 0;
                const pct = reviewsSummary?.ratingPercentages?.[star] || (star === 5 && reviews.length === 0 ? 100 : 0);
                return (
                  <div key={star} className="flex items-center gap-3 text-xs font-semibold text-stone-600 dark:text-stone-400">
                    <span className="w-8 flex items-center gap-1 font-bold">
                      {star} <Star className="w-3 h-3 text-amber-500 fill-current" />
                    </span>
                    <div className="flex-1 h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-stone-400 text-[11px]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Feed */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No reviews yet. Be the first to share your experience with this seller!
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {rev.author?.name ? rev.author.name[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 dark:text-white">
                            {rev.author?.name || "Verified Customer"}
                          </span>
                          {rev.isVerified && (
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md border border-emerald-200 dark:border-emerald-800">
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-current" : "text-stone-300 dark:text-stone-700"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-2">{rev.comment}</p>

                  {/* Review Photos Gallery */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex gap-2 pt-2 overflow-x-auto">
                      {rev.photos.map((p: string, pIdx: number) => (
                        <img
                          key={pIdx}
                          src={p}
                          alt="Review attachment"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 dark:border-stone-700 cursor-pointer hover:opacity-90"
                        />
                      ))}
                    </div>
                  )}

                  {/* Verified Merchant Response */}
                  {rev.sellerReply && (
                    <div className="mt-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Official Merchant Response</span>
                        </span>
                        {rev.sellerRepliedAt && (
                          <span className="text-[10px] text-stone-400">
                            {new Date(rev.sellerRepliedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 italic">
                        &quot;{rev.sellerReply}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION D: SMART DYNAMIC RECOMMENDATIONS ("YOU MAY ALSO LIKE")
            ========================================================================= */}
        {recommendations.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>You May Also Like</span>
                </h2>
                <p className="text-xs text-stone-500">Related listings & top trending items in Northern Ghana</p>
              </div>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                View All in {product.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/products/${rec.slug}`}
                  className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <img
                        src={rec.image}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {rec.discountPercent > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md">
                          {rec.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
                        {rec.category}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{rec.area}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-baseline justify-between border-t border-stone-100 dark:border-stone-800 mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                        GH₵ {Number(rec.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-500">
                      ★ {rec.sellerRating || "5.0"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          STICKY MOBILE CHECKOUT BAR
          ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3 px-4 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-400 font-bold uppercase">Total Price</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">
            GH₵ {Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEscrowModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow</span>
          </button>

          <button
            onClick={handleOrderWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1"
          >
            <span>Order WhatsApp ✈️</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          LIGHTBOX MODAL
          ========================================================================= */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 bg-stone-800/80 hover:bg-stone-700 text-white rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt="Fullscreen view"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SHARE MODAL
          ========================================================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">Share this Listing</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <span>Share to WhatsApp Status & Chats</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied to Clipboard!" : "Copy Listing Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REVIEW SUBMISSION MODAL
          ========================================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">Write a Verified Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${s <= newRating ? "fill-current" : "text-stone-300 dark:text-stone-700"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Comment */}
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Your Experience</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Describe item quality, packaging, delivery speed, or communication..."
                  className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Photo Upload Attachment */}
              <div>
                <label className="text-xs font-bold text-stone-500 block mb-1">Attach Review Photos (Optional)</label>
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700/80 border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl cursor-pointer transition">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">📷 Choose Photo Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          Array.from(files).forEach((file) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (reader.result) {
                                setNewReviewPhotos((prev) => [...prev, reader.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                    />
                  </label>

                  {newReviewPhotos.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-1">
                      {newReviewPhotos.map((p, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                          <img src={p} alt="Review upload" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewReviewPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 bg-stone-900/80 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black hover:bg-rose-600 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
              >
                {submittingReview ? "Publishing Review..." : "Submit Verified Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          REPORT LISTING MODAL
          ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span>Report this Listing</span>
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-center text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <p>Report Submitted Successfully</p>
                <p className="text-[11px] font-normal text-stone-500">
                  Our Northern Ghana trust & safety moderators will review this listing within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                  >
                    <option value="MISLEADING_PRICE">Misleading Price or Fake Discount</option>
                    <option value="SUSPICIOUS_ITEM">Counterfeit or Prohibited Item</option>
                    <option value="UNRESPONSIVE_SELLER">Unresponsive or Fake Contact</option>
                    <option value="SCAM_ATTEMPT">Suspected Advance Fee / Scam</option>
                    <option value="INCORRECT_LOCATION">Incorrect Zone or Area</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional details to assist admin moderation..."
                    className="w-full px-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  {submittingReport ? "Submitting..." : "Submit Report to Admin"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Escrow Deal Creation Modal */}
      <EscrowDealModal
        isOpen={isEscrowModalOpen}
        onClose={() => setIsEscrowModalOpen(false)}
        sellerName={product.seller?.name || "Verified Local Enterprise"}
        sellerBusinessName={product.seller?.businessName || product.seller?.name}
        sellerPhone={product.seller?.phone || "+233240000000"}
        defaultTitle={`Order: ${product.title}`}
      />
    </div>
  );
}
