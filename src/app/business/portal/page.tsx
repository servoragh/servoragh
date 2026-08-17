"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  Wrench,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  QrCode,
  Share2,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  PhoneCall,
  ExternalLink,
  MessageSquare,
  Upload,
  Edit,
  Trash2,
  Tag,
  Search,
  Check,
  X,
  AlertTriangle,
  ArrowUpDown,
  ShoppingBag,
  Camera,
  Save,
  FileCheck,
  Globe,
} from "lucide-react";
import { TrustBadge } from "@/components/TrustBadge";
import { PostProductModal } from "@/components/PostProductModal";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { formatGHS, formatDate, calculateTrustScore, parseJsonArray } from "@/lib/utils";

export default function BusinessOwnerPortalPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "leads" | "messages" | "profile">("products");
  
  // Post & Edit Product Modal State
  const [isPostProductOpen, setIsPostProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Quick Price / Discount Update Modal State
  const [quickDiscountProduct, setQuickDiscountProduct] = useState<any>(null);
  const [quickSalePrice, setQuickSalePrice] = useState("");
  const [quickOriginalPrice, setQuickOriginalPrice] = useState("");
  const [quickStockQuantity, setQuickStockQuantity] = useState("");
  const [quickUpdating, setQuickUpdating] = useState(false);

  // Inventory Search & Filter State
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "active" | "discounted" | "outofstock">("all");

  // Profile Settings Form State
  const [profBusinessName, setProfBusinessName] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profServiceArea, setProfServiceArea] = useState("");
  const [profWebsiteUrl, setProfWebsiteUrl] = useState("");
  const [profPricingHourly, setProfPricingHourly] = useState("");
  const [profAvatarUrl, setProfAvatarUrl] = useState("");
  const [profIdDocumentUrl, setProfIdDocumentUrl] = useState("");
  const [profSaving, setProfSaving] = useState(false);
  const [profSavedMessage, setProfSavedMessage] = useState(false);

  // Quote State
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    fetchPortalData();
  }, []);

  useEffect(() => {
    if (data?.profile) {
      setProfBusinessName(data.profile.businessName || "");
      setProfBio(data.profile.bio || "");
      setProfServiceArea(data.profile.serviceArea || "");
      setProfWebsiteUrl(data.profile.websiteUrl || "");
      setProfPricingHourly(data.profile.pricingHourly ? String(data.profile.pricingHourly) : "");
      setProfAvatarUrl(data.profile.user?.avatarUrl || "");
      setProfIdDocumentUrl(data.profile.idDocumentUrl || "");
    }
  }, [data]);

  async function fetchPortalData() {
    try {
      setLoading(true);
      const res = await fetch("/api/business/portal");
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to load portal.");
      setData(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 1-Click Availability Toggle
  async function handleToggleAvailability(product: any) {
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      fetchPortalData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Quick Stock Adjustment (+1 / -1)
  async function handleAdjustStock(product: any, delta: number) {
    const newStock = Math.max(0, (product.stockQuantity || 1) + delta);
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock, isAvailable: newStock > 0 }),
      });
      if (!res.ok) throw new Error("Failed to update stock.");
      fetchPortalData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Delete Product
  async function handleDeleteProduct(product: any) {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/products/${product.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product.");
      fetchPortalData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Quick Discount / Price Save
  async function handleSaveQuickDiscount(e: React.FormEvent) {
    e.preventDefault();
    if (!quickDiscountProduct) return;
    setQuickUpdating(true);

    try {
      const res = await fetch(`/api/products/${quickDiscountProduct.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(quickSalePrice),
          originalPrice: quickOriginalPrice ? Number(quickOriginalPrice) : null,
          stockQuantity: Number(quickStockQuantity) || 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to update discount pricing.");
      setQuickDiscountProduct(null);
      fetchPortalData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuickUpdating(false);
    }
  }

  // Save Business Profile Changes
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfSaving(true);
    setProfSavedMessage(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: profBusinessName,
          bio: profBio,
          serviceArea: profServiceArea,
          websiteUrl: profWebsiteUrl,
          pricingHourly: profPricingHourly ? Number(profPricingHourly) : null,
          avatarUrl: profAvatarUrl,
          idDocumentUrl: profIdDocumentUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile.");
      setProfSavedMessage(true);
      fetchPortalData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProfSaving(false);
    }
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRequestId || !quotePrice || !quoteMessage) return;

    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequestId,
          price: quotePrice,
          completionTime: "Same day",
          message: quoteMessage,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit quote.");
      }

      setSelectedRequestId(null);
      setQuotePrice("");
      setQuoteMessage("");
      fetchPortalData();
      alert("Quote submitted successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuoteLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto py-20 text-center text-stone-500">Loading your Business Portal...</div>;
  }

  if (error || !data || !data.profile) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Business Profile Required</h2>
        <p className="text-stone-500 text-sm mb-6">{error || "Register your business to access the Portal."}</p>
        <Link href="/provider/register" className="px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
          Register Business Profile Now
        </Link>
      </div>
    );
  }

  const { profile, incomingRequests, submittedQuotes } = data;
  const productsList: any[] = profile.products || [];

  // Filtered products list
  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      !inventorySearch ||
      prod.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      prod.category.toLowerCase().includes(inventorySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (inventoryFilter === "active") return prod.isAvailable;
    if (inventoryFilter === "discounted") return prod.originalPrice && prod.originalPrice > prod.price;
    if (inventoryFilter === "outofstock") return !prod.isAvailable || (prod.stockQuantity !== undefined && prod.stockQuantity <= 0);

    return true;
  });

  // Calculate Seller Inventory Metrics
  const totalProductsCount = productsList.length;
  const activeProductsCount = productsList.filter((p) => p.isAvailable).length;
  const discountedProductsCount = productsList.filter((p) => p.originalPrice && p.originalPrice > p.price).length;
  const outOfStockCount = productsList.filter((p) => !p.isAvailable || (p.stockQuantity !== undefined && p.stockQuantity <= 0)).length;
  const totalInventoryValue = productsList.reduce((sum, p) => sum + (p.price || 0) * (p.stockQuantity || 1), 0);

  const trustScore = calculateTrustScore({
    verificationStatus: profile.verificationStatus,
    ratingAverage: profile.ratingAverage,
    reviewCount: profile.reviewCount,
    completedJobsCount: profile.completedJobsCount,
    responseRate: profile.responseRate,
    yearsExperience: profile.yearsExperience,
  });

  const whatsappShareText = `Visit my verified business profile on Servora Tamale: "${profile.businessName}" (${profile.serviceArea}). Check services, products & reviews: https://servora.vercel.app/provider/${profile.slug}`;

  const currentLogo = profAvatarUrl || profile.logoUrl || profile.user?.avatarUrl;

  return (
    <div className="min-h-screen py-10 bg-stone-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Business Card */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 overflow-hidden border border-emerald-500/40">
              {currentLogo ? (
                <img src={currentLogo} alt={profile.businessName} className="w-full h-full object-cover" />
              ) : (
                profile.businessName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{profile.businessName}</h1>
                {profile.verificationStatus === "VERIFIED" && <TrustBadge type="IDENTITY_VERIFIED" size="sm" />}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {profile.serviceArea} &bull; {profile.yearsExperience} Years Exp &bull; {profile.completedJobsCount} Jobs Completed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {profile.websiteUrl && (
              <a
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Visit External Website</span>
              </a>
            )}
            <Link
              href={`/provider/${profile.slug}`}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl border border-stone-700 transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Public Storefront</span>
            </Link>
            <WhatsAppShareButton
              variant="share"
              text={whatsappShareText}
              label="Share Storefront Link"
              className="py-2 px-4 text-xs"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-2 overflow-x-auto">
          {[
            { id: "products", label: `Inventory & Price Manager (${totalProductsCount})`, icon: Package },
            { id: "messages", label: "Messages & Support Hub 💬", icon: MessageSquare },
            { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
            { id: "leads", label: `Incoming Leads (${incomingRequests.length})`, icon: MessageSquare },
            { id: "profile", label: "Business Profile & Logo Settings ⚙️", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AMAZON/SHOPIFY SELLER INVENTORY & PRICE MANAGEMENT SUITE */}
        {/* ========================================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Amazon/Shopify Seller Performance Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">TOTAL CATALOG ITEMS</span>
                <span className="text-3xl font-black text-white block my-1">{totalProductsCount}</span>
                <span className="text-xs text-emerald-400 font-semibold">{activeProductsCount} Active Listings</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">INVENTORY VALUE</span>
                <span className="text-3xl font-black text-emerald-400 block my-1">{formatGHS(totalInventoryValue)}</span>
                <span className="text-xs text-stone-400">Total Stock Value</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">PROMOTIONAL DISCOUNTS</span>
                <span className="text-3xl font-black text-amber-400 block my-1">{discountedProductsCount}</span>
                <span className="text-xs text-amber-300 font-semibold">Active Sale Prices</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">STOCK ALERTS</span>
                <span className="text-3xl font-black text-rose-400 block my-1">{outOfStockCount}</span>
                <span className="text-xs text-rose-300 font-semibold">Out of Stock / Draft</span>
              </div>
            </div>

            {/* Seller Control Toolbar: Search & Filter */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Box */}
              <div className="flex items-center gap-2 bg-stone-800/80 px-3.5 py-2 rounded-2xl border border-stone-700/60 w-full md:w-80">
                <Search className="w-4 h-4 text-emerald-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products by title or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-stone-400 outline-none w-full font-medium"
                />
                {inventorySearch && (
                  <button onClick={() => setInventorySearch("")} className="text-stone-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Inventory Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                {[
                  { id: "all", label: `All (${totalProductsCount})` },
                  { id: "active", label: `Active (${activeProductsCount})` },
                  { id: "discounted", label: `On Sale 🏷️ (${discountedProductsCount})` },
                  { id: "outofstock", label: `Out of Stock (${outOfStockCount})` },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setInventoryFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      inventoryFilter === flt.id
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white"
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              {/* Add Product Button */}
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsPostProductOpen(true);
                }}
                className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Enterprise Amazon/Shopify Inventory Table */}
            {filteredProducts.length === 0 ? (
              <div className="bg-stone-900 p-12 rounded-3xl border border-stone-800 text-center space-y-3">
                <Package className="w-12 h-12 text-stone-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Inventory Items Found</h3>
                <p className="text-xs text-stone-400">
                  {inventorySearch || inventoryFilter !== "all"
                    ? "No products match your current search or filter criteria."
                    : "You haven't posted any products for sale yet."}
                </p>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsPostProductOpen(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Your First Product</span>
                </button>
              </div>
            ) : (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-850 text-[10px] font-black uppercase tracking-wider text-stone-400 border-b border-stone-800">
                      <tr>
                        <th className="p-4">Product / Item</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Sale & Compare Price</th>
                        <th className="p-4">Stock Units</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Manage Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {filteredProducts.map((prod: any) => {
                        let parsedImgs: string[] = [];
                        try {
                          parsedImgs = JSON.parse(prod.images || "[]");
                        } catch {}
                        const thumb = parsedImgs[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&q=80";

                        const hasDiscount = prod.originalPrice && Number(prod.originalPrice) > Number(prod.price);
                        const discountAmt = hasDiscount ? Number(prod.originalPrice) - Number(prod.price) : 0;
                        const discountPct = hasDiscount ? Math.round((discountAmt / Number(prod.originalPrice)) * 100) : 0;
                        const stock = prod.stockQuantity !== undefined ? prod.stockQuantity : 1;

                        return (
                          <tr key={prod.id} className="hover:bg-stone-850/60 transition">
                            {/* Product Info */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={thumb}
                                  alt={prod.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-stone-700 bg-stone-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <Link
                                    href={`/products/${prod.slug}`}
                                    className="font-bold text-white hover:text-emerald-400 transition truncate block text-sm"
                                  >
                                    {prod.title}
                                  </Link>
                                  <span className="text-[10px] text-stone-500 font-mono block truncate">
                                    SKU: {prod.slug}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-stone-800 text-stone-300 rounded-lg text-[10px] font-bold border border-stone-700">
                                {prod.category}
                              </span>
                            </td>

                            {/* Sale & Compare Price */}
                            <td className="p-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm text-emerald-400">
                                    {formatGHS(prod.price)}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-stone-400 line-through font-semibold">
                                      {formatGHS(prod.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                {hasDiscount && (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-0.5">
                                    <Tag className="w-3 h-3" /> SAVE GH₵ {discountAmt.toFixed(2)} ({discountPct}% OFF)
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Stock Quantity */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                    stock > 5
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                      : stock > 0
                                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                                      : "bg-rose-950 text-rose-300 border border-rose-800"
                                  }`}
                                >
                                  {stock > 0 ? `${stock} in stock` : "OUT OF STOCK"}
                                </span>

                                {/* Quick Stock Adjust Buttons */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleAdjustStock(prod, -1)}
                                    className="w-5 h-5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-bold flex items-center justify-center text-xs"
                                    title="Decrease stock"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleAdjustStock(prod, 1)}
                                    className="w-5 h-5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-bold flex items-center justify-center text-xs"
                                    title="Increase stock"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Status Switch */}
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleAvailability(prod)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition ${
                                  prod.isAvailable
                                    ? "bg-emerald-600 text-white"
                                    : "bg-stone-800 text-stone-500 border border-stone-700"
                                }`}
                              >
                                {prod.isAvailable ? "ACTIVE" : "INACTIVE"}
                              </button>
                            </td>

                            {/* Actions Column */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick Price / Discount Update */}
                                <button
                                  onClick={() => {
                                    setQuickDiscountProduct(prod);
                                    setQuickSalePrice(String(prod.price));
                                    setQuickOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : "");
                                    setQuickStockQuantity(String(stock));
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold rounded-xl border border-amber-600/40 text-[11px] flex items-center gap-1 transition"
                                  title="Quick update price & discount"
                                >
                                  <Tag className="w-3.5 h-3.5" /> Discount
                                </button>

                                {/* Edit Product */}
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setIsPostProductOpen(true);
                                  }}
                                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl border border-stone-700 transition"
                                  title="Edit full product details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Product */}
                                <button
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="p-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl border border-rose-800/80 transition"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Trust Score</span>
                <span className="text-3xl font-black text-emerald-400 block my-1">{trustScore}%</span>
                <span className="text-xs text-stone-400">{profile.verificationStatus} Profile</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Completed Jobs</span>
                <span className="text-3xl font-black text-white block my-1">{profile.completedJobsCount}</span>
                <span className="text-xs text-stone-400">{profile.reviewCount} Ratings ({profile.ratingAverage} avg)</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Products Listed</span>
                <span className="text-3xl font-black text-amber-400 block my-1">{totalProductsCount}</span>
                <span className="text-xs text-stone-400">Available in Tamale</span>
              </div>
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Response Rate</span>
                <span className="text-3xl font-black text-purple-400 block my-1">{profile.responseRate}%</span>
                <span className="text-xs text-stone-400">Avg &lt; 15 mins</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white">Post New Inventory Product</h3>
                <p className="text-xs text-stone-400">List items for sale to customers in Tamale.</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsPostProductOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LEADS & QUOTES */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Incoming Customer Job Requests in Tamale</h2>
            {incomingRequests.length === 0 ? (
              <div className="bg-stone-900 p-8 rounded-3xl border border-stone-800 text-center text-xs text-stone-500">
                No open job requests in your service categories right now. Check back soon!
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((req: any) => (
                  <div key={req.id} className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-800">
                          {req.service?.name}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{req.title}</h3>
                        <p className="text-xs text-stone-400">{req.location?.area}, Tamale &bull; Urgency: {req.urgency}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        {req.budgetMax ? `Budget: GH₵ ${req.budgetMax}` : "Open Budget"}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 bg-stone-800/60 p-3 rounded-xl">{req.description}</p>

                    {/* Submit Quote Section */}
                    {selectedRequestId === req.id ? (
                      <form onSubmit={handleQuoteSubmit} className="bg-stone-800 p-4 rounded-2xl space-y-3 border border-stone-700">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Your Price in GH₵"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            className="p-2.5 bg-stone-900 text-white rounded-xl text-xs outline-none border border-stone-700"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Message / Turnaround"
                            value={quoteMessage}
                            onChange={(e) => setQuoteMessage(e.target.value)}
                            className="p-2.5 bg-stone-900 text-white rounded-xl text-xs outline-none border border-stone-700"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={quoteLoading} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                            {quoteLoading ? "Sending..." : "Submit Quote"}
                          </button>
                          <button type="button" onClick={() => setSelectedRequestId(null)} className="px-4 py-2 text-xs text-stone-400">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setSelectedRequestId(req.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
                      >
                        Submit Price Quote
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: MESSAGES & SUPPORT HUB */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Multi-Role Business Inbox & Messaging Suite</h2>
                <p className="text-xs text-stone-400">
                  Manage C2B buyer inquiries, B2B wholesale threads, order courier chat, and platform helpdesk support.
                </p>
              </div>
            </div>
            <UnifiedMessagingHub
              currentUserId={profile.userId}
              currentUserRole="PROVIDER"
            />
          </div>
        )}

        {/* TAB 4: PROFILE & LOGO MANAGEMENT SETTINGS */}
        {activeTab === "profile" && (
          <div className="bg-stone-900 border border-stone-800 p-6 lg:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Business Profile & Logo Settings</h2>
                <p className="text-xs text-stone-400">
                  Upload your business logo, edit display name, bio, website link, service coverage in Tamale, and verification documents.
                </p>
              </div>
              {profSavedMessage && (
                <div className="px-4 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Profile Changes Saved!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              {/* Business Logo Upload Section */}
              <div className="bg-stone-850 p-6 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-emerald-950 border-2 border-emerald-500/40 text-emerald-400 font-black text-4xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {currentLogo ? (
                    <img src={currentLogo} alt={profBusinessName} className="w-full h-full object-cover" />
                  ) : (
                    profBusinessName.charAt(0) || "B"
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="font-bold text-sm text-white">Business Logo / Profile Avatar</h4>
                  <p className="text-stone-400 text-xs">
                    Upload your high-res logo or photo. Automatically compressed & served via CDN.
                  </p>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      placeholder="https://... or choose photo"
                      value={profAvatarUrl}
                      onChange={(e) => setProfAvatarUrl(e.target.value)}
                      className="p-2.5 bg-stone-900 border border-stone-700 text-white rounded-xl outline-none flex-1 max-w-sm"
                    />
                    <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const d = await res.json();
                            if (d.url) setProfAvatarUrl(d.url);
                          } catch {
                            alert("Logo upload failed.");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={profBusinessName}
                    onChange={(e) => setProfBusinessName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white font-bold outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Existing Business Website URL</label>
                  <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-3 py-1">
                    <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="https://mybusiness.com"
                      value={profWebsiteUrl}
                      onChange={(e) => setProfWebsiteUrl(e.target.value)}
                      className="w-full py-2 bg-transparent text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Service Coverage Area (Tamale)</label>
                  <input
                    type="text"
                    value={profServiceArea}
                    onChange={(e) => setProfServiceArea(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white font-bold outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Hourly Rate (GH₵)</label>
                  <input
                    type="number"
                    value={profPricingHourly}
                    onChange={(e) => setProfPricingHourly(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-emerald-400 font-bold outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-stone-300 mb-1">Ghana Card / Verification Document</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Document URL or upload"
                      value={profIdDocumentUrl}
                      onChange={(e) => setProfIdDocumentUrl(e.target.value)}
                      className="flex-1 p-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-300 outline-none"
                    />
                    <label className="px-3 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl cursor-pointer border border-stone-700 flex items-center gap-1 shrink-0">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>ID File</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const d = await res.json();
                            if (d.url) setProfIdDocumentUrl(d.url);
                          } catch {
                            alert("Document upload failed.");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">About / Business Bio</label>
                <textarea
                  rows={4}
                  value={profBio}
                  onChange={(e) => setProfBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-800">
                <button
                  type="submit"
                  disabled={profSaving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{profSaving ? "Saving Changes..." : "Save Business Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Post & Edit Product Modal */}
      <PostProductModal
        isOpen={isPostProductOpen}
        onClose={() => {
          setIsPostProductOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchPortalData}
        editProduct={editingProduct}
      />

      {/* Quick Price & Discount Update Modal */}
      {quickDiscountProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-white">Quick Price & Discount Manager</h3>
              </div>
              <button onClick={() => setQuickDiscountProduct(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Updating pricing & discount for <strong className="text-white">{quickDiscountProduct.title}</strong>
            </p>

            <form onSubmit={handleSaveQuickDiscount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Sale Price (GH₵)</label>
                <input
                  type="number"
                  value={quickSalePrice}
                  onChange={(e) => setQuickSalePrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-emerald-400 font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Regular Compare Price (GH₵)</label>
                <input
                  type="number"
                  placeholder="Optional regular price for discount tag"
                  value={quickOriginalPrice}
                  onChange={(e) => setQuickOriginalPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-400 font-semibold line-through outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={quickStockQuantity}
                  onChange={(e) => setQuickStockQuantity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-700 bg-stone-800 text-white font-bold outline-none"
                  required
                />
              </div>

              {quickOriginalPrice && quickSalePrice && Number(quickOriginalPrice) > Number(quickSalePrice) && (
                <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold text-center">
                  SAVE GH₵ {(Number(quickOriginalPrice) - Number(quickSalePrice)).toFixed(2)} (
                  {Math.round(((Number(quickOriginalPrice) - Number(quickSalePrice)) / Number(quickOriginalPrice)) * 100)}% OFF)
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setQuickDiscountProduct(null)}
                  className="px-4 py-2 text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickUpdating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition"
                >
                  {quickUpdating ? "Updating..." : "Save Discount Pricing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
