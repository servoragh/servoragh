"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  Send,
  User,
  Tag,
  DollarSign,
  Share2,
} from "lucide-react";

interface AdminRequestModerationModalProps {
  request: any;
  onClose: () => void;
  onUpdate: () => void;
  isDark?: boolean;
}

export function AdminRequestModerationModal({
  request,
  onClose,
  onUpdate,
  isDark = false,
}: AdminRequestModerationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit form state
  const [title, setTitle] = useState(request.title || "");
  const [description, setDescription] = useState(request.description || "");
  const [customCategory, setCustomCategory] = useState(request.customCategory || request.service?.name || "General Service");
  const [urgency, setUrgency] = useState(request.urgency || "SAME_DAY");
  const [status, setStatus] = useState(request.status || "OPEN");
  const [landmark, setLandmark] = useState(request.landmark || "Tamale");
  const [budgetMin, setBudgetMin] = useState(request.budgetMin?.toString() || "");
  const [budgetMax, setBudgetMax] = useState(request.budgetMax?.toString() || "");

  const customerName = request.customer?.name || request.guestName || "Customer";
  const rawPhone = request.customer?.phone || request.guestPhone || "";
  const cleanPhone = rawPhone.replace(/\s+/g, "").replace(/^0/, "233").replace("+", "");

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${customerName}, this is Servora Admin regarding your service request "${request.title}". How can we assist you with your artisan quotes today?`
  )}`;

  async function handleStatusChange(newStatus: string) {
    if (!confirm(`Are you sure you want to change this request status to ${newStatus}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        setSuccessMsg(`Request status updated to ${newStatus}!`);
        setTimeout(() => setSuccessMsg(""), 3000);
        onUpdate();
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      alert("Error updating request status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          customCategory,
          urgency,
          status,
          landmark,
          budgetMin: budgetMin ? parseFloat(budgetMin) : null,
          budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        setSuccessMsg("Request details updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        onUpdate();
      } else {
        alert("Failed to save edits.");
      }
    } catch (e) {
      alert("Error saving edits.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this request from the platform? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Failed to delete request.");
      }
    } catch (e) {
      alert("Error deleting request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header Strip */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MODERATION SUITE
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {request.id}</span>
            </div>
            <h2 className="text-base font-black truncate max-w-md">{request.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-6 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Status and Actions Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Current Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  status === "OPEN" || status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20"
                    : status === "SUSPENDED" || status === "CANCELLED"
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-500/20"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-500/20"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {status === "OPEN" || status === "PUBLISHED" ? (
                <button
                  type="button"
                  onClick={() => handleStatusChange("SUSPENDED")}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Take Down / Suspend
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStatusChange("OPEN")}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Approve & Make Public
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Cancel Edit" : "Edit Details"}
              </button>
            </div>
          </div>

          {/* Customer & Direct Text / WhatsApp Tools */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  {customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 dark:text-white text-xs">{customerName}</h4>
                  <p className="text-[11px] text-stone-500 font-mono">{rawPhone || "No phone provided"}</p>
                </div>
              </div>

              {rawPhone && (
                <div className="flex items-center gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Customer
                  </a>
                  <a
                    href={`tel:${rawPhone}`}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Phone
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Content Body: Edit Mode OR View Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">Request Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Service Category</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Urgency Speed</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                  >
                    <option value="EMERGENCY_ASAP">🚨 Emergency (ASAP)</option>
                    <option value="SAME_DAY">Same Day</option>
                    <option value="SCHEDULED">Scheduled / Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">Problem Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Landmark / Zone</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs"
                  >
                    <option value="OPEN">OPEN (Public & Active)</option>
                    <option value="SUSPENDED">SUSPENDED (Taken Down)</option>
                    <option value="OFFER_ACCEPTED">OFFER_ACCEPTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-stone-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-stone-400 uppercase text-[10px] tracking-wider mb-1">Problem Description</h4>
                <p className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 leading-relaxed text-stone-800 dark:text-stone-200">
                  {request.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 block mb-0.5">Category</span>
                  <span className="font-bold text-stone-900 dark:text-white">{request.customCategory || request.service?.name || "General"}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 block mb-0.5">Urgency</span>
                  <span className="font-bold text-amber-600">{request.urgency || "SAME_DAY"}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[10px] font-bold text-stone-400 block mb-0.5">Location</span>
                  <span className="font-bold text-stone-900 dark:text-white">{request.landmark || request.location?.area || "Tamale"}</span>
                </div>
              </div>

              {/* GPS Pinpoint */}
              {request.latitude && request.longitude && (
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                      GPS: {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  >
                    Open Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Quotes Received */}
              <div>
                <h4 className="font-bold text-stone-400 uppercase text-[10px] tracking-wider mb-2">
                  Quotes Received ({request.quotes?.length || 0})
                </h4>
                {!request.quotes || request.quotes.length === 0 ? (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-stone-400 text-center text-[11px]">
                    No artisan quotes submitted yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {request.quotes.map((q: any) => (
                      <div key={q.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 dark:text-white">{q.provider?.name || "Artisan"}</span>
                          <span className="text-stone-400 ml-2 font-mono">({q.provider?.phone})</span>
                          <div className="text-[11px] text-stone-500 mt-0.5">{q.message}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-600 text-sm">GHS {q.price}</span>
                          <span className="block text-[9px] font-bold uppercase text-stone-400">{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-3.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
