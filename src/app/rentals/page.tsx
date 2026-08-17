"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  MapPin,
  PhoneCall,
  ShieldCheck,
  PlusCircle,
  Upload,
  X,
  MessageCircle,
  Filter,
  CheckCircle2,
  Tag,
  Zap,
} from "lucide-react";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { formatGHS, parseJsonArray } from "@/lib/utils";

const RENTAL_CATEGORIES = [
  { id: "ALL", label: "All Equipment 🚜" },
  { id: "Generators", label: "Generators ⚡" },
  { id: "Scaffolding & Ladders", label: "Scaffolding & Ladders 🪜" },
  { id: "Concrete & Masonry", label: "Concrete & Masonry 🏗️" },
  { id: "Welding & Power Tools", label: "Welding & Power Tools 🛠️" },
];

export default function ToolRentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Post Rental Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Generators");
  const [dailyRate, setDailyRate] = useState("");
  const [description, setDescription] = useState("");
  const [locationArea, setLocationArea] = useState("Sakasaka, Tamale");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [selectedCategory]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setSession(data.user);
    } catch {}
  }

  async function fetchRentals() {
    try {
      setLoading(true);
      const url = selectedCategory !== "ALL" ? `/api/rentals?category=${encodeURIComponent(selectedCategory)}` : "/api/rentals";
      const res = await fetch(url);
      const data = await res.json();
      if (data.rentals) setRentals(data.rentals);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Handle Photo Upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.url) setImages((prev) => [...prev, d.url]);
    } catch {
      alert("Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  // Submit Rental Equipment
  async function handleSubmitRental(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      alert("Please log in to list equipment for rent.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          dailyRate,
          description,
          locationArea,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to list equipment.");

      setIsModalOpen(false);
      setTitle("");
      setDailyRate("");
      setDescription("");
      setImages([]);
      fetchRentals();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border border-stone-800 rounded-3xl p-6 lg:p-8 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/80 text-amber-300 text-xs font-bold rounded-full mb-2 border border-amber-700">
              <Wrench className="w-3.5 h-3.5" /> Northern Marketplace Equipment Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tool & Heavy Equipment Rentals
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Rent generators, scaffolding frames, concrete mixers, arc welders, and power demolition tools directly from verified Northern businesses & artisans.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0 border border-amber-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Equipment for Rent</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl flex items-center gap-2 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-stone-200 dark:border-stone-800 font-bold text-stone-700 dark:text-stone-300">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter:
          </div>
          {RENTAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 border ${
                selectedCategory === cat.id
                  ? "bg-amber-600 border-amber-500 text-white shadow"
                  : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="text-center py-12 text-stone-500 font-semibold">Loading heavy rental equipment...</div>
        ) : rentals.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-12 rounded-3xl border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <Wrench className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-900 dark:text-white">No Equipment Listed in this Category</h3>
            <p className="text-stone-500">Be the first to list equipment or heavy tools for rent on the Northern Marketplace!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow"
            >
              List Equipment Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((r) => {
              const parsedImages = parseJsonArray(r.images);
              const phoneNum = r.provider?.user?.phone || "";

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Equipment Photo */}
                    {parsedImages.length > 0 ? (
                      <div className="h-40 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                        <img src={parsedImages[0]} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-32 w-full rounded-2xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-center text-amber-500 font-bold gap-2">
                        <Wrench className="w-6 h-6" />
                        <span>Heavy Equipment</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-300 dark:border-amber-800">
                        {r.category}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800">
                        AVAILABLE NOW
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 dark:text-white leading-snug">{r.title}</h3>

                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatGHS(r.dailyRate)} <span className="text-xs font-normal text-stone-500 dark:text-stone-400">/ day</span>
                    </div>

                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {r.description}
                    </p>

                    {/* Owner / Provider Business Card */}
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{r.provider?.businessName || "Verified Equipment Supplier"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{r.provider?.serviceArea || "Tamale & Northern Region"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Rent via WhatsApp & Direct Call */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                    <WhatsAppShareButton
                      variant="direct"
                      phone={phoneNum}
                      text={`Hello ${r.provider?.businessName || "Supplier"}, I want to rent your "${r.title}" (${formatGHS(r.dailyRate)}/day) listed on Servora Northern Marketplace.`}
                      label="Rent via WhatsApp"
                      className="flex-1 text-xs py-2.5"
                    />

                    {phoneNum && (
                      <a
                        href={`tel:${phoneNum}`}
                        className="p-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-900 dark:text-white rounded-xl border border-stone-200 dark:border-stone-700"
                        title="Direct Call"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-500" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Rental Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>List Heavy Equipment for Rent</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRental} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Equipment Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. 5.5KVA Silent Diesel Generator / 10 Scaffolding Frames"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Equipment Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold outline-none"
                  >
                    <option value="Generators">Generators ⚡</option>
                    <option value="Scaffolding & Ladders">Scaffolding & Ladders 🪜</option>
                    <option value="Concrete & Masonry">Concrete & Masonry 🏗️</option>
                    <option value="Welding & Power Tools">Welding & Power Tools 🛠️</option>
                    <option value="Water Pumps">Water Pumps 🚰</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Daily Rate (GH₵/day)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-emerald-400 font-black text-base outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Location / Service Area</label>
                <input
                  type="text"
                  placeholder="e.g. Sakasaka, Tamale / Delivered Region-wide"
                  value={locationArea}
                  onChange={(e) => setLocationArea(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Equipment Description & Condition</label>
                <textarea
                  rows={3}
                  placeholder="Describe specs, fuel capacity, voltage, deposit rules, delivery terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white outline-none"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-bold text-stone-300 mb-1">Equipment Photo (Optional)</label>
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-stone-800 border border-stone-700 hover:bg-stone-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>{uploadingImage ? "Uploading..." : "Add Photo"}</span>
                    <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </label>
                  {images.length > 0 && (
                    <span className="text-emerald-400 font-bold">{images.length} photo attached</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-stone-400 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow transition"
                >
                  {submitting ? "Listing..." : "List Equipment Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
