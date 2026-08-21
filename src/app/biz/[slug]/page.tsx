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
} from "lucide-react";
import { formatGHS } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareDrawerModal } from "@/components/ShareDrawerModal";
import { QrCodeGeneratorModal } from "@/components/QrCodeGeneratorModal";
import { DigitalPromoFlyerModal } from "@/components/DigitalPromoFlyerModal";

export default function PublicDigitalStorefrontPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<any>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"products" | "rentals" | "services" | "posts">("products");

  // Product View Detail Modal State
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Growth Toolkit Modal States
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPromoFlyerOpen, setIsPromoFlyerOpen] = useState(false);

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
        setViewingProduct(null);
        setIsQuoteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const products = profile.products || [];
  const rentals = profile.rentals || [];
  const services = profile.services || [];

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
          {/* Cover Banner */}
          <div className="h-48 lg:h-64 w-full bg-gradient-to-r from-emerald-900 to-stone-900 relative">
            {profile.bannerUrl && (
              <img src={profile.bannerUrl} alt="Storefront Banner" className="w-full h-full object-cover opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
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
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified {profile.verificationStatus}
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
                  onClick={() => setIsPromoFlyerOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold rounded-2xl text-xs transition-all border border-stone-200 dark:border-stone-700"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Promo Flyer
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
                  Request Quote
                </button>
              </div>
            </div>

            {/* Description & Overview */}
            {profile.description && (
              <p className="text-xs lg:text-sm text-stone-600 dark:text-stone-300 mt-6 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-6">
                {profile.description}
              </p>
            )}

            {/* Location & GPS Card */}
            <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                    {profile.addressDetails || profile.zone}
                  </h4>
                  {profile.landmark && (
                    <p className="text-[11px] text-stone-500">Landmark: {profile.landmark}</p>
                  )}
                </div>
              </div>

              {profile.latitude && profile.longitude && (
                <a
                  href={`https://maps.google.com/?q=${profile.latitude},${profile.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" /> View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* TABBED SHOWCASE: PRODUCTS, RENTALS, SERVICES */}
        <div className="space-y-6">
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
              {products.map((p: any) => {
                const pImages: string[] = Array.isArray(p.images) ? p.images : [];

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      <div
                        onClick={() => {
                          setViewingProduct(p);
                          setActiveImageIndex(0);
                        }}
                        className="cursor-pointer relative aspect-video w-full rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3"
                      >
                        {pImages[0] ? (
                          <img src={pImages[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Package className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View {pImages.length || 1} Photos
                        </span>
                      </div>

                      {/* Display thumbnail row of all uploaded images up to 5 */}
                      {pImages.length > 1 && (
                        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                          {pImages.slice(0, 5).map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`${p.title} photo ${idx + 1}`}
                              onClick={() => {
                                setViewingProduct(p);
                                setActiveImageIndex(idx);
                              }}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 cursor-pointer hover:border-emerald-500 transition-all shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      <span className="text-[10px] font-bold text-emerald-600 uppercase">{p.category}</span>
                      <h4
                        onClick={() => {
                          setViewingProduct(p);
                          setActiveImageIndex(0);
                        }}
                        className="text-base font-bold text-stone-900 dark:text-white mt-1 cursor-pointer hover:text-emerald-600"
                      >
                        {p.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatGHS(p.price)}
                      </span>
                      <button
                        onClick={() => handleWhatsAppClick(p.title)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                      >
                        Inquire on WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
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
              {rentals.map((r: any) => {
                const rImages: string[] = Array.isArray(r.images) ? r.images : [];

                return (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden mb-3">
                        {rImages[0] ? (
                          <img src={rImages[0]} alt={r.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-500">
                            <Wrench className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                      </div>
                      {rImages.length > 1 && (
                        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                          {rImages.slice(0, 5).map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`${r.title} ${idx + 1}`}
                              className="w-10 h-10 rounded-xl object-cover border border-amber-200 shrink-0"
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-amber-600 uppercase">{r.category}</span>
                      <h4 className="text-base font-bold text-stone-900 dark:text-white mt-1">{r.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{r.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">
                          {formatGHS(r.dailyRate)} / day
                        </span>
                      </div>
                      <button
                        onClick={() => handleWhatsAppClick(`Rental: ${r.title}`)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow"
                      >
                        Book Rental
                      </button>
                    </div>
                  </div>
                );
              })}
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
              {services.map((s: any) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-white">{s.serviceName}</h4>
                    <p className="text-xs text-stone-500 line-clamp-3 mt-2">{s.description}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">
                      {s.startingPrice ? formatGHS(s.startingPrice) : "On Quote"}
                    </span>
                    <button
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full py-16 text-center text-stone-400 text-xs">
                  No custom service options listed yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL PRODUCT MULTI-IMAGE GALLERY MODAL */}
      {viewingProduct && (
        <div
          onClick={() => setViewingProduct(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative my-auto cursor-default"
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

              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image View */}
            <div className="relative aspect-video w-full rounded-2xl bg-stone-950 overflow-hidden shadow-inner">
              {viewingProduct.images && viewingProduct.images[activeImageIndex] ? (
                <img
                  src={viewingProduct.images[activeImageIndex]}
                  alt={viewingProduct.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <Package className="w-12 h-12" />
                </div>
              )}

              {/* Prev / Next controls */}
              {viewingProduct.images && viewingProduct.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : viewingProduct.images.length - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 text-white rounded-full hover:bg-black transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev < viewingProduct.images.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/70 text-white rounded-full hover:bg-black transition-all shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {viewingProduct.images && viewingProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {viewingProduct.images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? "border-emerald-600 scale-105 shadow-md" : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{viewingProduct.category}</span>
              <h3 className="text-2xl font-black text-stone-900 dark:text-white mt-1">{viewingProduct.title}</h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">{viewingProduct.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 gap-3 flex-wrap">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatGHS(viewingProduct.price)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingProduct(null)}
                  className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-2xl text-xs transition-all"
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
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Inquire on WhatsApp
                </button>
              </div>
            </div>
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

      <DigitalPromoFlyerModal
        isOpen={isPromoFlyerOpen}
        onClose={() => setIsPromoFlyerOpen(false)}
        businessName={profile.businessName}
        slug={profile.slug}
        category={profile.businessType}
        zone={profile.zone}
        verificationStatus={profile.verificationStatus}
        ratingAverage={profile.ratingAverage}
        reviewsCount={profile.reviewsCount}
        topItems={profile.products?.map((p: any) => ({ title: p.title, price: p.price })) || []}
      />
    </div>
  );
}

