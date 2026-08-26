"use client";

import React, { useState } from "react";
import { Star, CheckCircle2, EyeOff, Trash2, Building2, User, ThumbsUp, ShieldCheck } from "lucide-react";

interface ReviewItem {
  id: string;
  businessName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "APPROVED" | "HIDDEN" | "PENDING";
}

const INITIAL_REVIEWS: ReviewItem[] = [
  { id: "rev-1", businessName: "Kwame Electrical & Solar", reviewerName: "Alhassan Fuseini", rating: 5, comment: "Kwame installed our 3-phase solar inverter in Sakasaka. Excellent work, fast and reliable!", createdAt: "2026-08-25", status: "APPROVED" },
  { id: "rev-2", businessName: "Northern Authentic Fugu & Fabrics", reviewerName: "Fatima Yakubu", rating: 5, comment: "Authentic Dagbon smocks woven with top quality thread. Fast delivery to Accra!", createdAt: "2026-08-24", status: "APPROVED" },
  { id: "rev-3", businessName: "Salifu Plumbing & Borehole", reviewerName: "Unverified User", rating: 1, comment: "Spam comment test 123", createdAt: "2026-08-23", status: "HIDDEN" },
];

import { toast } from "@/lib/toast";

export function AdminReviewsHub() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  function toggleReviewStatus(id: string) {
    const rev = reviews.find((r) => r.id === id);
    const newStatus = rev?.status === "APPROVED" ? "HIDDEN" : "APPROVED";
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
    toast.info("Review Moderated ⭐", `Review by ${rev?.reviewerName || id} is now ${newStatus}.`);
  }

  function deleteReview(id: string) {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.error("Review Deleted 🗑️", `Review removed from system.`);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" /> Customer Ratings & Reviews Moderation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Moderate customer reviews submitted across local business storefronts and artisan profiles.
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="p-4">Business & Reviewer</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment Snippet</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition">
                <td className="p-4">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">{r.businessName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">By: {r.reviewerName} &bull; {r.createdAt}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <span>{r.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </td>
                <td className="p-4 max-w-xs text-slate-600 dark:text-stone-300">
                  <p className="line-clamp-2 leading-relaxed">{r.comment}</p>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      r.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => toggleReviewStatus(r.id)}
                    className={`px-3 py-1 font-bold rounded-xl text-xs transition cursor-pointer ${
                      r.status === "APPROVED"
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-white"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {r.status === "APPROVED" ? "Hide Review 🙈" : "Approve ✓"}
                  </button>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Delete 🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
