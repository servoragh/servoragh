"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Navigation,
  FileCheck,
  Store,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";

interface BusinessOnboardingWizardProps {
  initialData?: any;
  onComplete: () => void;
}

export function BusinessOnboardingWizard({ initialData, onComplete }: BusinessOnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState(initialData?.businessName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [businessType, setBusinessType] = useState(initialData?.businessType || "SOLO_ARTISAN");
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(initialData?.bannerUrl || "");

  // Uploading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingStorefront, setUploadingStorefront] = useState(false);

  // Location State
  const [zone, setZone] = useState(initialData?.zone || "Sakasaka");
  const [addressDetails, setAddressDetails] = useState(initialData?.addressDetails || "");
  const [landmark, setLandmark] = useState(initialData?.landmark || "");
  const [latitude, setLatitude] = useState(initialData?.latitude || "");
  const [longitude, setLongitude] = useState(initialData?.longitude || "");
  const [isLocating, setIsLocating] = useState(false);

  // Business Hours State
  const [emergencyCallout, setEmergencyCallout] = useState(initialData?.businessHours?.emergencyCallout || false);

  // Contact State
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsappNumber || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [instagramUrl, setInstagramUrl] = useState(initialData?.instagramUrl || "");
  const [facebookUrl, setFacebookUrl] = useState(initialData?.facebookUrl || "");

  // Verification & Trust KYB / KYC State
  const [idCardNumber, setIdCardNumber] = useState(initialData?.idCardNumber || "");
  const [idCardPhotoUrl, setIdCardPhotoUrl] = useState(initialData?.idCardPhotoUrl || "");
  const [tradeAssociation, setTradeAssociation] = useState(initialData?.tradeAssociation || "");
  const [businessCertUrl, setBusinessCertUrl] = useState(initialData?.businessCertUrl || "");
  const [tinNumber, setTinNumber] = useState(initialData?.tinNumber || "");
  const [storefrontPhotoUrl, setStorefrontPhotoUrl] = useState(initialData?.storefrontPhotoUrl || "");

  const presetZones = [
    "Sakasaka",
    "Choggu",
    "Aboabo",
    "Nyohini",
    "Dungu",
    "Tamale Central",
    "Lamashegu",
    "Vittin",
    "Gumani",
    "Kalpohin",
    "Datoyili",
  ];

  // Image Upload helper
  const handleFileUpload = async (file: File, setter: (url: string) => void, loadingSetter: (l: boolean) => void) => {
    loadingSetter(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to upload image.");
      setter(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingSetter(false);
    }
  };

  // Handle GPS Auto-detect
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError("Unable to retrieve GPS coordinates. You can enter them manually.");
      }
    );
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!businessName.trim()) {
        setError("Please enter your official Business / Enterprise name.");
        return;
      }
    } else if (step === 2) {
      if (!zone.trim()) {
        setError("Please specify your operating neighborhood/zone.");
        return;
      }
    } else if (step === 3) {
      if (!phone.trim() || !whatsappNumber.trim()) {
        setError("Phone number and WhatsApp business number are required for direct customer leads.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        businessName,
        slug,
        tagline,
        description,
        businessType,
        logoUrl,
        bannerUrl,
        zone,
        addressDetails,
        landmark,
        latitude,
        longitude,
        phone,
        whatsappNumber,
        email,
        businessHours: {
          emergencyCallout,
          monday: { open: "08:00", close: "18:00", closed: false },
          tuesday: { open: "08:00", close: "18:00", closed: false },
          wednesday: { open: "08:00", close: "18:00", closed: false },
          thursday: { open: "08:00", close: "18:00", closed: false },
          friday: { open: "08:00", close: "18:00", closed: false },
          saturday: { open: "08:00", close: "16:00", closed: false },
          sunday: { open: "10:00", close: "15:00", closed: true },
        },
        idCardNumber,
        idCardPhotoUrl,
        businessCertUrl,
        tinNumber,
        tradeAssociation,
        storefrontPhotoUrl,
        instagramUrl,
        facebookUrl,
      };

      const res = await fetch("/api/business/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save business onboarding profile.");

      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-10 shadow-xl relative overflow-hidden">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Servora Enterprise Onboarding
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-stone-900 dark:text-white">
            Register Your Merchant & Artisan Storefront
          </h2>
          <p className="text-xs lg:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Build your public digital portal (`servora.gh/biz/@handle`), configure direct WhatsApp lead dispatch, and verify trust credentials.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === i
                  ? "bg-emerald-600 text-white shadow-md scale-110"
                  : step > i
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-400"
              }`}
            >
              {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Enterprise Profile Setup */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-stone-900 dark:text-white font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
            <Building2 className="w-5 h-5 text-emerald-600" /> Step 1: Enterprise Profile & Identity
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Official Business / Enterprise Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }
                }}
                placeholder="e.g. Sakasaka Precision Engineering & Tools"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Custom Storefront Slug / Handle (`@handle`)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs text-stone-400 font-mono">servora.gh/biz/@</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="sakasaka-eng"
                  className="w-full pl-36 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-mono text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Business Classification / Model *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="SOLO_ARTISAN">Solo Artisan / Master Craftsman</option>
                <option value="RETAIL_STORE">Retail Store & Supplies Hub</option>
                <option value="EQUIPMENT_RENTAL_HUB">Tool & Heavy Machinery Rental Hub</option>
                <option value="CONTRACTOR_WORKSHOP">Contractor Workshop & Fabrication</option>
                <option value="WHOLESALE_SUPPLIER">Wholesale Building & Hardware Supplier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Certified Heavy Tool Rentals & Metal Fabrication"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Business Overview & Services Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your expertise, workshop capabilities, equipment fleet, turn-around times, and customer guarantees..."
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Logo & Banner Image File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Business Logo / Avatar Image
              </label>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-stone-300" />
                )}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-emerald-500 transition-all">
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4 text-emerald-600" />}
                  <span>{uploadingLogo ? "Uploading..." : logoUrl ? "Change Logo Image" : "Upload Logo Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setLogoUrl, setUploadingLogo);
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Storefront Banner Header Image
              </label>
              <div className="flex items-center gap-3">
                {bannerUrl && (
                  <img src={bannerUrl} alt="Banner preview" className="w-16 h-12 rounded-xl object-cover border border-stone-300" />
                )}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-emerald-500 transition-all">
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4 text-emerald-600" />}
                  <span>{uploadingBanner ? "Uploading..." : bannerUrl ? "Change Banner Image" : "Upload Banner Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setBannerUrl, setUploadingBanner);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Multi-location & Custom Zone Typing */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-3 text-stone-900 dark:text-white font-bold text-lg">
              <MapPin className="w-5 h-5 text-emerald-600" /> Step 2: Workshop Location & Custom Neighborhood
            </div>
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
              {isLocating ? "Detecting GPS..." : "Pin Live GPS Position"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Target Service Neighborhood / Zone (Type freely or select a preset) *
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Sakasaka, Choggu, Aboabo, or type custom neighborhood..."
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Quick Presets:</span>
                {presetZones.map((pz) => (
                  <button
                    key={pz}
                    type="button"
                    onClick={() => setZone(pz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      zone === pz
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    {pz}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Landmark / Nearby Reference
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Shell Filling Station, Sakasaka Traffic Light"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Physical Street Address / Workshop Box
                </label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="e.g. Plot 42, Hospital Road, Sakasaka"
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Latitude Coordinate
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="9.407500"
                    className="w-full px-3 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    Longitude Coordinate
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-0.853200"
                    className="w-full px-3 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">Emergency Callout Availability</h4>
                  <p className="text-[11px] text-stone-500">Enable 24/7 emergency dispatch badge for high-priority community calls.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emergencyCallout}
                onChange={(e) => setEmergencyCallout(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Contact Channels & Lead Dispatch */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-stone-900 dark:text-white font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
            <PhoneCall className="w-5 h-5 text-emerald-600" /> Step 3: Contact Channels & Lead Dispatch
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Official Business Phone Dispatch *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 24 123 4567"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                WhatsApp Business Direct Routing Number *
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+233 24 123 4567"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Customers on your storefront will click "Chat on WhatsApp" with prefilled context.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Official Business Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@sakasakaengineering.com"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/sakasaka_crafts"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Trust & Verification File Uploads */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-stone-900 dark:text-white font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Step 4: Trust Tiering & Enterprise Verification (KYB/KYC)
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
            <span className="font-bold block">Verification Tier System:</span>
            <p>• <strong>Tier 1 (Phone & WhatsApp Verified):</strong> Auto-granted upon completing setup.</p>
            <p>• <strong>Tier 2 (Artisan Verified):</strong> Upload Ghana Card & Trade Association Badge.</p>
            <p>• <strong>Tier 3 (Registered Enterprise):</strong> Upload RGD/ORC Business Cert, TIN, or Storefront Photo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Ghana Card / National ID Number
              </label>
              <input
                type="text"
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                placeholder="GHA-000000000-0"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none mb-2"
              />
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-emerald-500">
                {uploadingId ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4 text-emerald-600" />}
                <span>{uploadingId ? "Uploading..." : idCardPhotoUrl ? "Change ID Photo" : "Upload Ghana Card Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setIdCardPhotoUrl, setUploadingId);
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Trade Association Membership (Optional)
              </label>
              <input
                type="text"
                value={tradeAssociation}
                onChange={(e) => setTradeAssociation(e.target.value)}
                placeholder="e.g. Ghana National Garages Association, Northern Printers Guild"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Business Registration Cert (RGD/ORC) File
              </label>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-emerald-500">
                {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4 text-emerald-600" />}
                <span>{uploadingCert ? "Uploading..." : businessCertUrl ? "Change Cert Document" : "Upload Business Cert Document"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setBusinessCertUrl, setUploadingCert);
                  }}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Physical Storefront Photo with GPS Metadata
              </label>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-dashed border-stone-300 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-emerald-500">
                {uploadingStorefront ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Upload className="w-4 h-4 text-emerald-600" />}
                <span>{uploadingStorefront ? "Uploading..." : storefrontPhotoUrl ? "Change Storefront Photo" : "Upload Workshop Storefront Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], setStorefrontPhotoUrl, setUploadingStorefront);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-stone-100 dark:border-stone-800 mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            Continue to Step {step + 1} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            {saving ? "Publishing Storefront Profile..." : "Complete & Launch Enterprise Portal"} <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
