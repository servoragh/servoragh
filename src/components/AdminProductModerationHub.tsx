"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Phone,
  MessageSquare,
  Mail,
  UserCheck,
  UserX,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  X,
  ChevronRight,
  DollarSign,
  Tag,
} from "lucide-react";
import { ProductListingItem, ProductListingStatus, SellerType } from "@/lib/productListingTypes";
import { formatGHS, formatDate } from "@/lib/utils";

interface AdminProductModerationHubProps {
  isDark?: boolean;
}

export function AdminProductModerationHub({ isDark = false }: AdminProductModerationHubProps) {
  const [listings, setListings] = useState<ProductListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ProductListingStatus | "ALL">("PENDING_APPROVAL");
  const [sellerTypeFilter, setSellerTypeFilter] = useState<SellerType | "ALL">("ALL");

  // Rejection Reason Modal
  const [rejectModalListing, setRejectModalListing] = useState<ProductListingItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("Does not satisfy platform safety guidelines.");
  const [processing, setProcessing] = useState(false);

  // Counts
  const [counts, setCounts] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    sold: 0,
    suspended: 0,
    guestCount: 0,
  });

  useEffect(() => {
    fetchQueue();
  }, [activeTab, sellerTypeFilter]);

  async function fetchQueue() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeTab !== "ALL") params.set("status", activeTab);
      if (sellerTypeFilter !== "ALL") params.set("sellerType", sellerTypeFilter);

      const res = await fetch(`/api/admin/products/listings?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.listings) {
        setListings(data.listings);
        if (data.counts) setCounts(data.counts);
      } else {
        throw new Error(data.error || "Failed to load product moderation queue.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchQueue();
  }

  async function handleModerateAction(
    id: string,
    action: "APPROVE" | "REJECT" | "FEATURE" | "SUSPEND" | "MARK_SOLD" | "DELETE",
    reason?: string
  ) {
    try {
      setProcessing(true);

      // Optimistic UI update
      setListings((prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              if (action === "APPROVE") return { ...item, status: "ACTIVE" as ProductListingStatus };
              if (action === "REJECT") return { ...item, status: "REJECTED" as ProductListingStatus };
              if (action === "SUSPEND") return { ...item, status: "SUSPENDED" as ProductListingStatus };
              if (action === "MARK_SOLD") return { ...item, status: "SOLD" as ProductListingStatus };
              if (action === "FEATURE") return { ...item, isFeatured: !item.isFeatured };
            }
            return item;
          })
          .filter((item) => (action === "DELETE" ? item.id !== id : true))
      );

      const res = await fetch(`/api/admin/products/listings/${encodeURIComponent(id)}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });

      const data = await res.json();
      if (res.ok) {
        setRejectModalListing(null);
        toast.success("Moderation Action Completed ✓", `Product status updated to ${action.toLowerCase()}.`);
        fetchQueue();
      } else {
        // Rollback on failure
        fetchQueue();
        toast.error("Moderation Action Failed", data.error || "Failed to execute moderation action.");
      }
    } catch (e) {
      fetchQueue();
      toast.error("Network Error", "Failed to connect to product moderation endpoint.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6 font-sans text-stone-900 dark:text-stone-100">
      {/* ------------------------------------------------------------- */}
      {/* MODERATION HUB HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 text-stone-950 flex items-center justify-center font-black shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Product Moderation & Classifieds Hub 🛍️
                </h2>
                <span className="text-xs text-amber-400 font-bold tracking-wide">
                  Guest & Registered Seller Inventory Control
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2 max-w-3xl leading-relaxed">
              Unified moderation workspace for inspecting, approving, rejecting, and seller verification of guest and merchant classified listings.
            </p>
          </div>

          <button
            onClick={fetchQueue}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-stone-700 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Queue</span>
          </button>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Pending Approval Queue
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">
              {counts.pending}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Requires Admin Action</span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Active Marketplace Items
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {counts.active}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Approved & Live</span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Guest Seller Listings
            </span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">
              {counts.guestCount}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">OTP Verified Submissions</span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Rejected Listings
            </span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">
              {counts.rejected}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Flagged / Spam</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODERATION QUEUE TABS & FILTER TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
        {/* Queue Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: "PENDING_APPROVAL", label: "Pending Review 🟡", count: counts.pending },
            { id: "ACTIVE", label: "Approved & Active 🟢", count: counts.active },
            { id: "REJECTED", label: "Rejected 🔴", count: counts.rejected },
            { id: "SOLD", label: "Marked Sold ⚪", count: counts.sold },
            { id: "SUSPENDED", label: "Suspended ⚠️", count: counts.suspended },
            { id: "ALL", label: "All Items 📦", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-black shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter Search */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listing title, description, guest seller name or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </form>

          {/* Seller Type Filter */}
          <select
            value={sellerTypeFilter}
            onChange={(e) => setSellerTypeFilter(e.target.value as any)}
            className="p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs font-bold outline-none"
          >
            <option value="ALL">All Seller Types</option>
            <option value="GUEST">Guest Sellers 👤</option>
            <option value="REGISTERED_USER">Registered Merchants 🏢</option>
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRODUCT MODERATION QUEUE CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            Querying Product Listing Queue...
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center text-stone-500 font-semibold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            No product listings match your moderation filter.
          </div>
        ) : (
          listings.map((item) => {
            const isGuest = item.sellerType === "GUEST";
            const hasFlags = item.autoModerationFlags && item.autoModerationFlags.length > 0;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs transition hover:shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  {/* Media & Details */}
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shrink-0 bg-stone-100">
                      <img
                        src={item.images[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                              : item.status === "PENDING_APPROVAL"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                              : item.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                              : "bg-stone-500/20 text-stone-600 dark:text-stone-400 border border-stone-500/30"
                          }`}
                        >
                          {item.status}
                        </span>

                        {/* Seller Origin Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isGuest
                              ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30"
                              : "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {isGuest ? <User className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          <span>{isGuest ? "Guest Seller 👤" : "Registered Merchant 🏢"}</span>
                        </span>

                        {item.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 fill-stone-950" /> Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/products/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-black text-stone-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline flex items-center gap-1.5 transition"
                          title="View Public Product Page"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />
                        </a>
                      </div>

                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1">
                        <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">
                          {formatGHS(item.price)} {item.isNegotiable && <span className="text-[10px] text-stone-400 font-normal">(Negotiable)</span>}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.area}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500 font-mono text-[11px]">
                          Category: {item.category} ({item.condition})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Details & Contact Outreach Panel */}
                  <div className="w-full sm:w-64 p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs space-y-2 shrink-0 shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block tracking-wider">
                      Seller Contact Info
                    </span>

                    {/* Clickable Profile Title */}
                    <a
                      href={`/biz/${item.sellerSlug || "seller-profile"}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline transition group"
                      title="Open Public Digital Storefront Profile"
                    >
                      <span className="truncate max-w-[170px]">{isGuest ? item.guestName || item.sellerName : item.sellerName}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                    </a>

                    <div className="text-[11px] text-stone-500 font-mono">
                      Phone: {isGuest ? item.guestPhone : item.sellerPhone}
                    </div>

                    {/* Dedicated View Profile Action Link Button */}
                    <div className="pt-1">
                      <a
                        href={`/biz/${item.sellerSlug || "seller-profile"}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-[10px] flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> View Public Storefront Profile ↗
                      </a>
                    </div>

                    {/* Direct Outreach Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-stone-200/60 dark:border-stone-800">
                      <a
                        href={`https://wa.me/${(isGuest ? item.guestWhatsApp || item.guestPhone : item.sellerPhone)?.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                      <a
                        href={`tel:${isGuest ? item.guestPhone : item.sellerPhone}`}
                        className="py-1.5 px-2.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer hover:bg-stone-300"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                </div>

                {/* Auto-Moderation Alert Flags (if any) */}
                {hasFlags && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-2xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold">
                        Auto-Moderation Flags: {item.autoModerationFlags?.join(", ")}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300">
                      Inspect before approving
                    </span>
                  </div>
                )}

                {/* Rejection Reason display if rejected */}
                {item.status === "REJECTED" && item.rejectionReason && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs">
                    <strong>Rejection Reason:</strong> {item.rejectionReason}
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-stone-400 font-mono">
                    Posted {formatDate(item.createdAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Feature / Unfeature Button */}
                    <button
                      onClick={() => handleModerateAction(item.id, "FEATURE")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.isFeatured
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{item.isFeatured ? "Featured" : "Feature Item"}</span>
                    </button>

                    {/* Quick Reject */}
                    {item.status !== "REJECTED" && (
                      <button
                        onClick={() => setRejectModalListing(item)}
                        className="px-3.5 py-1.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 hover:bg-rose-200 border border-rose-300 dark:border-rose-800 font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}

                    {/* Quick Approve */}
                    {item.status !== "ACTIVE" && (
                      <button
                        onClick={() => handleModerateAction(item.id, "APPROVE")}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quick Approve
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete listing "${item.title}" permanently?`)) {
                          handleModerateAction(item.id, "DELETE");
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-500 rounded-xl transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* REJECTION REASON MODAL */}
      {/* ------------------------------------------------------------- */}
      {rejectModalListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm" onClick={() => setRejectModalListing(null)} />

          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-stone-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-black">Reject Product Listing</h3>
              <button onClick={() => setRejectModalListing(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-500">
                Provide a reason for rejecting <strong className="text-stone-900 dark:text-white">"{rejectModalListing.title}"</strong>.
              </p>

              <div>
                <label className="block font-bold mb-1">Canned / Custom Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                />
              </div>

              {/* Quick Canned Buttons */}
              <div className="flex flex-wrap gap-1">
                {[
                  "Counterfeit or unauthorized replica item.",
                  "Abnormal pricing / suspicious activity.",
                  "Inappropriate content or prohibited goods.",
                  "Incomplete seller contact details.",
                ].map((canned) => (
                  <button
                    key={canned}
                    type="button"
                    onClick={() => setRejectionReasonInput(canned)}
                    className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-[10px] font-semibold cursor-pointer"
                  >
                    {canned}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRejectModalListing(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleModerateAction(rejectModalListing.id, "REJECT", rejectionReasonInput)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
