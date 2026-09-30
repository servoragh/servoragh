"use client";

import React, { useState } from "react";
import {
  X, MapPin, Clock, Phone, MessageCircle, ShieldAlert, ShieldCheck,
  CheckCircle2, Trash2, Edit3, ExternalLink, Save, User, Tag,
  DollarSign, FileText, Image as ImageIcon, Video, Eye, Star,
  Activity, Send, RefreshCw, AlertTriangle, Link2,
} from "lucide-react";

interface AdminRequestModerationModalProps {
  request: any;
  onClose: () => void;
  onUpdate: () => void;
  isDark?: boolean;
}

const STATUS_OPTIONS = [
  { value: "OPEN",           label: "OPEN – Public & Active",        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700" },
  { value: "PENDING",        label: "PENDING – Awaiting Review",      color: "text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700" },
  { value: "SUSPENDED",      label: "SUSPENDED – Taken Down",         color: "text-red-600 bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700" },
  { value: "OFFER_ACCEPTED", label: "OFFER ACCEPTED – In Negotiation",color: "text-purple-600 bg-purple-50 dark:bg-purple-950 border-purple-300 dark:border-purple-700" },
  { value: "IN_PROGRESS",    label: "IN PROGRESS – Job Underway",     color: "text-blue-600 bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700" },
  { value: "COMPLETED",      label: "COMPLETED – Finished",           color: "text-teal-600 bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700" },
  { value: "CANCELLED",      label: "CANCELLED",                      color: "text-stone-600 bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700" },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${opt.color}`}>
      {status}
    </span>
  );
}

export function AdminRequestModerationModal({
  request, onClose, onUpdate,
}: AdminRequestModerationModalProps) {
  const [tab, setTab] = useState<"details" | "quotes" | "media">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit state
  const [title, setTitle] = useState(request.title || "");
  const [description, setDescription] = useState(request.description || "");
  const [customCategory, setCustomCategory] = useState(request.customCategory || request.service?.name || "General Service");
  const [urgency, setUrgency] = useState(request.urgency || "SAME_DAY");
  const [status, setStatus] = useState(request.status || "OPEN");
  const [landmark, setLandmark] = useState(request.landmark || "Tamale");
  const [budgetMin, setBudgetMin] = useState(request.budgetMin?.toString() || "");
  const [budgetMax, setBudgetMax] = useState(request.budgetMax?.toString() || "");
  const [accessInstructions, setAccessInstructions] = useState(request.accessInstructions || "");

  // Admin note
  const [adminNote, setAdminNote] = useState("");
  const [sendingNote, setSendingNote] = useState(false);

  const customerName = request.customer?.name || request.guestName || "Customer";
  const rawPhone = request.customer?.phone || request.guestPhone || "";
  const cleanPhone = rawPhone.replace(/\s+/g, "").replace(/^0/, "233").replace("+", "");

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${customerName}, this is Servora Support regarding your job: "${request.title}". How can we help?`
  )}`;

  async function handleStatusChange(newStatus: string) {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        flash(`Status → ${newStatus}`);
        onUpdate();
      } else { alert("Failed to update status."); }
    } catch { alert("Error."); }
    finally { setLoading(false); }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, customCategory, urgency, status, landmark,
          budgetMin: budgetMin ? parseFloat(budgetMin) : null,
          budgetMax: budgetMax ? parseFloat(budgetMax) : null,
          accessInstructions,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        flash("Request details saved!");
        onUpdate();
      } else { alert("Failed to save edits."); }
    } catch { alert("Error saving."); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this request? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, { method: "DELETE" });
      if (res.ok) { onUpdate(); onClose(); }
      else { alert("Failed to delete."); }
    } catch { alert("Error."); }
    finally { setLoading(false); }
  }

  async function handleSendAdminNote() {
    if (!adminNote.trim()) return;
    setSendingNote(true);
    // In production this could log the note to an admin_notes table
    await new Promise(r => setTimeout(r, 600));
    flash(`Note logged: "${adminNote}"`);
    setAdminNote("");
    setSendingNote(false);
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  const quotes = request.quotes || [];
  const attachments = request.attachments || [];
  const tags = request.tags || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">

        {/* ── Header ── */}
        <div className="bg-slate-950 text-white p-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ADMIN · MODERATION
              </span>
              <StatusBadge status={status} />
            </div>
            <h2 className="text-sm font-black truncate">{request.title}</h2>
            <p className="text-[10px] font-mono text-slate-400">ID: {request.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Success Banner ── */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* ── Status Quick Actions ── */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-xs">
            <span className="font-bold text-stone-400 mr-1">Quick Actions:</span>

            {status !== "OPEN" && (
              <button onClick={() => handleStatusChange("OPEN")} disabled={loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                <ShieldCheck className="w-3.5 h-3.5" /> Approve & Publish
              </button>
            )}
            {status !== "SUSPENDED" && (
              <button onClick={() => handleStatusChange("SUSPENDED")} disabled={loading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                <ShieldAlert className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
            {status !== "COMPLETED" && (
              <button onClick={() => handleStatusChange("COMPLETED")} disabled={loading}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
            )}
            <button onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition ml-auto">
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Cancel Edit" : "Edit Details"}
            </button>
          </div>
        </div>

        {/* ── Customer Strip ── */}
        <div className="px-5 pt-3 pb-0">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-stone-900 dark:text-white text-xs truncate">{customerName}</p>
                <p className="text-[10px] font-mono text-stone-500">{rawPhone || "No phone"}</p>
              </div>
            </div>
            {rawPhone && (
              <div className="flex items-center gap-1.5 shrink-0">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-sm transition">
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
                <a href={`tel:${rawPhone}`}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 shadow-sm transition">
                  <Phone className="w-3 h-3" /> Call
                </a>
                <a href={`/requests/${request.id}`} target="_blank" rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-bold rounded-xl text-[10px] flex items-center gap-1 transition">
                  <ExternalLink className="w-3 h-3" /> View
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-2xl p-1">
            {(["details", "quotes", "media"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold capitalize transition cursor-pointer ${
                  tab === t
                    ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                {t === "quotes" ? `Quotes (${quotes.length})` : t === "media" ? `Media (${attachments.length})` : "Details"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5 space-y-4 max-h-[40vh] overflow-y-auto text-xs">

          {/* DETAILS TAB */}
          {tab === "details" && (
            isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Request Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent font-bold outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Category</label>
                    <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Urgency</label>
                    <select value={urgency} onChange={e => setUrgency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none">
                      <option value="EMERGENCY_ASAP">🚨 Emergency ASAP</option>
                      <option value="SAME_DAY">⚡ Same Day</option>
                      <option value="SCHEDULED">📅 Scheduled</option>
                      <option value="FLEXIBLE">🌱 Flexible</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Description</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Landmark</label>
                    <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 outline-none">
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Min Budget (GH₵)</label>
                    <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">Max Budget (GH₵)</label>
                    <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Access Instructions</label>
                  <input type="text" value={accessInstructions} onChange={e => setAccessInstructions(e.target.value)}
                    placeholder="e.g. Call at gate, green fence"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent outline-none" />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
                  <button type="submit" disabled={loading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Meta grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Category", value: request.customCategory || request.service?.name || "General", icon: <Tag className="w-3 h-3" /> },
                    { label: "Urgency", value: request.urgency || "SAME_DAY", icon: <Activity className="w-3 h-3" /> },
                    { label: "Location", value: request.landmark || "Tamale", icon: <MapPin className="w-3 h-3" /> },
                    { label: "Min Budget", value: request.budgetMin ? `GH₵ ${request.budgetMin}` : "—", icon: <DollarSign className="w-3 h-3" /> },
                    { label: "Max Budget", value: request.budgetMax ? `GH₵ ${request.budgetMax}` : "—", icon: <DollarSign className="w-3 h-3" /> },
                    { label: "Pricing", value: request.pricingType || "OPEN_FOR_QUOTES", icon: <Star className="w-3 h-3" /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-stone-400 mb-0.5">{icon}{label}</span>
                      <span className="font-bold text-stone-900 dark:text-white text-[11px]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Problem Description
                  </h4>
                  <p className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 leading-relaxed text-stone-800 dark:text-stone-200">
                    {request.description || "No description provided."}
                  </p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-full border border-stone-200 dark:border-stone-700 text-[10px] font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* GPS */}
                {request.latitude && request.longitude && (
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                        {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
                      </span>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                      Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Access Instructions */}
                {request.accessInstructions && (
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
                    <span className="text-[10px] font-bold uppercase">Access: </span>{request.accessInstructions}
                  </div>
                )}

                {/* Admin Note */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider">Admin Note / Log</label>
                  <div className="flex gap-2">
                    <input type="text" value={adminNote} onChange={e => setAdminNote(e.target.value)}
                      placeholder="Log a note about this request..."
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none text-[11px]"
                    />
                    <button onClick={handleSendAdminNote} disabled={sendingNote || !adminNote.trim()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1 font-bold cursor-pointer transition disabled:opacity-50">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* QUOTES TAB */}
          {tab === "quotes" && (
            <div className="space-y-2">
              {quotes.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No artisan quotes submitted yet.</p>
                </div>
              ) : quotes.map((q: any) => (
                <div key={q.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                      {(q.provider?.name || "A").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white truncate">{q.provider?.name || "Artisan"}</p>
                      <p className="text-[10px] text-stone-500 font-mono">{q.provider?.phone}</p>
                      {q.message && <p className="text-[10px] text-stone-500 mt-0.5 truncate max-w-[200px]">{q.message}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-600 text-sm">GH₵ {q.price}</p>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                      q.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>{q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MEDIA TAB */}
          {tab === "media" && (
            <div className="space-y-2">
              {attachments.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No media attachments.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {attachments.map((a: any, i: number) => (
                    <a key={i} href={a.mediaUrl} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition">
                      {a.mediaType === "VIDEO" ? <Video className="w-4 h-4 text-purple-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
                      <span className="truncate font-mono text-[10px] text-stone-700 dark:text-stone-300">{a.fileName || `Media ${i + 1}`}</span>
                      <ExternalLink className="w-3 h-3 text-stone-400 ml-auto shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <button onClick={handleDelete} disabled={loading}
            className="px-3.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => { onUpdate(); flash("Refreshed!"); }} disabled={loading}
              className="px-3 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
