"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, Briefcase, PhoneCall, ShieldCheck } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { calculateTrustScore, parseJsonArray, formatGHS } from "@/lib/utils";

export interface ProviderCardProps {
  provider: {
    id: string;
    slug: string;
    businessName: string;
    bio: string;
    serviceArea: string;
    yearsExperience: number;
    pricingHourly?: number | null;
    pricingFixedStart?: number | null;
    verificationStatus: string;
    ratingAverage: number;
    reviewCount: number;
    completedJobsCount: number;
    badges?: string;
    user: {
      name: string;
      phone: string;
      avatarUrl?: string | null;
      isPhoneVerified?: boolean;
    };
    services?: Array<{
      service: {
        name: string;
        category?: { name: string };
      };
    }>;
  };
  onRequestQuote?: (provider: any) => void;
}

export function ProviderCard({ provider, onRequestQuote }: ProviderCardProps) {
  const badgesList = parseJsonArray(provider.badges);
  const trustScore = calculateTrustScore({
    verificationStatus: provider.verificationStatus,
    isPhoneVerified: provider.user?.isPhoneVerified,
    ratingAverage: provider.ratingAverage,
    reviewCount: provider.reviewCount,
    completedJobsCount: provider.completedJobsCount,
    responseRate: 98,
    yearsExperience: provider.yearsExperience,
  });

  const whatsappMessage = `Hello ${provider.businessName}, I found your artisan profile on Servora Tamale and I would like to inquire about your local service availability.`;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Header: Name, Verified Indicator & Trust Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-lg flex items-center justify-center border border-emerald-300 dark:border-emerald-700">
              {provider.businessName.charAt(0)}
            </div>
            <div>
              <Link
                href={`/provider/${provider.slug}`}
                className="font-bold text-stone-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-1"
              >
                {provider.businessName}
              </Link>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {provider.user?.name} &bull; {provider.yearsExperience} yrs exp
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs px-2 py-1 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{trustScore}% Trust</span>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.verificationStatus === "VERIFIED" && (
            <TrustBadge type="IDENTITY_VERIFIED" size="sm" />
          )}
          {provider.ratingAverage >= 4.5 && (
            <TrustBadge type="TOP_RATED" size="sm" />
          )}
          {badgesList.map((badge: string) => (
            <TrustBadge key={badge} type={badge as any} size="sm" />
          ))}
        </div>

        {/* Description / Bio */}
        <p className="text-stone-600 dark:text-stone-300 text-sm line-clamp-2 mb-3">
          {provider.bio}
        </p>

        {/* Location & Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{provider.serviceArea}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {provider.ratingAverage > 0 ? provider.ratingAverage : "New"} ({provider.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{provider.completedJobsCount} jobs completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {provider.pricingFixedStart
                ? `From ${formatGHS(provider.pricingFixedStart)}`
                : provider.pricingHourly
                ? `${formatGHS(provider.pricingHourly)}/hr`
                : "Free Quote"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
        <Link
          href={`/provider/${provider.slug}`}
          className="flex-1 py-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition"
        >
          View Profile
        </Link>
        <WhatsAppShareButton
          variant="direct"
          phone={provider.user?.phone}
          text={whatsappMessage}
          label="WhatsApp"
          className="py-2 px-3 text-xs"
        />
      </div>
    </div>
  );
}
