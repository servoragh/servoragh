"use client";

import React, { useState, useEffect } from "react";
import { Heart, Bookmark, Sparkles, X, UserCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface FavoriteButtonProps {
  businessId: string;
  businessSlug?: string;
  businessName?: string;
  variant?: "icon" | "button" | "pill" | "bookmark";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function FavoriteButton({
  businessId,
  businessSlug,
  businessName = "this business",
  variant = "button",
  size = "md",
  className = "",
  showText = true,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();

    const handleUpdate = () => checkFavoriteStatus();
    window.addEventListener("servora_favorites_updated", handleUpdate);
    return () => window.removeEventListener("servora_favorites_updated", handleUpdate);
  }, [businessId]);

  async function checkFavoriteStatus() {
    try {
      // Check authenticated API status
      const res = await fetch(`/api/favorites?businessId=${businessId}`);
      const json = await res.json();

      if (json.isAuthenticated) {
        setIsGuest(false);
        setIsFavorited(json.isFavorited);
      } else {
        setIsGuest(true);
        // Check localStorage for guests
        const localFavs = getLocalFavorites();
        setIsFavorited(localFavs.includes(businessId));
      }
    } catch {
      // Fallback to local storage if API fails
      setIsGuest(true);
      const localFavs = getLocalFavorites();
      setIsFavorited(localFavs.includes(businessId));
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

  function saveLocalFavorite(id: string, isFav: boolean) {
    if (typeof window === "undefined") return;
    try {
      let favs = getLocalFavorites();
      if (isFav) {
        if (!favs.includes(id)) favs.push(id);
      } else {
        favs = favs.filter((item) => item !== id);
      }
      localStorage.setItem("servora_guest_favorites", JSON.stringify(favs));
      window.dispatchEvent(new Event("servora_favorites_updated"));
    } catch {}
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const nextState = !isFavorited;

    if (isGuest) {
      // Guest mode
      saveLocalFavorite(businessId, nextState);
      setIsFavorited(nextState);
      setLoading(false);

      if (nextState) {
        setShowSyncPrompt(true);
      }
      return;
    }

    // Authenticated API mode
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });

      const json = await res.json();

      if (res.status === 401 || json.requiresAuth) {
        // Fallback to guest mode
        setIsGuest(true);
        saveLocalFavorite(businessId, nextState);
        setIsFavorited(nextState);
        setShowSyncPrompt(true);
      } else if (res.ok) {
        setIsFavorited(json.isFavorited);
        window.dispatchEvent(new Event("servora_favorites_updated"));
      } else {
        alert(json.error || "Could not update favorite status.");
      }
    } catch {
      // Offline fallback
      saveLocalFavorite(businessId, nextState);
      setIsFavorited(nextState);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-[11px] gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={handleToggleFavorite}
          disabled={loading}
          title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
          className={`p-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 scale-105"
              : "bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-rose-500 hover:bg-stone-200 dark:hover:bg-stone-700"
          } ${className}`}
        >
          <Heart
            className={`${iconSizes[size]} transition-transform ${
              isFavorited ? "fill-rose-500 text-rose-500 scale-110" : ""
            }`}
          />
        </button>
      ) : variant === "pill" ? (
        <button
          onClick={handleToggleFavorite}
          disabled={loading}
          className={`inline-flex items-center rounded-full font-extrabold border transition-all duration-200 ${
            sizeClasses[size]
          } ${
            isFavorited
              ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-rose-300 hover:text-rose-600"
          } ${className}`}
        >
          <Heart
            className={`${iconSizes[size]} ${isFavorited ? "fill-white text-white" : ""}`}
          />
          {showText && <span>{isFavorited ? "Saved" : "Favorite"}</span>}
        </button>
      ) : (
        <button
          onClick={handleToggleFavorite}
          disabled={loading}
          className={`inline-flex items-center justify-center font-bold rounded-xl border transition-all duration-200 ${
            sizeClasses[size]
          } ${
            isFavorited
              ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-xs"
              : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-rose-300"
          } ${className}`}
        >
          <Heart
            className={`${iconSizes[size]} ${
              isFavorited ? "fill-rose-500 text-rose-500" : "text-stone-400"
            }`}
          />
          {showText && (
            <span>{isFavorited ? "❤️ Saved" : "❤️ Favorite"}</span>
          )}
        </button>
      )}

      {/* Guest Login Sync Prompt Modal */}
      {showSyncPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-stone-900 dark:text-white space-y-4 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowSyncPrompt(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xl border border-rose-200 dark:border-rose-800">
              ❤️
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900 dark:text-white mb-1">
                Saved to Device
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                You bookmarked <strong className="text-stone-800 dark:text-stone-200">{businessName}</strong>! Create a free account or log in to sync your saved businesses across all your devices and receive WhatsApp alerts for new products.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/login?redirect=/biz/${businessSlug || ""}`}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl text-center shadow-md transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" /> Log In & Sync Favorites
              </Link>
              <Link
                href="/register"
                className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl text-center transition"
              >
                Create Account
              </Link>
              <button
                onClick={() => setShowSyncPrompt(false)}
                className="text-[11px] font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 pt-1"
              >
                Keep in Local Memory Only
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
