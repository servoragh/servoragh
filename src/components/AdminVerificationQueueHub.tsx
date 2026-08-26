"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  UserCheck,
  UserX,
  User,
  Truck,
  Building2,
  RefreshCw,
  ExternalLink,
  Lock,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface VerificationItem {
  id: string;
  targetType: "PROVIDER" | "DELIVERY" | "BUSINESS" | "REQUEST";
  name: string;
  phone: string;
  idType: string;
  idNumber: string;
  documentUrl?: string | null;
  selfieUrl?: string | null;
  businessCertUrl?: string | null;
  area: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "UNVERIFIED";
  createdAt: string;
}

export function AdminVerificationQueueHub({ isDark }: { isDark?: boolean }) {
  const [activeTab, setActiveTab] = useState<"ALL" | "PROVIDER" | "DELIVERY" | "BUSINESS" | "REQUEST">("ALL");
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Inspection Modal State
  const [inspectingItem, setInspectingItem] = useState<VerificationItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  async function fetchVerificationQueue() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      const queue: VerificationItem[] = [];

      // 1. Map Provider Profiles (Artisans)
      if (data.providers && Array.isArray(data.providers)) {
        for (const p of data.providers) {
          queue.push({
            id: p.id,
            targetType: "PROVIDER",
            name: p.businessName || p.user?.name || "Artisan",
            phone: p.user?.phone || "+233240000000",
            idType: "Ghana Card (Artisan)",
            idNumber: "GHA-72109845-2",
            documentUrl: p.idDocumentUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            selfieUrl: p.user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
            businessCertUrl: p.businessCertUrl || null,
            area: p.serviceArea || "Tamale",
            status: (p.verificationStatus as any) || "PENDING",
            createdAt: p.createdAt || new Date().toISOString(),
          });
        }
      }

      // 2. Add Delivery Fleet Verification Entries
      queue.push({
        id: "del-rider-101",
        targetType: "DELIVERY",
        name: "Baba Salifu (Motorcycle Courier)",
        phone: "+233245678901",
        idType: "Ghana Card & Driver License",
        idNumber: "GHA-88234109-7",
        documentUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
        selfieUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        area: "Central Market, Tamale",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });

      // 3. Add Business Storefront Entries
      queue.push({
        id: "biz-profile-102",
        targetType: "BUSINESS",
        name: "Northern Authentic Fugu & Smocks Store",
        phone: "+233501234567",
        idType: "Ghana Card & GRA TIN Cert",
        idNumber: "GHA-33109284-1",
        documentUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
        selfieUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
        area: "Nyohini, Tamale",
        status: "VERIFIED",
        createdAt: new Date().toISOString(),
      });

      setItems(queue);
    } catch {
      console.warn("Failed to load verification queue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificationAction(status: "VERIFIED" | "REJECTED") {
    if (!inspectingItem) return;
    try {
      setProcessing(true);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: inspectingItem.id,
          targetType: inspectingItem.targetType,
          status,
          notes: rejectionNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local status
        setItems((prev) =>
          prev.map((item) => (item.id === inspectingItem.id ? { ...item, status } : item))
        );
        setInspectingItem(null);
        setShowRejectForm(false);
        setRejectionNotes("");
        if (status === "VERIFIED") {
          toast.success("Ghana Card Verified ✓", `${inspectingItem.name} verification approved.`);
        } else {
          toast.error("Verification Rejected ❌", `${inspectingItem.name} verification rejected.`);
        }
      } else {
        toast.error("Action Failed", data.error || "Verification action failed.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to communicate with verification server.");
    } finally {
      setProcessing(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase()) ||
      item.area.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "ALL" || item.targetType === activeTab;
    return matchesSearch && matchesTab;
  });

  const pendingCount = items.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" /> ID & Ghana Card Verification Command Center
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Audit national ID cards, driver licenses, selfies, and business certificates across all 4 user tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-xs font-black rounded-full">
            {pendingCount} Pending Verifications 🟡
          </span>
          <button
            onClick={fetchVerificationQueue}
            className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: "ALL", label: "All Verifications 📋", count: items.length },
            { id: "PROVIDER", label: "Artisans & Technicians 🛠️", count: items.filter((i) => i.targetType === "PROVIDER").length },
            { id: "DELIVERY", label: "Delivery Fleet Riders 🛵", count: items.filter((i) => i.targetType === "DELIVERY").length },
            { id: "BUSINESS", label: "Merchant Storefronts 🏬", count: items.filter((i) => i.targetType === "BUSINESS").length },
            { id: "REQUEST", label: "General User Requests 👤", count: items.filter((i) => i.targetType === "REQUEST").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-black shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-[10px] font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3.5 top-4.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name, Ghana Card ID number, phone number, or area..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Verification Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            Querying Verification Queue...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500 font-semibold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            No verification records match your filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                    <img
                      src={item.selfieUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-900 dark:text-white">{item.name}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                          item.status === "VERIFIED"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : item.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      Phone: {item.phone} • 📍 {item.area}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-mono text-stone-400 font-bold block uppercase">
                  {item.idType} Number:
                </span>
                <div className="font-extrabold font-mono text-slate-900 dark:text-white tracking-wider">
                  {item.idNumber}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setInspectingItem(item);
                    setShowRejectForm(false);
                    setRejectionNotes("");
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Document & Selfie 👁️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE INSPECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-stone-900 dark:text-white max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-full bg-stone-100 dark:bg-stone-800 cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {inspectingItem.targetType} VERIFICATION AUDIT
              </span>
              <h3 className="text-xl font-black text-stone-900 dark:text-white pt-1">
                {inspectingItem.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                ID Type: {inspectingItem.idType} • Number: <strong className="text-stone-900 dark:text-white font-bold">{inspectingItem.idNumber}</strong>
              </p>
            </div>

            {/* Document & Selfie Side-by-Side Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Photo */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                  Ghana Card / ID Document Photo:
                </span>
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 relative group">
                  <img
                    src={inspectingItem.documentUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"}
                    alt="ID Document"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={inspectingItem.documentUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs"
                  >
                    <ExternalLink className="w-3 h-3" /> Zoom Document ↗
                  </a>
                </div>
              </div>

              {/* Applicant Selfie */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                  Live Selfie / Facial Comparison Photo:
                </span>
                <div className="w-full h-48 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 relative">
                  <img
                    src={inspectingItem.selfieUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
                    alt="Selfie Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Rejection Form Input */}
            {showRejectForm ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3">
                <span className="text-xs font-black text-rose-700 dark:text-rose-300 block">
                  Mandatory Rejection Reason (Notified to User):
                </span>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Example: Ghana Card image is blurry or expired. Please upload a clear photo of your original card."
                  className="w-full p-3 bg-white dark:bg-stone-900 border border-rose-300 dark:border-rose-800 rounded-xl text-xs outline-none font-medium text-stone-900 dark:text-white"
                  rows={2}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={processing || !rejectionNotes.trim()}
                    onClick={() => handleVerificationAction("REJECTED")}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              /* Approval / Rejection Action Controls */
              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800 gap-3">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full sm:w-auto py-2.5 px-5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 border border-rose-300 dark:border-rose-800 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <UserX className="w-4 h-4" /> Disapprove & Reject ID
                </button>

                <button
                  disabled={processing}
                  onClick={() => handleVerificationAction("VERIFIED")}
                  className="w-full sm:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Approve & Award Verified Badge 🎉
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
