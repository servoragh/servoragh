"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  PhoneCall,
  MessageSquare,
  Package,
  Wrench,
  Layers,
  ArrowLeft,
  Share2,
  ExternalLink,
  Navigation,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  QrCode,
  Image as ImageIcon,
  Store,
  Video,
  Play,
  Tag,
  Truck,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Search,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareDrawerModal } from "@/components/ShareDrawerModal";
import { QrCodeGeneratorModal } from "@/components/QrCodeGeneratorModal";

export default function PublicDigitalStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<any>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"products" | "rentals" | "services" | "posts">("products");
  const [searchQuery, setSearchQuery] = useState("");

  // Catalog Detail Modal States
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [viewingRental, setViewingRental] = useState<any>(null);
  const [viewingService, setViewingService] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewingMediaType, setViewingMediaType] = useState<"image" | "video">("image");

  // Full-Screen Image Lightbox & Zoom (Unified for Products, Rentals, and Services)
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    title: string;
    images: string[];
    activeIndex: number;
    isZoomed: boolean;
  }>({
    isOpen: false,
    title: "",
    images: [],
    activeIndex: 0,
    isZoomed: false,
  });

  const openLightbox = (title: string, images: string[], startIndex = 0) => {
    if (!images || images.length === 0) return;
    setLightbox({
      isOpen: true,
      title,
      images,
      activeIndex: startIndex,
      isZoomed: false,
    });
  };

  // Growth Toolkit Modal States
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Custom Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custWhatsApp, setCustWhatsApp] = useState("");
  const [custNotes, setCustNotes] = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  useEffect(() => {
    if (slug) fetchStorefront();
  }, [slug]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox.isOpen) {
          setLightbox((prev) => ({ ...prev, isOpen: false }));
        } else {
          setViewingProduct(null);
          setViewingRental(null);
          setViewingService(null);
          setIsQuoteModalOpen(false);
          setIsShareDrawerOpen(false);
          setIsQrModalOpen(false);
        }
      }
      if (lightbox.isOpen && lightbox.images.length > 1) {
        if (e.key === "ArrowLeft") {
          setLightbox((prev) => ({
            ...prev,
            activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.images.length - 1,
            isZoomed: false,
          }));
        }
        if (e.key === "ArrowRight") {
          setLightbox((prev) => ({
            ...prev,
            activeIndex: prev.activeIndex < prev.images.length - 1 ? prev.activeIndex + 1 : 0,
            isZoomed: false,
          }));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  async function fetchStorefront() {
    try {
      setLoading(true);
      const res = await fetch(`/api/biz/${slug}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Storefront profile not found.");
      setProfile(json.profile);
      setCommunityPosts(json.communityPosts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleWhatsAppClick = async (productTitle?: string) => {
    if (!profile) return;
    try {
      fetch(`/api/biz/${slug}?action=whatsapp_click`);
    } catch {}
    const text = encodeURIComponent(
      productTitle
        ? `Hello ${profile.businessName}, I am interested in buying/inquiring about "${productTitle}" listed on your Servora storefront (servora.gh/biz/@${profile.slug}).`
        : `Hello ${profile.businessName}, I am contacting you via your Servora digital storefront (servora.gh/biz/@${profile.slug}) to inquire about your products/services.`
    );
    window.open(`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  const handleRequestQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingQuote(true);
    try {
      const res = await fetch("/api/business/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: profile.id,
          customerName: custName,
          customerPhone: custPhone,
          customerWhatsApp: custWhatsApp,
          notes: custNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit quote request.");
      setQuoteSuccess(true);
      setTimeout(() => {
        setIsQuoteModalOpen(false);
        setQuoteSuccess(false);
        setCustName("");
        setCustPhone("");
        setCustWhatsApp("");
        setCustNotes("");
      }, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-stone-500 text-xs">
        Loading digital storefront...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Storefront Not Found</h2>
        <p className="text-xs text-stone-500 mb-6">{error || "The requested business profile does not exist."}</p>
        <Link href="/" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const rawProducts = profile.products || [];
  const rawRentals = profile.rentals || [];
  const rawServices = profile.services || [];

  const products = rawProducts.filter((p: any) => {
    if (!q) return true;
    const title = (p.title || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    const description = (p.description || "").toLowerCase();
    return title.includes(q) || category.includes(q) || description.includes(q);
  });

  const rentals = rawRentals.filter((r: any) => {
    if (!q) return true;
    const title = (r.title || "").toLowerCase();
    const category = (r.category || "").toLowerCase();
    const description = (r.description || "").toLowerCase();
    return title.includes(q) || category.includes(q) || description.includes(q);
  });

  const services = rawServices.filter((s: any) => {
    if (!q) return true;
    const name = (s.serviceName || s.name || "").toLowerCase();
    const description = (s.description || "").toLowerCase();
    return name.includes(q) || description.includes(q);
  });

  const renderProductCard = (p: any) => {
    const pImages: string[] = Array.isArray(p.images)
      ? p.images
      : typeof p.images === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(p.images);
            return Array.isArray(parsed) ? parsed : [p.images];
          } catch {
            return p.images ? [p.images] : [];
          }
        })()
      : [];

    const hasDiscount = p.originalPrice && Number(p.originalPrice) > Number(p.price);
    const discountPercent = hasDiscount
      ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)
      : 0;

    return (
      <div
        key={p.id}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
      >
        <div>
          <Link
            href={`/products/${p.slug || p.id}`}
            className="block relative aspect-[4/3] w-full rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3 group/img"
          >
            {pImages[0] ? (
              <img
                src={pImages[0]}
                alt={p.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <Package className="w-8 h-8 opacity-40" />
              </div>
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
              {hasDiscount && (
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-lg shadow-sm">
                  🏷️ {discountPercent}% OFF
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewingProduct({ ...p, images: pImages });
                setActiveImageIndex(0);
                setViewingMediaType(p.videoUrl && pImages.length === 0 ? "video" : "image");
              }}
              className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1 transition-all"
              title="Preview full photos"
            >
              <Eye className="w-3 h-3" /> {pImages.length > 1 ? `${pImages.length} Photos` : "Zoom"}
            </button>
          </Link>

          {pImages.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {pImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`${p.title} photo ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingProduct({ ...p, images: pImages });
                    setActiveImageIndex(idx);
                    setViewingMediaType("image");
                  }}
                  className="w-9 h-9 rounded-xl object-cover border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-emerald-500 transition-all shrink-0 hover:scale-105"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{p.category}</span>
            {p.stockQuantity !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.stockQuantity > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950 text-rose-600"
                }`}
              >
                {p.stockQuantity > 0 ? `✓ In Stock (${p.stockQuantity})` : "Out of Stock"}
              </span>
            )}
          </div>

          <Link href={`/products/${p.slug || p.id}`} className="block group/title">
            <h4 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-2 group-hover/title:text-emerald-600 transition-colors">
              {p.title}
            </h4>
          </Link>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1">{p.description}</p>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between mt-3">
          <div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatGHS(p.price)}
            </span>
            {hasDiscount && (
              <span className="block text-[11px] text-stone-400 line-through font-semibold">
                {formatGHS(p.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleWhatsAppClick(p.title)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Order
            </button>
            <Link
              href={`/products/${p.slug || p.id}`}
              className="p-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl transition-all"
              title="View full details"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderRentalCard = (r: any) => {
    const rImages: string[] = Array.isArray(r.images)
      ? r.images
      : typeof r.images === "string"
      ? (() => {
          try {
            return JSON.parse(r.images);
          } catch {
            return r.images ? [r.images] : [];
          }
        })()
      : [];

    return (
      <div
        key={r.id}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all group"
      >
        <div>
          <div
            onClick={() => openLightbox(r.title, rImages, 0)}
            className="cursor-zoom-in group/img aspect-video w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden mb-3 relative"
          >
            {rImages[0] ? (
              <img
                src={rImages[0]}
                alt={r.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-500">
                <Wrench className="w-8 h-8 opacity-40" />
              </div>
            )}

            {rImages.length > 0 && (
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 bg-black/80 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow">
                  <Maximize2 className="w-3 h-3" /> View Full Size
                </span>
              </div>
            )}

            {rImages.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1">
                <Eye className="w-3 h-3" /> {rImages.length} Photos
              </span>
            )}
          </div>

          {rImages.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {rImages.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(r.title, rImages, idx);
                  }}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-amber-200 dark:border-amber-900 shrink-0 hover:scale-105 transition-transform cursor-pointer"
                >
                  <img src={imgUrl} alt={`${r.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-amber-600 uppercase">{r.category}</span>
            {r.operatorIncluded && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                + Operator Included
              </span>
            )}
          </div>

          <h4
            onClick={() => {
              setViewingRental({ ...r, images: rImages });
              setActiveImageIndex(0);
            }}
            className="text-base font-bold text-stone-900 dark:text-white mt-1 cursor-pointer hover:text-amber-600 transition"
          >
            {r.title}
          </h4>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1">{r.description}</p>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {formatGHS(r.dailyRate)} / day
            </span>
            {r.weeklyRate && (
              <span className="block text-[10px] text-stone-400">
                {formatGHS(r.weeklyRate)} / week
              </span>
            )}
          </div>
          <button
            onClick={() => handleWhatsAppClick(`Rental: ${r.title}`)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Book Rental
          </button>
        </div>
      </div>
    );
  };

  const renderServiceCard = (s: any) => {
    const sPhotos: string[] = Array.isArray(s.portfolioPhotos)
      ? s.portfolioPhotos
      : typeof s.portfolioPhotos === "string"
      ? (() => {
          try {
            return JSON.parse(s.portfolioPhotos);
          } catch {
            return s.portfolioPhotos ? [s.portfolioPhotos] : [];
          }
        })()
      : [];

    return (
      <div
        key={s.id}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all group"
      >
        <div>
          {sPhotos.length > 0 ? (
            <div
              onClick={() => openLightbox(s.serviceName, sPhotos, 0)}
              className="cursor-zoom-in group/img aspect-video w-full rounded-2xl bg-blue-50 dark:bg-blue-950/40 overflow-hidden mb-3 relative"
            >
              <img
                src={sPhotos[0]}
                alt={s.serviceName}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 bg-black/80 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow">
                  <Maximize2 className="w-3 h-3" /> View Full Size
                </span>
              </div>
              {sPhotos.length > 1 && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {sPhotos.length} Photos
                </span>
              )}
            </div>
          ) : null}

          {sPhotos.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {sPhotos.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(s.serviceName, sPhotos, idx);
                  }}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-900 shrink-0 hover:scale-105 transition-transform cursor-pointer"
                >
                  <img src={imgUrl} alt={`${s.serviceName} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <h4
            onClick={() => {
              setViewingService({ ...s, portfolioPhotos: sPhotos });
              setActiveImageIndex(0);
            }}
            className="text-base font-bold text-stone-900 dark:text-white cursor-pointer hover:text-emerald-600 transition"
          >
            {s.serviceName}
          </h4>
          <p className="text-xs text-stone-500 line-clamp-3 mt-1 leading-relaxed">{s.description}</p>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {s.priceStartingFrom ? `From ${formatGHS(s.priceStartingFrom)}` : "Custom Quote"}
            </span>
            {s.pricingModel && (
              <span className="block text-[10px] text-stone-400 capitalize">
                Model: {s.pricingModel.toLowerCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setViewingService({ ...s, portfolioPhotos: sPhotos });
              setIsQuoteModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Get Estimate
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 lg:py-12 text-stone-900 dark:text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Servora Marketplace
        </Link>

        {/* HERO STOREFRONT BANNER */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Cover Banner with Premium Default Fallback */}
          <div className="h-48 lg:h-64 w-full bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 relative">
            <img
              src={profile.bannerUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80"}
              alt="Storefront Banner"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/30 to-transparent" />
          </div>

          {/* Profile Header Info */}
          <div className="p-6 lg:p-8 relative -mt-16 lg:-mt-20">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex items-end gap-5">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-white dark:bg-stone-800 border-4 border-white dark:border-stone-900 shadow-2xl overflow-hidden shrink-0 flex items-center justify-center font-black text-3xl text-emerald-600">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt={profile.businessName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                      <span>Verified Business</span>
                    </span>
                    <span className="px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full text-xs font-bold">
                      {profile.zone}
                    </span>
                  </div>

                  <h1 className="text-2xl lg:text-4xl font-black text-stone-900 dark:text-white">
                    {profile.businessName}
                  </h1>
                  {profile.tagline && (
                    <p className="text-xs lg:text-sm font-medium text-stone-500 dark:text-stone-400 mt-1">
                      {profile.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* PRIMARY ACTION CTAS */}
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <FavoriteButton
                  businessId={profile.id}
                  businessSlug={profile.slug}
                  businessName={profile.businessName}
                  variant="button"
                  size="md"
                  className="py-3 px-4 shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setIsShareDrawerOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold rounded-2xl text-xs transition-all border border-stone-200 dark:border-stone-700"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" /> Share Link
                </button>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold rounded-2xl text-xs transition-all border border-stone-200 dark:border-stone-700"
                >
                  <QrCode className="w-4 h-4 text-emerald-600" /> QR Code
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppClick()}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>

                <a
                  href={`tel:${profile.phone}`}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-2xl text-xs hover:opacity-90 transition-all"
                >
                  <PhoneCall className="w-4 h-4" /> Call
                </a>

                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white font-bold rounded-2xl text-xs hover:bg-stone-200 transition-all border border-stone-200 dark:border-stone-700"
                >
                  Get Price Estimate
                </button>
              </div>
            </div>

            {/* Description & Overview */}
            {profile.description && (
              <p className="text-xs lg:text-sm text-stone-600 dark:text-stone-300 mt-6 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-6">
                {profile.description}
              </p>
            )}

            {/* Physical Workshop / Storefront Photo Showcase */}
            {profile.storefrontPhotoUrl && (
              <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Physical Storefront & Workshop Photo
                    </h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                    Verified Location
                  </span>
                </div>
                <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 group h-64 sm:h-80">
                  <img
                    src={profile.storefrontPhotoUrl}
                    alt={`${profile.businessName} Physical Storefront`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-4 sm:p-6">
                    <div className="text-white">
                      <p className="text-xs font-black drop-shadow-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {profile.addressDetails || profile.zone}
                      </p>
                      {profile.landmark && (
                        <p className="text-[11px] text-stone-300">Landmark: {profile.landmark}</p>
                      )}
                    </div>
                    <a
                      href={profile.storefrontPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-900 text-xs font-bold rounded-xl flex items-center gap-1 shadow-lg backdrop-blur-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Full Photo
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Location & Interactive Live Map */}
            {(() => {
              const lat = profile.latitude ? Number(profile.latitude) : 9.4074;
              const lng = profile.longitude ? Number(profile.longitude) : -0.8416;
              const googleMapsUrl = profile.latitude && profile.longitude
                ? `https://www.google.com/maps/dir/?api=1&destination=${profile.latitude},${profile.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((profile.addressDetails || profile.zone || "Tamale") + " Ghana")}`;

              return (
                <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-2">
                          <span>{profile.addressDetails || profile.zone}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full font-mono">
                            {profile.latitude && profile.longitude ? `${Number(profile.latitude).toFixed(4)}° N, ${Number(profile.longitude).toFixed(4)}° W` : "Tamale, Ghana"}
                          </span>
                        </h4>
                        {profile.landmark && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            Landmark: <strong>{profile.landmark}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" /> Open in Google Maps (Live Directions) 🚗
                    </a>
                  </div>

                  {/* Interactive Live Map Iframe Embed */}
                  <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-inner h-56 sm:h-64 bg-stone-100 dark:bg-stone-950">
                    <iframe
                      title="Storefront Location Live Map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-stone-900/90 hover:bg-stone-900 text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 backdrop-blur-md shadow-lg transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Navigate to Store ↗
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* TABBED SHOWCASE: PRODUCTS, RENTALS, SERVICES */}
        <div className="space-y-6">
          {/* Real-Time Store Catalog Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${profile.businessName} catalog & services...`}
              className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery.trim() ? (
            /* UNIFIED GENERAL OMNISEARCH RESULTS */
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-600 tracking-wider">
                  All Catalog Results for &quot;{searchQuery}&quot; ({products.length + rentals.length + services.length} items)
                </span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>

              {products.length === 0 && rentals.length === 0 && services.length === 0 && (
                <div className="py-16 text-center text-stone-400 text-xs">
                  No products, equipment rentals, or services matching &quot;{searchQuery}&quot; found in this store.
                </div>
              )}

              {/* 1. Matching Products */}
              {products.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" /> Products &amp; Goods ({products.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p: any) => renderProductCard(p))}
                  </div>
                </div>
              )}

              {/* 2. Matching Equipment Rentals */}
              {rentals.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" /> Equipment Rentals ({rentals.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rentals.map((r: any) => renderRentalCard(r))}
                  </div>
                </div>
              )}

              {/* 3. Matching Services */}
              {services.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" /> Services Offered ({services.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s: any) => renderServiceCard(s))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Normal 3-Tab Segment Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "products"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  <Package className="w-4 h-4" /> Products ({products.length})
                </button>

                <button
                  onClick={() => setActiveTab("rentals")}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "rentals"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  <Wrench className="w-4 h-4" /> Equipment Rentals ({rentals.length})
                </button>

                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeTab === "services"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Services Offered ({services.length})
                </button>
              </div>

              {/* PRODUCTS SHOWCASE */}
              {activeTab === "products" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p: any) => renderProductCard(p))}
                  {products.length === 0 && (
                    <div className="col-span-full py-16 text-center text-stone-400 text-xs">
                      No active products listed on this digital storefront yet.
                    </div>
                  )}
                </div>
              )}

              {/* RENTALS SHOWCASE */}
              {activeTab === "rentals" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentals.map((r: any) => renderRentalCard(r))}
                  {rentals.length === 0 && (
                    <div className="col-span-full py-16 text-center text-stone-400 text-xs">
                      No heavy machinery or tool rentals listed yet.
                    </div>
                  )}
                </div>
              )}

              {/* SERVICES SHOWCASE */}
              {activeTab === "services" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s: any) => renderServiceCard(s))}
                  {services.length === 0 && (
                    <div className="col-span-full py-16 text-center text-stone-400 text-xs">
                      No custom service options listed yet.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FULL PRODUCT MULTI-IMAGE & 30s VIDEO GALLERY MODAL */}
      {viewingProduct && (
        <div
          onClick={() => setViewingProduct(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-auto cursor-default max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header with Close X */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Storefront
              </button>

              {/* Toggle Photos / Video tab if product has video */}
              {viewingProduct.videoUrl && (
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewingMediaType("image")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      viewingMediaType === "image"
                        ? "bg-white dark:bg-stone-900 text-emerald-600 shadow-sm"
                        : "text-stone-500"
                    }`}
                  >
                    📸 Photos ({viewingProduct.images?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingMediaType("video")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      viewingMediaType === "video"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-600"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" /> 30s Video
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player / Image Viewer */}
            {viewingMediaType === "video" && viewingProduct.videoUrl ? (
              <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  src={viewingProduct.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div>
                {/* Main Image View */}
                <div
                  onClick={() => openLightbox(viewingProduct.title, viewingProduct.images || [], activeImageIndex)}
                  className="cursor-zoom-in group/mainimg relative aspect-video w-full rounded-2xl bg-stone-950 overflow-hidden shadow-inner mb-3"
                >
                  {viewingProduct.images && viewingProduct.images[activeImageIndex] ? (
                    <img
                      src={viewingProduct.images[activeImageIndex]}
                      alt={viewingProduct.title}
                      className="w-full h-full object-contain group-hover/mainimg:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover/mainimg:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover/mainimg:opacity-100 transition-opacity px-3 py-1.5 bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" /> View Full Size
                    </span>
                  </div>

                  {/* Prev / Next controls */}
                  {viewingProduct.images && viewingProduct.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : viewingProduct.images.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 text-white rounded-full hover:bg-black transition-all shadow-lg hover:scale-110"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < viewingProduct.images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 text-white rounded-full hover:bg-black transition-all shadow-lg hover:scale-110"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip: Shows ALL images */}
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.images.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageIndex(idx);
                          setViewingMediaType("image");
                        }}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx && viewingMediaType === "image"
                            ? "border-emerald-600 scale-105 shadow-md"
                            : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Specifications & Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{viewingProduct.category}</span>
                <div className="flex items-center gap-2">
                  {viewingProduct.stockQuantity !== undefined && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {viewingProduct.stockQuantity > 0 ? `✓ ${viewingProduct.stockQuantity} in Stock` : "Out of Stock"}
                    </span>
                  )}
                  {viewingProduct.condition && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      Condition: {viewingProduct.condition.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-black text-stone-900 dark:text-white">{viewingProduct.title}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {viewingProduct.description}
              </p>

              {/* Price & Discount breakdown */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl flex items-center justify-between border border-stone-200 dark:border-stone-700">
                <div>
                  <span className="text-xs text-stone-400 font-bold block">Selling Price:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatGHS(viewingProduct.price)}
                    </span>
                    {viewingProduct.originalPrice && Number(viewingProduct.originalPrice) > Number(viewingProduct.price) && (
                      <span className="text-xs text-stone-400 line-through">
                        {formatGHS(viewingProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {viewingProduct.originalPrice && Number(viewingProduct.originalPrice) > Number(viewingProduct.price) && (
                  <div className="text-right">
                    <span className="text-[10px] px-2.5 py-1 bg-rose-500 text-white font-black rounded-lg">
                      Save GH₵ {(Number(viewingProduct.originalPrice) - Number(viewingProduct.price)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Close Modal
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = viewingProduct.title;
                  setViewingProduct(null);
                  handleWhatsAppClick(title);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Order / Inquire on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL RENTAL DETAIL MODAL */}
      {viewingRental && (
        <div
          onClick={() => setViewingRental(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-auto cursor-default max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <button
                type="button"
                onClick={() => setViewingRental(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Storefront
              </button>
              <button
                type="button"
                onClick={() => setViewingRental(null)}
                className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rental Images Viewer */}
            <div>
              <div
                onClick={() => openLightbox(viewingRental.title, viewingRental.images || [], activeImageIndex)}
                className="cursor-zoom-in group/mainimg relative aspect-video w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden shadow-inner mb-3"
              >
                {viewingRental.images && viewingRental.images[activeImageIndex] ? (
                  <img
                    src={viewingRental.images[activeImageIndex]}
                    alt={viewingRental.title}
                    className="w-full h-full object-contain group-hover/mainimg:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-500">
                    <Wrench className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover/mainimg:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover/mainimg:opacity-100 transition-opacity px-3 py-1.5 bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" /> View Full Size
                  </span>
                </div>
              </div>

              {viewingRental.images && viewingRental.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {viewingRental.images.map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-amber-600 scale-105 shadow-md"
                          : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rental Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{viewingRental.category}</span>
                {viewingRental.operatorIncluded && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    ✓ Includes Certified Operator
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-stone-900 dark:text-white">{viewingRental.title}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {viewingRental.description}
              </p>

              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-bold block">Rental Rates:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {formatGHS(viewingRental.dailyRate)} / day
                    </span>
                    {viewingRental.weeklyRate && (
                      <span className="text-xs text-stone-500 font-bold">
                        ({formatGHS(viewingRental.weeklyRate)} / week)
                      </span>
                    )}
                  </div>
                </div>

                {viewingRental.securityDeposit && (
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-bold">Deposit:</span>
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {formatGHS(viewingRental.securityDeposit)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setViewingRental(null)}
                className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Close Modal
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = viewingRental.title;
                  setViewingRental(null);
                  handleWhatsAppClick(`Rental Equipment: ${title}`);
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Book via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SERVICE DETAIL MODAL */}
      {viewingService && (
        <div
          onClick={() => setViewingService(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-auto cursor-default max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Storefront
              </button>
              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Portfolio Photos */}
            {viewingService.photos && viewingService.photos.length > 0 && (
              <div>
                <div
                  onClick={() => openLightbox(viewingService.serviceName, viewingService.photos, activeImageIndex)}
                  className="cursor-zoom-in group/mainimg relative aspect-video w-full rounded-2xl bg-blue-50 dark:bg-blue-950/40 overflow-hidden shadow-inner mb-3"
                >
                  <img
                    src={viewingService.photos[activeImageIndex]}
                    alt={viewingService.serviceName}
                    className="w-full h-full object-contain group-hover/mainimg:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/mainimg:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover/mainimg:opacity-100 transition-opacity px-3 py-1.5 bg-black/80 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5" /> View Full Size
                    </span>
                  </div>
                </div>

                {viewingService.photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingService.photos.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-blue-600 scale-105 shadow-md"
                            : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Service Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Service Offering</span>
                {viewingService.estimatedDuration && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {viewingService.estimatedDuration}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-stone-900 dark:text-white">{viewingService.serviceName}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {viewingService.description}
              </p>

              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-bold block">Estimated Pricing:</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {viewingService.startingPrice ? formatGHS(viewingService.startingPrice) : "On Custom Quote"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setViewingService(null)}
                className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-2xl text-xs transition-all cursor-pointer"
              >
                Close Modal
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingService(null);
                    setCustNotes(`Interested in service: "${viewingService.serviceName}"`);
                    setIsQuoteModalOpen(true);
                  }}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Request Quote
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const title = viewingService.serviceName;
                    setViewingService(null);
                    handleWhatsAppClick(`Service Inquire: ${title}`);
                  }}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED FULLSCREEN HIGH-RES LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div
          onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-4 text-white z-10 cursor-default"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {lightbox.title}
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-bold text-stone-300">
                {lightbox.activeIndex + 1} / {lightbox.images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightbox((prev) => ({ ...prev, isZoomed: !prev.isZoomed }))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={lightbox.isZoomed ? "Zoom Out" : "Zoom In"}
              >
                {lightbox.isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                <span className="hidden sm:inline">{lightbox.isZoomed ? "Fit Screen" : "Zoom 1.5x"}</span>
              </button>

              <button
                type="button"
                onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
                className="p-2 bg-white/10 hover:bg-rose-600 rounded-full text-white transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden cursor-default"
          >
            <img
              src={lightbox.images[lightbox.activeIndex]}
              alt={`${lightbox.title} full size`}
              className={`max-h-[75vh] max-w-full object-contain rounded-xl transition-all duration-300 ${
                lightbox.isZoomed ? "scale-150 cursor-grab" : "scale-100 cursor-zoom-in"
              }`}
              onClick={() => setLightbox((prev) => ({ ...prev, isZoomed: !prev.isZoomed }))}
            />

            {/* Prev / Next Controls */}
            {lightbox.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) => ({
                      ...prev,
                      activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.images.length - 1,
                      isZoomed: false,
                    }))
                  }
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all backdrop-blur-sm shadow-xl hover:scale-110 cursor-pointer"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((prev) => ({
                      ...prev,
                      activeIndex: prev.activeIndex < prev.images.length - 1 ? prev.activeIndex + 1 : 0,
                      isZoomed: false,
                    }))
                  }
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all backdrop-blur-sm shadow-xl hover:scale-110 cursor-pointer"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Row */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 cursor-default"
          >
            {lightbox.images.map((imgUrl: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLightbox((prev) => ({
                    ...prev,
                    activeIndex: idx,
                    isZoomed: false,
                  }));
                }}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  lightbox.activeIndex === idx
                    ? "border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30"
                    : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REQUEST CUSTOM QUOTE MODAL */}
      {isQuoteModalOpen && (
        <div
          onClick={() => setIsQuoteModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleRequestQuoteSubmit}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white text-base">Request a Custom Price Quote</h3>
              <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h4 className="font-bold text-base">Quote Request Submitted!</h4>
                <p className="text-xs text-stone-500">
                  {profile.businessName} will contact you shortly with an itemized quote proposal.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Abubakari Ibrahim"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    value={custWhatsApp}
                    onChange={(e) => setCustWhatsApp(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Service / Product Details</label>
                  <textarea
                    rows={3}
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    placeholder="Describe what you need built, repaired, or rented..."
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingQuote}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20"
                  >
                    {sendingQuote ? "Sending..." : "Submit Quote Request"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Growth Toolkit Modals */}
      <ShareDrawerModal
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        businessName={profile.businessName}
        slug={profile.slug}
        zone={profile.zone}
        tagline={profile.tagline}
      />

      <QrCodeGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        businessName={profile.businessName}
        slug={profile.slug}
        zone={profile.zone}
        verificationStatus={profile.verificationStatus}
      />
    </div>
  );
}

