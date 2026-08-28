"use client";

import React, { useState } from "react";
import {
  Package,
  Wrench,
  PlusCircle,
  Search,
  Tag,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Clock,
  ShieldAlert,
  Layers,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Video,
  Play,
  Film,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { formatGHS } from "@/lib/utils";

interface BusinessCatalogManagerProps {
  products: any[];
  rentals: any[];
  services: any[];
  onRefresh: () => void;
}

export function BusinessCatalogManager({
  products,
  rentals,
  services,
  onRefresh,
}: BusinessCatalogManagerProps) {
  const [activeCatalogTab, setActiveCatalogTab] = useState<"products" | "rentals" | "services">("products");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingType, setAddingType] = useState<"product" | "rental" | "service">("product");

  // Active photo index for each card preview
  const [cardImageIndex, setCardImageIndex] = useState<Record<string, number>>({});

  // Full-Screen Image Lightbox & Zoom (Unified for Products, Rentals, Services)
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

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox.isOpen) {
          setLightbox((prev) => ({ ...prev, isOpen: false }));
        } else if (editingItem) {
          setEditingItem(null);
        } else if (isAddModalOpen) {
          setIsAddModalOpen(false);
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
  }, [lightbox, isAddModalOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !lightbox.isOpen || lightbox.images.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      // Swiped Left -> Go Next
      setLightbox((prev) => ({
        ...prev,
        activeIndex: prev.activeIndex < prev.images.length - 1 ? prev.activeIndex + 1 : 0,
        isZoomed: false,
      }));
    } else if (diff < -45) {
      // Swiped Right -> Go Prev
      setLightbox((prev) => ({
        ...prev,
        activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.images.length - 1,
        isZoomed: false,
      }));
    }
    setTouchStartX(null);
  };

  // Quick Price / Stock Modal
  const [editingItem, setEditingItem] = useState<any>(null);
  const [quickPrice, setQuickPrice] = useState("");
  const [quickOriginalPrice, setQuickOriginalPrice] = useState("");
  const [quickStockQuantity, setQuickStockQuantity] = useState("");
  const [quickInventoryStatus, setQuickInventoryStatus] = useState("IN_STOCK");
  const [quickUpdating, setQuickUpdating] = useState(false);

  // Form State for New Item Creation
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Electronics");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("5");
  const [formSku, setFormSku] = useState("");

  // Multi-Image & Video Upload State (Up to 10 images per product + short video)
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formDailyRate, setFormDailyRate] = useState("");
  const [formWeeklyRate, setFormWeeklyRate] = useState("");
  const [formSecurityDeposit, setFormSecurityDeposit] = useState("");
  const [formOperatorIncluded, setFormOperatorIncluded] = useState(false);
  const [formDuration, setFormDuration] = useState("2-4 hours");
  const [savingItem, setSavingItem] = useState(false);

  const categoryPresets = [
    "Agribusiness & Farm",
    "Electrical & Solar",
    "Phones & Tech",
    "Electronics & Appliances",
    "Fugu & Tailoring",
    "Artisan Services",
    "Tool & Heavy Rentals",
    "Hardware & Tools",
    "Building Materials",
    "Carpentry & Woodwork",
    "Welding & Metal",
    "Auto Parts & Mechanics",
    "Generators & Power",
    "Property & Land Sites",
    "Jobs & Gigs",
    "Food & Agro-Goods",
    "Health & Cosmetics",
  ];

  const handleOpenAddModal = (type: "product" | "rental" | "service") => {
    setAddingType(type);
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("5");
    setFormSku("");
    setFormImages([]);
    setFormVideoUrl("");
    setFormDailyRate("");
    setFormWeeklyRate("");
    setFormSecurityDeposit("");
    setFormOperatorIncluded(false);
    setFormDuration("2-4 hours");
    setIsAddModalOpen(true);
  };

  // Image Upload Handler (Up to 10 images)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formImages.length + files.length > 10) {
      alert("You can upload a maximum of 10 images per product.");
    }

    const availableSlots = 10 - formImages.length;
    const filesToUpload = files.slice(0, availableSlots);

    setUploadingImage(true);
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || "Failed to upload image.");
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormImages((prev) => [...prev, ...uploadedUrls].slice(0, 10));
    } catch (err: any) {
      alert(err.message || "Failed to upload product images.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Video Upload Handler with 30-Second Limit
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      alert("Video file size is too large. Please select a clip under 40MB.");
      return;
    }

    // Verify video duration is <= 30 seconds
    const videoElem = document.createElement("video");
    videoElem.preload = "metadata";
    videoElem.src = URL.createObjectURL(file);

    videoElem.onloadedmetadata = async () => {
      URL.revokeObjectURL(videoElem.src);
      if (videoElem.duration > 32) {
        alert(
          `Video is ${Math.round(videoElem.duration)} seconds long. Servora product videos are limited to 30 seconds max to guarantee instant fast loading for customers.`
        );
        return;
      }

      setUploadingVideo(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || "Failed to upload video.");
        setFormVideoUrl(data.url);
      } catch (err: any) {
        alert(err.message || "Failed to upload video.");
      } finally {
        setUploadingVideo(false);
      }
    };
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      const payload: any = {
        itemType: addingType,
      };

      if (addingType === "product") {
        payload.title = formTitle;
        payload.description = formDescription;
        payload.category = formCategory;
        payload.price = formPrice;
        payload.originalPrice = formOriginalPrice;
        payload.stockQuantity = formStock;
        payload.sku = formSku;
        payload.images = formImages;
        payload.videoUrl = formVideoUrl || null;
      } else if (addingType === "rental") {
        payload.title = formTitle;
        payload.description = formDescription;
        payload.category = formCategory || "Heavy Machinery";
        payload.dailyRate = formDailyRate;
        payload.weeklyRate = formWeeklyRate;
        payload.securityDeposit = formSecurityDeposit;
        payload.operatorIncluded = formOperatorIncluded;
        payload.images = formImages;
        payload.videoUrl = formVideoUrl || null;
      } else if (addingType === "service") {
        payload.serviceName = formTitle;
        payload.description = formDescription;
        payload.startingPrice = formPrice;
        payload.estimatedDuration = formDuration;
        payload.portfolioPhotos = formImages;
      }

      const res = await fetch("/api/business/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add item.");

      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingItem(false);
    }
  };

  const handleQuickUpdateSave = async () => {
    if (!editingItem) return;
    setQuickUpdating(true);
    try {
      const payload: any = {
        itemType: editingItem.type,
      };

      if (editingItem.type === "product") {
        payload.price = quickPrice;
        payload.originalPrice = quickOriginalPrice;
        payload.stockQuantity = quickStockQuantity;
        payload.inventoryStatus = quickInventoryStatus;
      } else if (editingItem.type === "rental") {
        payload.dailyRate = quickPrice;
        payload.inventoryStatus = quickInventoryStatus;
      } else if (editingItem.type === "service") {
        payload.price = quickPrice;
      }

      const res = await fetch(`/api/business/catalogs/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update item.");

      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuickUpdating(false);
    }
  };

  const handleDeleteItem = async (id: string, itemType: "product" | "rental" | "service") => {
    if (!confirm("Are you sure you want to delete this catalog item?")) return;
    try {
      const res = await fetch(`/api/business/catalogs/${id}?itemType=${itemType}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredRentals = rentals.filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredServices = services.filter((s) => s.serviceName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Header & Add Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">Storefront & Catalog Management</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage inventory for retail products, heavy equipment rentals, and service portfolio listings with up to 5 uploaded product images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAddModal("product")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Add Product
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal("rental")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
          >
            <Wrench className="w-4 h-4" /> Add Equipment Rental
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal("service")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <Layers className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Catalog Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveCatalogTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCatalogTab === "products"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("rentals")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCatalogTab === "rentals"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Tool & Equipment Rentals ({rentals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalogTab("services")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCatalogTab === "services"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Services Portfolio ({services.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* PRODUCTS TAB GRID */}
      {activeCatalogTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
            const discountPct = hasDiscount
              ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
              : 0;

            const productImages: string[] = Array.isArray(product.images)
              ? product.images
              : typeof product.images === "string"
              ? (() => {
                  try {
                    return JSON.parse(product.images);
                  } catch {
                    return product.images ? [product.images] : [];
                  }
                })()
              : [];

            const activeIdx = cardImageIndex[product.id] || 0;
            const currentImg = productImages[activeIdx] || productImages[0];

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    onClick={() => openLightbox(product.title, productImages, activeIdx)}
                    className="cursor-zoom-in group/img relative aspect-video w-full rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3 border border-stone-200 dark:border-stone-700"
                  >
                    {currentImg ? (
                      <img
                        src={currentImg}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Package className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    {currentImg && (
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-all flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 bg-black/80 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow">
                          <Maximize2 className="w-3 h-3" /> View Full Size
                        </span>
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow">
                        -{discountPct}% OFF
                      </span>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        product.inventoryStatus === "SOLD_OUT"
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300"
                          : product.inventoryStatus === "LOW_STOCK"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                      }`}
                    >
                      {product.inventoryStatus || "IN_STOCK"} ({product.stockQuantity || 0})
                    </span>
                  </div>

                  {/* Thumbnail Row: clickable to switch card photo or open lightbox */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                      {productImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCardImageIndex((prev) => ({ ...prev, [product.id]: idx }))}
                          onDoubleClick={() => openLightbox(product.title, productImages, idx)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            activeIdx === idx
                              ? "border-emerald-600 scale-105 shadow-sm"
                              : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openLightbox(product.title, productImages, activeIdx)}
                        className="text-[10px] font-bold text-emerald-600 ml-1 shrink-0 hover:underline"
                      >
                        {productImages.length} photos 🔍
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                    {product.category}
                  </span>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white mt-1 line-clamp-1">
                    {product.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{product.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {formatGHS(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-stone-400 line-through ml-2">
                        {formatGHS(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ ...product, type: "product" });
                        setQuickPrice(String(product.price));
                        setQuickOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
                        setQuickStockQuantity(String(product.stockQuantity || 1));
                        setQuickInventoryStatus(product.inventoryStatus || "IN_STOCK");
                      }}
                      className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                      title="Quick Price & Stock Update"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(product.id, "product")}
                      className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-stone-400 text-xs">
              No products found in your catalog. Click "Add Product" above to upload photos and list items for sale.
            </div>
          )}
        </div>
      )}

      {/* RENTALS TAB GRID */}
      {activeCatalogTab === "rentals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => {
            const rentalImages: string[] = Array.isArray(rental.images)
              ? rental.images
              : typeof rental.images === "string"
              ? (() => {
                  try {
                    return JSON.parse(rental.images);
                  } catch {
                    return rental.images ? [rental.images] : [];
                  }
                })()
              : [];

            const activeIdx = cardImageIndex[rental.id] || 0;
            const currentImg = rentalImages[activeIdx] || rentalImages[0];

            return (
              <div
                key={rental.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    onClick={() => openLightbox(rental.title, rentalImages, activeIdx)}
                    className="cursor-zoom-in group/img relative aspect-video w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden mb-3 border border-amber-200 dark:border-amber-800/40"
                  >
                    {currentImg ? (
                      <img
                        src={currentImg}
                        alt={rental.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-500">
                        <Wrench className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    {currentImg && (
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-all flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 bg-black/80 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow">
                          <Maximize2 className="w-3 h-3" /> View Full Size
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        rental.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {rental.status || "AVAILABLE"}
                    </span>
                  </div>

                  {rentalImages.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                      {rentalImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCardImageIndex((prev) => ({ ...prev, [rental.id]: idx }))}
                          onDoubleClick={() => openLightbox(rental.title, rentalImages, idx)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            activeIdx === idx
                              ? "border-amber-600 scale-105 shadow-sm"
                              : "border-amber-200 dark:border-amber-800/60 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${rental.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openLightbox(rental.title, rentalImages, activeIdx)}
                        className="text-[10px] font-bold text-amber-600 ml-1 shrink-0 hover:underline"
                      >
                        {rentalImages.length} photos 🔍
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                    {rental.category}
                  </span>
                  <h4 className="text-base font-bold text-stone-900 dark:text-white mt-1 line-clamp-1">
                    {rental.title}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">{rental.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">
                      {formatGHS(rental.dailyRate)} / day
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(rental.id, "rental")}
                    className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredRentals.length === 0 && (
            <div className="col-span-full py-16 text-center text-stone-400 text-xs">
              No equipment rentals listed. Click "Add Equipment Rental" above to add tools or heavy machinery.
            </div>
          )}
        </div>
      )}

      {/* SERVICES TAB GRID */}
      {activeCatalogTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const sPhotos: string[] = Array.isArray(service.portfolioPhotos)
              ? service.portfolioPhotos
              : typeof service.portfolioPhotos === "string"
              ? (() => {
                  try {
                    return JSON.parse(service.portfolioPhotos);
                  } catch {
                    return service.portfolioPhotos ? [service.portfolioPhotos] : [];
                  }
                })()
              : [];

            const activeIdx = cardImageIndex[service.id] || 0;
            const currentImg = sPhotos[activeIdx] || sPhotos[0];

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Service Portfolio Image Banner */}
                  {currentImg && (
                    <div
                      onClick={() => openLightbox(service.serviceName, sPhotos, activeIdx)}
                      className="cursor-zoom-in group/img aspect-video w-full rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3.5 relative border border-stone-200 dark:border-stone-700"
                    >
                      <img
                        src={currentImg}
                        alt={service.serviceName}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-all flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity px-2.5 py-1 bg-black/80 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow">
                          <Maximize2 className="w-3 h-3" /> View Full Size
                        </span>
                      </div>
                      {sPhotos.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {sPhotos.length} Photos
                        </span>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Row */}
                  {sPhotos.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                      {sPhotos.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCardImageIndex((prev) => ({ ...prev, [service.id]: idx }))}
                          onDoubleClick={() => openLightbox(service.serviceName, sPhotos, idx)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            activeIdx === idx
                              ? "border-blue-600 scale-105 shadow-sm"
                              : "border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${service.serviceName} photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openLightbox(service.serviceName, sPhotos, activeIdx)}
                        className="text-[10px] font-bold text-blue-600 ml-1 shrink-0 hover:underline"
                      >
                        {sPhotos.length} photos 🔍
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold">
                      Active Service Menu
                    </span>
                    {service.estimatedDuration && (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.estimatedDuration}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-stone-900 dark:text-white line-clamp-1">
                    {service.serviceName}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-3 mt-2">{service.description}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block">Starting Rate</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">
                      {service.startingPrice ? formatGHS(service.startingPrice) : "On Quote Request"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(service.id, "service")}
                    className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                    title="Delete service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredServices.length === 0 && (
            <div className="col-span-full py-16 text-center text-stone-400 text-xs">
              No custom services listed. Click "Add Service" above to build your service menu.
            </div>
          )}
        </div>
      )}

      {/* QUICK PRICE & STOCK EDIT MODAL */}
      {editingItem && (
        <div
          onClick={() => setEditingItem(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white text-base">Quick Catalog Update</h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Price (GHS)</label>
              <input
                type="number"
                value={quickPrice}
                onChange={(e) => setQuickPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-white"
              />
            </div>

            {editingItem.type === "product" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Original Price / Compare-At (GHS)
                  </label>
                  <input
                    type="number"
                    value={quickOriginalPrice}
                    onChange={(e) => setQuickOriginalPrice(e.target.value)}
                    placeholder="Leave empty if no discount"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={quickStockQuantity}
                    onChange={(e) => setQuickStockQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Inventory Status</label>
                  <select
                    value={quickInventoryStatus}
                    onChange={(e) => setQuickInventoryStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                  >
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="RENTED_OUT">RENTED_OUT</option>
                    <option value="SOLD_OUT">SOLD_OUT</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-bold text-stone-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickUpdateSave}
                disabled={quickUpdating}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                {quickUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CATALOG ITEM MODAL WITH MULTI-IMAGE UPLOADER & CUSTOM CATEGORY */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateItem}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white text-lg capitalize">
                Add New {addingType} Item
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Item Title *</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Bosch Professional Hammer Drill"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Item specifications, model number, warranty guarantee..."
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
              />
            </div>

            {addingType === "product" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Selling Price (GHS) *</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="150"
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Original Price (Discount)</label>
                    <input
                      type="number"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="200"
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Category (Type custom or pick preset)</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Electronics, Solar, Gold Bars..."
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Preset Category Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Category Presets:</span>
                  {categoryPresets.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        formCategory === cat
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}

            {addingType === "rental" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Daily Rate (GHS) *</label>
                    <input
                      type="number"
                      required
                      value={formDailyRate}
                      onChange={(e) => setFormDailyRate(e.target.value)}
                      placeholder="250"
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Weekly Rate (GHS)</label>
                    <input
                      type="number"
                      value={formWeeklyRate}
                      onChange={(e) => setFormWeeklyRate(e.target.value)}
                      placeholder="1200"
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={formOperatorIncluded}
                    onChange={(e) => setFormOperatorIncluded(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Include Certified Equipment Operator
                  </label>
                </div>
              </>
            )}

            {/* MULTI-IMAGE UPLOADER (UP TO 10 IMAGES PER PRODUCT) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  {addingType === "service"
                    ? "Upload Service Portfolio / Work Photos (Up to 10 photos)"
                    : addingType === "rental"
                    ? "Upload Equipment Photos (Up to 10 photos)"
                    : "Upload Product Photos (Up to 10 photos)"}
                </label>
                <span className="text-[10px] font-bold text-emerald-600">
                  {formImages.length} / 10 uploaded
                </span>
              </div>

              {/* Upload Drop Zone / Button */}
              {formImages.length < 10 && (
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-800/80 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl transition-all text-center">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading photo files...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Click or drag photo files to upload
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        JPEG, PNG, WEBP (Up to 10 photos total)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImage}
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Image Previews Gallery Grid */}
              {formImages.length > 0 && (
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl bg-stone-100 overflow-hidden border border-stone-200">
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-all shadow"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SHORT PRODUCT VIDEO UPLOADER (MAX 30 SECONDS) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-600" />
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Product Demo Video (Max 30s)
                  </label>
                </div>
                <span className="text-[10px] font-bold text-purple-600">
                  {formVideoUrl ? "✓ 1 Video Attached" : "Optional (Boosts Sales)"}
                </span>
              </div>

              {formVideoUrl ? (
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-3">
                  <video
                    src={formVideoUrl}
                    controls
                    playsInline
                    className="w-full h-40 rounded-xl object-contain bg-black shadow-inner"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> 30-Second Clip Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormVideoUrl("")}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-800/80 border-2 border-dashed border-purple-200 dark:border-purple-800/60 hover:border-purple-500 rounded-2xl transition-all text-center">
                  {uploadingVideo ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading product video...
                    </div>
                  ) : (
                    <>
                      <Video className="w-6 h-6 text-purple-600 mb-1" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Upload short product demo video
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        MP4, WebM, MOV (Duration up to 30s)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    disabled={uploadingVideo}
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-stone-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingItem || uploadingImage || uploadingVideo}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {savingItem ? "Adding to Storefront..." : "Add to Catalog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FULL-SCREEN IMAGE LIGHTBOX & ZOOM / SWIPE VIEWER */}
      {lightbox.isOpen && lightbox.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm sm:text-base font-bold text-white max-w-xs sm:max-w-md truncate">
                {lightbox.title}
              </h3>
              <span className="px-2.5 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold">
                {lightbox.activeIndex + 1} / {lightbox.images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightbox((prev) => ({ ...prev, isZoomed: !prev.isZoomed }))}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-sm transition flex items-center gap-1.5 text-xs font-semibold"
                title="Toggle Zoom"
              >
                {lightbox.isZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4" /> Fit Screen
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" /> Zoom In
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
                className="p-2.5 bg-white/10 hover:bg-rose-600/80 text-white rounded-2xl backdrop-blur-sm transition"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage with Touch Swipe Handler */}
          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightbox((prev) => ({
                    ...prev,
                    activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.images.length - 1,
                    isZoomed: false,
                  }))
                }
                className="absolute left-2 sm:left-4 z-10 p-3 sm:p-4 bg-black/60 hover:bg-black/90 text-white rounded-2xl border border-white/10 transition shadow-2xl"
                title="Previous (Left Arrow / Swipe Right)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div
              className={`max-w-4xl max-h-[70vh] transition-transform duration-300 select-none ${
                lightbox.isZoomed ? "scale-150 cursor-grab" : "scale-100 cursor-zoom-in"
              }`}
              onClick={() => setLightbox((prev) => ({ ...prev, isZoomed: !prev.isZoomed }))}
            >
              <img
                src={lightbox.images[lightbox.activeIndex]}
                alt={`${lightbox.title} full photo`}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl mx-auto"
                draggable={false}
              />
            </div>

            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightbox((prev) => ({
                    ...prev,
                    activeIndex: prev.activeIndex < prev.images.length - 1 ? prev.activeIndex + 1 : 0,
                    isZoomed: false,
                  }))
                }
                className="absolute right-2 sm:right-4 z-10 p-3 sm:p-4 bg-black/60 hover:bg-black/90 text-white rounded-2xl border border-white/10 transition shadow-2xl"
                title="Next (Right Arrow / Swipe Left)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {lightbox.images.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightbox((prev) => ({ ...prev, activeIndex: idx, isZoomed: false }))}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    lightbox.activeIndex === idx
                      ? "border-emerald-500 scale-105 shadow-lg shadow-emerald-500/30"
                      : "border-white/20 opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
