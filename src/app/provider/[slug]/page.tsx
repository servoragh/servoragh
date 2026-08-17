"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Briefcase, PhoneCall, ShieldCheck, CheckCircle2, ArrowLeft, Share2, ShoppingBag, Globe, QrCode } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { DigitalBusinessCardModal } from "@/components/DigitalBusinessCardModal";
import { calculateTrustScore, parseJsonArray, formatGHS, formatDate } from "@/lib/utils";

export default function ProviderProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [provider, setProvider] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    if (slug) fetchProvider();
  }, [slug]);

  async function fetchProvider() {
    try {
      setLoading(true);
      const res = await fetch(`/api/providers/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Provider not found.");
      setProvider(data.provider);
      setReviews(data.reviews || []);

      // Fetch active products by this provider
      const prodRes = await fetch(`/api/products?provider=${slug}`);
      const prodData = await prodRes.json();
      if (prodData.products) setProducts(prodData.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-stone-500">
        Loading provider profile...
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Provider Profile Not Found</h2>
        <p className="text-stone-500 text-sm mb-4">{error || "The requested artisan profile does not exist."}</p>
        <Link href="/" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const badgesList = parseJsonArray(provider.badges);
  const portfolioUrls = parseJsonArray(provider.portfolioUrls);

  const trustScore = calculateTrustScore({
    verificationStatus: provider.verificationStatus,
    isPhoneVerified: provider.user?.isPhoneVerified,
    ratingAverage: provider.ratingAverage,
    reviewCount: provider.reviewCount,
    completedJobsCount: provider.completedJobsCount,
    responseRate: provider.responseRate || 98,
    yearsExperience: provider.yearsExperience,
  });

  const shareText = `Check out ${provider.businessName} on Servora Tamale! Verified local artisan offering reliable services in ${provider.serviceArea}. https://servora.vercel.app/provider/${provider.slug}`;
  const directMessage = `Hello ${provider.businessName}, I saw your verified profile on Servora Tamale and I would like to request a price quote for a job.`;

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-3xl flex items-center justify-center border border-emerald-300 dark:border-emerald-700 shrink-0 overflow-hidden shadow-md">
                {provider.logoUrl || provider.user?.avatarUrl ? (
                  <img
                    src={provider.logoUrl || provider.user?.avatarUrl}
                    alt={provider.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  provider.businessName.charAt(0)
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                    {provider.businessName}
                  </h1>
                  {provider.verificationStatus === "VERIFIED" && (
                    <TrustBadge type="IDENTITY_VERIFIED" size="sm" />
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Artisan: <strong className="text-stone-800 dark:text-stone-200">{provider.user?.name}</strong></span>
                  <span>•</span>
                  <span>{provider.yearsExperience} Years Experience in Tamale</span>
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <MapPin className="w-3.5 h-3.5" /> {provider.serviceArea}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {provider.ratingAverage > 0 ? provider.ratingAverage.toFixed(1) : "New"} ({provider.reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-purple-600">
                    <Briefcase className="w-3.5 h-3.5" /> {provider.completedJobsCount} Jobs Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Score Box */}
            <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 rounded-2xl p-4 text-center min-w-[200px] w-full md:w-auto">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                VERIFICATION & TRUST SCORE
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {trustScore}%
              </div>
              <span className="text-[11px] text-stone-500 font-semibold mt-1 block">
                {provider.verificationStatus === "VERIFIED" ? "Verified Local Business" : "Pending Verification"}
              </span>
            </div>
          </div>

          {/* Verification Badges Row */}
          <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 flex-wrap">
            {provider.websiteUrl && (
              <a
                href={provider.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:underline transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Official Website 🌐 ({provider.websiteUrl.replace(/^https?:\/\//, '')})</span>
              </a>
            )}
            {provider.user?.isPhoneVerified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone Verified
              </span>
            )}
            {badgesList.map((badge: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {badge}
              </span>
            ))}
          </div>

          {/* Direct Customer Actions Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow transition text-center"
            >
              Request Quote From {provider.businessName}
            </button>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="w-full sm:w-auto px-4 py-3.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs rounded-2xl border border-stone-700 transition flex items-center justify-center gap-2"
              title="Digital QR Business Card"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>QR Card</span>
            </button>
            <WhatsAppShareButton
              phone={provider.user?.phone}
              text={directMessage}
              variant="direct"
              className="w-full sm:w-auto"
            />
            <WhatsAppShareButton
              phone={provider.user?.phone}
              text={shareText}
              variant="share"
              className="w-full sm:w-auto"
            />
          </div>

          <DigitalBusinessCardModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            businessName={provider.businessName}
            slug={provider.slug}
            serviceArea={provider.serviceArea}
            phone={provider.user?.phone}
            ratingAverage={provider.ratingAverage}
            verificationStatus={provider.verificationStatus}
          />
        </div>

        {/* Content Showcase: About, Services, Products & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Bio & Description */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-3">About the Artisan</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {provider.bio}
              </p>

              {/* Services Offered Badges */}
              <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                <h4 className="text-xs font-bold text-stone-900 dark:text-white mb-2">Services Offered</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {provider.services && provider.services.length > 0 ? (
                    provider.services.map((ps: any) => (
                      <span
                        key={ps.service.id}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold"
                      >
                        {ps.service.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">General Services</span>
                  )}
                </div>
              </div>
            </div>

            {/* Products / Ads Offered */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                  Products & Catalog ({products.length})
                </h3>
              </div>

              {products.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                  <p className="text-xs text-stone-400">No products or items posted yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Customer Reviews</h3>
                <span className="text-xs text-stone-400 font-semibold">{reviews.length} Verified Feedback</span>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-stone-400">No reviews yet for this provider.</p>
              ) : (
                <div className="space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                            {rev.customer?.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-xs font-bold text-stone-900 dark:text-white">
                            {rev.customer?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">{rev.comment}</p>
                      <span className="text-[10px] text-stone-400 mt-1 block">{formatDate(rev.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-3">
                Pricing & Availability
              </h3>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Hourly Rate</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {provider.pricingHourly ? formatGHS(provider.pricingHourly) + "/hr" : "Negotiable"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Starting Price</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {provider.pricingFixedStart ? formatGHS(provider.pricingFixedStart) : "Free Quote"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Response Speed</span>
                <span className="font-bold text-purple-600">&lt; 15 minutes</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Service Coverage</span>
                <span className="font-bold text-stone-900 dark:text-white truncate max-w-[140px]">
                  {provider.serviceArea}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
