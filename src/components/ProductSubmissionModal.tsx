"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  MapPin,
  Image as ImageIcon,
  Video,
  Truck,
  UserCheck,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Key,
  ShieldCheck,
} from "lucide-react";
import { ItemCondition, SellerType } from "@/lib/productListingTypes";
import { formatGHS } from "@/lib/utils";
import { CLASSIFIED_CATEGORIES, getSubcategoriesForCategory } from "@/lib/categoriesData";
import { CategoryPickerModal } from "@/components/CategoryPickerModal";

interface ProductSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
}: ProductSubmissionModalProps) {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CLASSIFIED_CATEGORIES[0].name);
  const [subCategory, setSubCategory] = useState<string>(CLASSIFIED_CATEGORIES[0].subcategories[0].name);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [condition, setCondition] = useState<ItemCondition>("USED_GOOD");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState<number>(250);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [currency, setCurrency] = useState("GHS");

  const [area, setArea] = useState("Sakasaka, Tamale");
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>(["PICKUP", "LOCAL_DELIVERY"]);

  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80");
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Guest Fields
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestWhatsApp, setGuestWhatsApp] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ listing: any; magicLink: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSession(data.user);
          setIsGuest(false);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  function handleAddImageUrl() {
    if (!imageUrl.trim()) return;
    if (!imagesList.includes(imageUrl.trim())) {
      setImagesList([...imagesList, imageUrl.trim()]);
    }
  }

  function handleVerifyOtp() {
    if (!otpCode || otpCode.trim().length < 4) {
      alert("Please enter a valid 4-digit SMS OTP code (e.g. 1234).");
      return;
    }
    setIsOtpVerified(true);
  }

  async function handleSubmitListing(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !price || !area) {
      setError("Please fill out all required product fields.");
      return;
    }

    if (isGuest && (!guestName || !guestPhone)) {
      setError("Guest seller name and phone number are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalImages = imagesList.length > 0 ? imagesList : [imageUrl];

      const res = await fetch("/api/products/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          subCategory,
          condition,
          price: Number(price),
          isNegotiable,
          currency,
          images: finalImages,
          videoUrl: videoUrl || undefined,
          area,
          deliveryOptions,
          sellerType: isGuest ? "GUEST" : "REGISTERED_USER",
          guestName: isGuest ? guestName : undefined,
          guestPhone: isGuest ? guestPhone : undefined,
          guestWhatsApp: isGuest ? guestWhatsApp || guestPhone : undefined,
          guestEmail: isGuest ? guestEmail : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.listing) {
        setCreatedResult({
          listing: data.listing,
          magicLink: data.magicLink,
        });
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.error || "Failed to submit product listing.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-5 z-10 text-stone-900 dark:text-white transition-all">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Post Item / Product for Sale 🛍️</h2>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isGuest ? "Guest Classifieds Submission" : `Seller: ${session?.name}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {createdResult ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black">Listing Submitted for Approval! 🎉</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Your item <strong className="text-stone-900 dark:text-white">"{createdResult.listing.title}"</strong> has been queued for Super Admin review. You will receive notification upon approval.
            </p>

            {createdResult.magicLink && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2 max-w-md mx-auto text-left">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Key className="w-4 h-4 text-emerald-600" /> Guest Seller Management Link:
                </span>
                <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 break-all bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-xl">
                  {createdResult.magicLink}
                </p>
                <span className="text-[10px] text-stone-400 block">
                  Bookmark this link to edit or mark your item as SOLD later without logging in!
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition"
            >
              Done & Return to Market
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitListing} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Stepper Tabs */}
            <div className="flex items-center justify-between gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl text-[11px] font-bold border border-stone-200 dark:border-stone-700">
              {[
                { num: 1, label: "1. Seller Info" },
                { num: 2, label: "2. Item Details" },
                { num: 3, label: "3. Pricing & Delivery" },
                { num: 4, label: "4. Photos & Media" },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                    step === s.num
                      ? "bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* STEP 1: SELLER INFO */}
            {step === 1 && (
              <div className="space-y-4">
                {session ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-sm text-stone-900 dark:text-white block">
                        Logged in as {session.name} ({session.role})
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Phone: {session.phone} • Email: {session.email || "Registered Account"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="font-bold text-stone-700 dark:text-stone-300 block">
                      Guest Seller Contact & Verification Info *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Baba Salifu"
                          className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">Primary Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+233240000000"
                          className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">WhatsApp Number</label>
                        <input
                          type="text"
                          value={guestWhatsApp}
                          onChange={(e) => setGuestWhatsApp(e.target.value)}
                          placeholder="+233240000000 (For buyer instant chat)"
                          className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 mb-1">Email Address (Optional)</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="seller@gmail.com"
                          className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Sim OTP Verification */}
                    <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block">
                          Instant SMS OTP Verification
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {isOtpVerified ? "✓ Phone Verified" : "Enter 1234 for instant verification"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isOtpVerified ? (
                          <>
                            <input
                              type="text"
                              maxLength={4}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="1234"
                              className="w-16 p-2 text-center bg-white dark:bg-stone-900 border rounded-xl font-mono font-bold"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Verify
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-xl border border-emerald-300">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ITEM DETAILS */}
            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. DeWalt 20V Max Heavy Duty Cordless Drill Set"
                    className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-500">Category & Subcategory *</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(true)}
                    className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Visual Category Explorer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const subs = getSubcategoriesForCategory(newCat);
                        if (subs.length > 0) setSubCategory(subs[0].name);
                      }}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-semibold outline-none"
                    >
                      {CLASSIFIED_CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Subcategory *</label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-semibold outline-none"
                    >
                      {getSubcategoriesForCategory(category).map((sub) => (
                        <option key={sub.slug} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Item Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-semibold outline-none"
                    >
                      <option value="BRAND_NEW">Brand New</option>
                      <option value="USED_LIKE_NEW">Used - Like New</option>
                      <option value="USED_GOOD">Used - Good Condition</option>
                      <option value="USED_FAIR">Used - Fair Condition</option>
                      <option value="REFURBISHED">Refurbished</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe item specifications, included accessories, condition details, and reason for selling..."
                    className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: PRICING & DELIVERY */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Price (GHS GH₵) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Neighborhood / Town Area *</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-semibold outline-none"
                    >
                      <option value="Sakasaka, Tamale">Sakasaka, Tamale</option>
                      <option value="Choggu, Tamale">Choggu, Tamale</option>
                      <option value="Nyohini, Tamale">Nyohini, Tamale</option>
                      <option value="Aboabo, Tamale">Aboabo, Tamale</option>
                      <option value="Central Market, Tamale">Central Market, Tamale</option>
                      <option value="Dungu UDS, Tamale">Dungu UDS, Tamale</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="negotiableCheck"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="negotiableCheck" className="font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                    Price is Negotiable for quick buyers
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-stone-500">Delivery & Pickup Options</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "PICKUP", label: "Self Pickup Available" },
                      { id: "LOCAL_DELIVERY", label: "Local Tamale Dispatch Delivery" },
                      { id: "SHIPPING", label: "Nationwide Shipping" },
                    ].map((opt) => {
                      const isSelected = deliveryOptions.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setDeliveryOptions(deliveryOptions.filter((d) => d !== opt.id));
                            } else {
                              setDeliveryOptions([...deliveryOptions, opt.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PHOTOS & MEDIA */}
            {step === 4 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Image URL (Upload or Paste Link)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Add Photo
                    </button>
                  </div>
                </div>

                {imagesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {imagesList.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300">
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-0.5 bg-stone-950/80 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Step Navigation */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting Listing..." : "Submit Item for Moderation 🚀"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <CategoryPickerModal
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        selectedCategory={category}
        selectedSubCategory={subCategory}
        onSelect={(cat, sub) => {
          setCategory(cat);
          if (sub) setSubCategory(sub);
        }}
      />
    </div>
  );
}
