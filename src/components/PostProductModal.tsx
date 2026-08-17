"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle, AlertCircle, ShoppingBag, Tag } from "lucide-react";

interface PostProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editProduct?: any; // When editing existing product
}

export function PostProductModal({ isOpen, onClose, onSuccess, editProduct }: PostProductModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [category, setCategory] = useState("Electronics");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setTitle(editProduct.title || "");
      setDescription(editProduct.description || "");
      setPrice(editProduct.price ? String(editProduct.price) : "");
      setOriginalPrice(editProduct.originalPrice ? String(editProduct.originalPrice) : "");
      setStockQuantity(editProduct.stockQuantity !== undefined ? String(editProduct.stockQuantity) : "10");
      setCategory(editProduct.category || "Electronics");
      try {
        const imgs = JSON.parse(editProduct.images || "[]");
        setImageUrl(imgs[0] || "");
      } catch {
        setImageUrl("");
      }
    } else {
      setTitle("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setStockQuantity("10");
      setCategory("Electronics");
      setImageUrl("");
    }
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isEdit = Boolean(editProduct && editProduct.slug);
      const url = isEdit ? `/api/products/${editProduct.slug}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          originalPrice: originalPrice ? Number(originalPrice) : null,
          stockQuantity: Number(stockQuantity) || 1,
          category,
          images: imageUrl ? [imageUrl] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                {editProduct ? "Edit Marketplace Product & Discount" : "Add New Marketplace Product"}
              </h3>
              <p className="text-[11px] text-stone-400">Amazon/Shopify Seller Inventory Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-lg text-stone-900 dark:text-white mb-2">
              {editProduct ? "Product Updated Successfully!" : "Product Listed Successfully!"}
            </h4>
            <p className="text-xs text-stone-500 mb-4">Changes are live in your store & marketplace search catalog.</p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Product Title / Item Name
              </label>
              <input
                type="text"
                placeholder="e.g. Original Samsung A54 AMOLED Screen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Sale Price (GH₵)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 280"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-bold text-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Regular Price (GH₵)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-semibold text-stone-400 line-through"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-bold"
                  required
                />
              </div>
            </div>

            {/* Discount Preview Badge */}
            {originalPrice && price && Number(originalPrice) > Number(price) && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1 font-bold">
                  <Tag className="w-3.5 h-3.5" /> Discount Active!
                </span>
                <span className="font-black">
                  SAVE GH₵ {(Number(originalPrice) - Number(price)).toFixed(2)} (
                  {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF)
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none font-semibold"
              >
                <option value="Electronics">Electronics & Tech</option>
                <option value="Electrical Supplies">Electrical Supplies</option>
                <option value="Fashion & Fugu">Fashion & Northern Fugu</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Tools & Hardware">Tools & Hardware</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Item Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe condition, specifications, and availability in Tamale..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Upload Product Photo (WebP Auto-Compress)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="https://... or choose photo below"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none"
                />
                <label className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer shrink-0 flex items-center gap-1.5 text-xs">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLoading(true);
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) setImageUrl(data.url);
                      } catch (err) {
                        alert("Image upload failed.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 font-semibold hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
              >
                {loading ? "Saving..." : editProduct ? "Save Product Changes" : "Post Product for Sale"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
