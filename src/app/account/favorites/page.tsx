"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Store,
  MapPin,
  Star,
  ShieldCheck,
  MessageSquare,
  Wrench,
  Package,
  Bell,
  BellOff,
  Filter,
  ArrowLeft,
  Share2,
  ExternalLink,
  UserCheck,
  Building2,
  Sparkles,
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { formatGHS } from "@/lib/utils";

export default function CustomerSavedFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "OPEN_NOW" | "RECENT_ITEMS" | "SAKASAKA" | "CHOGGU">("ALL");

  // State for Service Request Wizard Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetBusiness, setTargetBusiness] = useState<any>(null);

  useEffect(() => {
    fetchFavorites();

    const handleUpdate = () => fetchFavorites();
    window.addEventListener("servora_favorites_updated", handleUpdate);
    return () => window.removeEventListener("servora_favorites_updated", handleUpdate);
  }, []);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      const json = await res.json();

      if (json.isAuthenticated) {
        setIsAuthenticated(true);
        setFavorites(json.favorites || []);
      } else {
        setIsAuthenticated(false);
        // Load local guest favorites IDs
        const localIds: string[] = getLocalFavorites();
        if (localIds.length > 0) {
          // Fetch public info for local saved IDs
          fetchGuestFavoritesDetails(localIds);
        } else {
          setFavorites([]);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved favorites:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  function getLocalFavorites(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("servora_guest_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async function fetchGuestFavoritesDetails(ids: string[]) {
    try {
      // Fetch details for guest favorited businesses
      const items = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/biz/${id}`);
            const json = await res.json();
            if (res.ok && json.profile) {
              return {
                id: `guest-fav-${id}`,
                businessId: json.profile.id,
                notifyOnNewListing: true,
                business: json.profile,
              };
            }
            return null;
          } catch {
            return null;
          }
        })
      );
      setFavorites(items.filter(Boolean));
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  const toggleNotificationPreference = async (favId: string, currentVal: boolean) => {
    try {
      const item = favorites.find((f) => f.id === favId);
      if (!item) return;

      const nextVal = !currentVal;
      setFavorites((prev) =>
        prev.map((f) => (f.id === favId ? { ...f, notifyOnNewListing: nextVal } : f))
      );

      if (isAuthenticated) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: item.businessId,
            action: "update_settings",
            notifyOnNewListing: nextVal,
          }),
        });
      }
    } catch (err) {
      console.error("Notification preference update error:", err);
    }
  };

  const handleOpenWhatsApp = (business: any) => {
    const text = encodeURIComponent(
      `Hello ${business.businessName}, I saved your profile on Servora Tamale and I would like to inquire about your products/services.`
    );
    window.open(`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  const handleOpenRequestWizard = (business: any) => {
    setTargetBusiness(business);
    setIsRequestModalOpen(true);
  };

  // Filter items based on activeFilter
  const filteredFavorites = favorites.filter((fav) => {
    const biz = fav.business;
    if (!biz) return false;

    if (activeFilter === "SAKASAKA") return biz.zone?.toLowerCase().includes("sakasaka");
    if (activeFilter === "CHOGGU") return biz.zone?.toLowerCase().includes("choggu");
    if (activeFilter === "RECENT_ITEMS") {
      const hasRecentProducts = biz.products && biz.products.length > 0;
      const hasRecentRentals = biz.rentals && biz.rentals.length > 0;
      return hasRecentProducts || hasRecentRentals;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Servora Marketplace
        </Link>

        {/* PAGE TITLE BANNER */}
        <div className="bg-gradient-to-r from-rose-900 via-stone-900 to-emerald-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-rose-300 border border-white/10">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" /> Customer Saved Hub
            </div>
            <h1 className="text-2xl lg:text-4xl font-black">Your Bookmarked Businesses & Hubs</h1>
            <p className="text-xs lg:text-sm text-stone-300 max-w-xl">
              Quick access to your favorited artisans, tool rental hubs, and local stores in Tamale. Receive automated WhatsApp alerts when they post new listings.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 space-y-2 max-w-xs relative z-10">
              <p className="text-xs font-bold text-stone-200">
                You are currently viewing saved items stored in your local browser memory.
              </p>
              <Link
                href="/login?redirect=/account/favorites"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl text-center shadow-md transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Log In to Sync Across Devices
              </Link>
            </div>
          )}
        </div>

        {/* QUICK FILTERS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeFilter === "ALL"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100"
            }`}
          >
            All Saved ({favorites.length})
          </button>
          <button
            onClick={() => setActiveFilter("RECENT_ITEMS")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeFilter === "RECENT_ITEMS"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100"
            }`}
          >
            ✨ Has New Catalog Listings
          </button>
          <button
            onClick={() => setActiveFilter("SAKASAKA")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeFilter === "SAKASAKA"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100"
            }`}
          >
            📍 Sakasaka Neighborhood
          </button>
          <button
            onClick={() => setActiveFilter("CHOGGU")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 ${
              activeFilter === "CHOGGU"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100"
            }`}
          >
            📍 Choggu Neighborhood
          </button>
        </div>

        {/* FAVORITES LISTING GRID */}
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500 font-semibold">
            Loading your bookmarked storefronts...
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-500 mx-auto flex items-center justify-center text-2xl font-black">
              ❤️
            </div>
            <h3 className="text-lg font-black text-stone-900 dark:text-white">
              No Saved Favorites Found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              You haven't favorited any businesses yet. Click the heart icon on any merchant card or storefront to add them to your quick access hub!
            </p>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Explore Tamale Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((fav) => {
              const biz = fav.business;
              if (!biz) return null;

              const productsCount = biz.products?.length || 0;
              const rentalsCount = biz.rentals?.length || 0;

              return (
                <div
                  key={fav.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-700 transition flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header: Logo, Name & Remove Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl flex items-center justify-center overflow-hidden border border-emerald-300 dark:border-emerald-800 shrink-0">
                          {biz.logoUrl ? (
                            <img src={biz.logoUrl} alt={biz.businessName} className="w-full h-full object-cover" />
                          ) : (
                            biz.businessName.charAt(0)
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/biz/${biz.slug}`}
                            className="font-black text-base text-stone-900 dark:text-white hover:text-emerald-600 transition line-clamp-1"
                          >
                            {biz.businessName}
                          </Link>
                          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{biz.zone}</span>
                          </p>
                        </div>
                      </div>

                      <FavoriteButton
                        businessId={biz.id}
                        businessSlug={biz.slug}
                        businessName={biz.businessName}
                        variant="icon"
                        size="sm"
                      />
                    </div>

                    {/* Tagline / Description */}
                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed font-medium">
                      {biz.tagline || biz.description}
                    </p>

                    {/* Stats & Verification Badges */}
                    <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-100 dark:border-stone-700 text-xs">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {biz.verificationStatus || "VERIFIED"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{biz.ratingAverage > 0 ? biz.ratingAverage : "5.0"}</span>
                      </div>

                      <div className="text-[11px] text-stone-500 font-semibold">
                        {productsCount} items • {rentalsCount} tools
                      </div>
                    </div>

                    {/* Alert Digest Toggle */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        New Listing Alerts:
                      </span>
                      <button
                        onClick={() => toggleNotificationPreference(fav.id, fav.notifyOnNewListing)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition ${
                          fav.notifyOnNewListing
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700"
                        }`}
                      >
                        {fav.notifyOnNewListing ? (
                          <>
                            <Bell className="w-3 h-3 text-emerald-600 fill-emerald-600" /> WhatsApp Active
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3 h-3 text-stone-400" /> Alerts Off
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* DIRECT ACTION CTA BUTTONS */}
                  <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/biz/${biz.slug}`}
                        className="py-2.5 text-center text-xs font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <Store className="w-3.5 h-3.5 text-emerald-600" /> Storefront
                      </Link>

                      <button
                        onClick={() => handleOpenWhatsApp(biz)}
                        className="py-2.5 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-xl transition flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenRequestWizard(biz)}
                      className="w-full py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Request Custom Service Quote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Request Wizard Modal */}
      {isRequestModalOpen && (
        <RequestWizardModal
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setTargetBusiness(null);
          }}
        />
      )}
    </div>
  );
}
