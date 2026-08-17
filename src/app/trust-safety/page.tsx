import React from "react";
import { ShieldCheck, CheckCircle2, Award, Zap, Star } from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen py-16 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-white">Trust & Verification System</h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">
            Building authentic, verifiable trust for local service artisans in Tamale.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">Verification Badges</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-stone-100 dark:border-stone-800 rounded-2xl">
              <TrustBadge type="PHONE_VERIFIED" />
              <p className="text-xs text-stone-500 mt-2">Artisan phone number is verified via direct SMS/OTP confirmation.</p>
            </div>

            <div className="p-4 border border-stone-100 dark:border-stone-800 rounded-2xl">
              <TrustBadge type="IDENTITY_VERIFIED" />
              <p className="text-xs text-stone-500 mt-2">Admin reviewed official Ghana Card or National Identification document.</p>
            </div>

            <div className="p-4 border border-stone-100 dark:border-stone-800 rounded-2xl">
              <TrustBadge type="TOP_RATED" />
              <p className="text-xs text-stone-500 mt-2">Maintains a 4.5+ star rating average across at least 10 completed jobs.</p>
            </div>

            <div className="p-4 border border-stone-100 dark:border-stone-800 rounded-2xl">
              <TrustBadge type="FAST_RESPONDER" />
              <p className="text-xs text-stone-500 mt-2">Consistently responds to customer quote requests in under 15 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
