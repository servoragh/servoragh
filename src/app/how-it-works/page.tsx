import React from "react";
import Link from "next/link";
import { Wrench, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-16 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-900 dark:text-white mb-4 text-center">
          How Servora Works in Tamale
        </h1>
        <p className="text-center text-stone-600 dark:text-stone-400 text-sm mb-12 max-w-xl mx-auto">
          A simple, zero-cost bridge between Tamale residents and verified local service artisans.
        </p>

        <div className="space-y-8">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold text-emerald-600 mb-2">1. For Customers</h2>
            <ul className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Submit a 7-step service request stating your problem, location, urgency, and optional budget in Ghanaian Cedi (GH₵).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Receive transparent price quotes directly from verified local artisans, repairers, and service professionals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Contact the chosen artisan directly via call or WhatsApp. Pay upon job completion and leave a community review.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold text-amber-500 mb-2">2. For Service Artisans</h2>
            <ul className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Create a free business card profile showcasing your portfolio, service area, and experience.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Receive instant job alerts for requests posted in Sakasaka, Nyohini, Choggu, and Aboabo.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Submit price quotes and build your verified trust score with real customer ratings.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
