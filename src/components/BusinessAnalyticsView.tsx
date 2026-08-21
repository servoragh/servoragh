"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Eye,
  MessageSquare,
  DollarSign,
  CheckCircle2,
  PieChart,
  BarChart3,
  RefreshCw,
  ShoppingBag,
  Wrench,
  Layers,
  Share2,
  QrCode,
  Heart,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

export function BusinessAnalyticsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/business/analytics");
      const json = await res.json();
      if (json.metrics) setData(json.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
        Calculating storefront analytics & revenue breakdowns...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Profile Storefront Views</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-stone-900 dark:text-white mt-3">{data.profileViews || 0}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Total public profile impressions</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">WhatsApp Leads Generated</span>
            <div className="p-2.5 bg-green-50 dark:bg-green-950 text-green-600 rounded-2xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-stone-900 dark:text-white mt-3">{data.whatsappClicks || 0}</h3>
          <p className="text-[11px] text-green-600 font-semibold mt-1">Direct click-through inquiries</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Quote Conversion Rate</span>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-stone-900 dark:text-white mt-3">{data.quoteConversionRate || "0.0"}%</h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">{data.acceptedLeadsCount || 0} accepted of {data.totalLeads || 0} leads</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase">Total Estimated Revenue</span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">
            {formatGHS(data.revenue?.totalEstimatedRevenue || 0)}
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Combined enterprise earnings</p>
        </div>
      </div>

      {/* Referral & Share Analytics Row */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
          <h4 className="text-lg font-bold text-stone-900 dark:text-white">Referral & Viral Growth Analytics</h4>
          <p className="text-xs text-stone-500">Track link shares, QR code signboard scans, and customer favoriting metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase">Total Link Shares</span>
              <Share2 className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-2">{data.sharesCount || 0}</h3>
            <p className="text-[11px] text-sky-600 font-semibold mt-0.5">WhatsApp & Social shares</p>
          </div>

          <div className="p-5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase">QR Code Scans</span>
              <QrCode className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-2">{data.qrScansCount || 0}</h3>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Signboard & receipt scans</p>
          </div>

          <div className="p-5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase">Customer Bookmarks</span>
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-2">{data.favoritesCount || 0}</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Subscribed customer alerts</p>
          </div>

          <div className="p-5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Share Conversion</span>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-2">{data.shareConversionRate || "0.0"}%</h3>
            <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Share-to-Inquiry ratio</p>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">Revenue Breakdown Stream</h4>
            <p className="text-xs text-stone-500">Earnings categorized by sales, custom service contracts, and tool rentals.</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs text-stone-600 dark:text-stone-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Product Sales</span>
              <h4 className="text-xl font-black text-stone-900 dark:text-white mt-1">
                {formatGHS(data.revenue?.productSalesRevenue || 0)}
              </h4>
            </div>
          </div>

          <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Service Contracts</span>
              <h4 className="text-xl font-black text-stone-900 dark:text-white mt-1">
                {formatGHS(data.revenue?.serviceRevenue || 0)}
              </h4>
            </div>
          </div>

          <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-2xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Equipment Rentals</span>
              <h4 className="text-xl font-black text-stone-900 dark:text-white mt-1">
                {formatGHS(data.revenue?.rentalIncome || 0)}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
