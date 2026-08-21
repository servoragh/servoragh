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

  // Multi-Image Upload State (Up to 5 images per product)
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formDailyRate, setFormDailyRate] = useState("");
  const [formWeeklyRate, setFormWeeklyRate] = useState("");
  const [formSecurityDeposit, setFormSecurityDeposit] = useState("");
  const [formOperatorIncluded, setFormOperatorIncluded] = useState(false);
  const [formDuration, setFormDuration] = useState("2-4 hours");
  const [savingItem, setSavingItem] = useState(false);

  const categoryPresets = [
    "Electronics",
    "Hardware & Tools",
    "Carpentry & Woodwork",
    "Welding & Metal",
    "Solar & Electrical",
    "Fashion & Fugu",
    "Building Materials",
    "Auto Parts & Mechanics",
    "Generators & Power",
    "Heavy Equipment",
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
    setFormDailyRate("");
    setFormWeeklyRate("");
    setFormSecurityDeposit("");
    setFormOperatorIncluded(false);
    setFormDuration("2-4 hours");
    setIsAddModalOpen(true);
  };

  // Image Upload Handler (Up to 5 images)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formImages.length + files.length > 5) {
      alert("You can upload a maximum of 5 images per product.");
    }

    const availableSlots = 5 - formImages.length;
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
      setFormImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
    } catch (err: any) {
      alert(err.message || "Failed to upload product images.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
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
      } else if (addingType === "rental") {
        payload.title = formTitle;
        payload.description = formDescription;
        payload.category = formCategory || "Heavy Machinery";
        payload.dailyRate = formDailyRate;
        payload.weeklyRate = formWeeklyRate;
        payload.securityDeposit = formSecurityDeposit;
        payload.operatorIncluded = formOperatorIncluded;
        payload.images = formImages;
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

            const productImages: string[] = Array.isArray(product.images) ? product.images : [];

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3">
                    {productImages[0] ? (
                      <img src={productImages[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <Package className="w-8 h-8 opacity-40" />
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

                  {/* Thumbnail Row if product has multiple uploaded images */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                      {productImages.slice(0, 5).map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`${product.title} ${idx + 1}`}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                        />
                      ))}
                      <span className="text-[10px] font-bold text-stone-400 ml-1">
                        {productImages.length} images
                      </span>
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
            const rentalImages: string[] = Array.isArray(rental.images) ? rental.images : [];

            return (
              <div
                key={rental.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 overflow-hidden mb-3 border border-amber-200 dark:border-amber-800/40">
                    {rentalImages[0] ? (
                      <img src={rentalImages[0]} alt={rental.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-500">
                        <Wrench className="w-8 h-8 opacity-50" />
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
                      {rentalImages.slice(0, 5).map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`${rental.title} ${idx + 1}`}
                          className="w-9 h-9 rounded-lg object-cover border border-amber-200 shrink-0"
                        />
                      ))}
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
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
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
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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

            {/* MULTI-IMAGE UPLOADER (UP TO 5 IMAGES PER PRODUCT) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Upload Product Photos (Up to 5 images)
                </label>
                <span className="text-[10px] font-bold text-emerald-600">
                  {formImages.length} / 5 uploaded
                </span>
              </div>

              {/* Upload Drop Zone / Button */}
              {formImages.length < 5 && (
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-800/80 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl transition-all text-center">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading image files...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Click or drag photo files to upload
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        JPEG, PNG, WEBP (Max 5 images total)
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
                disabled={savingItem || uploadingImage}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20"
              >
                {savingItem ? "Adding to Storefront..." : "Add to Catalog"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
