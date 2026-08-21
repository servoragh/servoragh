"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Server,
  Layers,
  FileText,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { renderEmailTemplate } from "@/lib/email/templates/templateCatalog";

interface EmailLogItem {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  senderEmail: string;
  subject: string;
  templateName: string;
  category: string;
  status: "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED";
  provider: string;
  providerMessageId?: string | null;
  templateData?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  sentAt?: string | null;
  createdAt: string;
}

export function AdminEmailManagementHub({ isDark }: { isDark?: boolean }) {
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeProvider, setActiveProvider] = useState("mock");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal / Drawer States
  const [selectedTemplate, setSelectedTemplate] = useState<string>("AUTH_EMAIL_VERIFICATION");
  const [inspectingLog, setInspectingLog] = useState<EmailLogItem | null>(null);
  const [showTestDrawer, setShowTestDrawer] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("admin@servora.gh");
  const [testSending, setTestSending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmailLogs();
  }, [categoryFilter, statusFilter]);

  async function fetchEmailLogs() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        category: categoryFilter,
        status: statusFilter,
        search,
      });

      const res = await fetch(`/api/admin/email/logs?${queryParams}`);
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
        setStats(data.stats);
        setActiveProvider(data.activeProvider || "mock");
      }
    } catch {
      console.warn("Failed to load email logs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmailRecipient.trim()) return;
    try {
      setTestSending(true);
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmailRecipient,
          templateName: selectedTemplate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Test email "${selectedTemplate}" dispatched successfully via [${data.result.provider}] adapter!`);
        setShowTestDrawer(false);
        fetchEmailLogs();
      } else {
        alert(data.error || "Failed to dispatch test email.");
      }
    } catch {
      alert("Network error sending test email.");
    } finally {
      setTestSending(false);
    }
  }

  async function handleResendEmail(logId: string) {
    try {
      setResendingId(logId);
      const res = await fetch("/api/admin/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Email re-triggered and dispatched successfully!");
        setInspectingLog(null);
        fetchEmailLogs();
      } else {
        alert(data.error || "Failed to re-trigger email.");
      }
    } catch {
      alert("Network error re-triggering email.");
    } finally {
      setResendingId(null);
    }
  }

  const templateCatalogList = [
    { name: "AUTH_EMAIL_VERIFICATION", label: "Email Verification & OTP", category: "AUTHENTICATION" },
    { name: "AUTH_PASSWORD_RESET", label: "Password Reset Link", category: "SECURITY" },
    { name: "AUTH_MAGIC_LINK", label: "Magic Link Sign In", category: "AUTHENTICATION" },
    { name: "GUEST_OTP_VERIFY", label: "Guest Listing OTP", category: "GUEST_VERIFICATION" },
    { name: "PRODUCT_PENDING_REVIEW", label: "Listing Pending Review", category: "MARKETPLACE" },
    { name: "PRODUCT_APPROVED_LIVE", label: "Listing Approved & Live", category: "MARKETPLACE" },
    { name: "PRODUCT_REJECTED", label: "Listing Rejected Notice", category: "MARKETPLACE" },
    { name: "PRODUCT_INQUIRY_ALERT", label: "Buyer Inquiry Alert", category: "MARKETPLACE" },
    { name: "SERVICE_REQUEST_BROADCAST", label: "Artisan Gig Broadcast", category: "SERVICE_GIG" },
    { name: "SERVICE_QUOTE_RECEIVED", label: "Customer Bid Alert", category: "SERVICE_GIG" },
    { name: "SERVICE_QUOTE_ACCEPTED", label: "Quote Accepted Notice", category: "SERVICE_GIG" },
    { name: "SERVICE_STATUS_UPDATE", label: "Gig Progress Update", category: "SERVICE_GIG" },
    { name: "RENTAL_BOOKING_REQUEST", label: "Equipment Booking Request", category: "RENTAL" },
    { name: "RENTAL_CONFIRMED", label: "Rental Booking Confirmed", category: "RENTAL" },
    { name: "SUPPORT_TICKET_CREATED", label: "Support Ticket Created", category: "SUPPORT_DISPUTE" },
    { name: "SUPPORT_AGENT_REPLY", label: "Support Response Notice", category: "SUPPORT_DISPUTE" },
    { name: "DISPUTE_MEDIATION_ALERT", label: "Dispute Mediation Notice", category: "SUPPORT_DISPUTE" },
    { name: "ADMIN_PENDING_VERIFICATION_ALERT", label: "Admin Ghana Card Alert", category: "ADMIN_ALERT" },
    { name: "SECURITY_NEW_DEVICE_LOGIN", label: "New Device Security Alert", category: "SECURITY" },
  ];

  const previewRender = renderEmailTemplate(selectedTemplate, {
    name: "Kwaku Mensah",
    title: "5KW Honda Silent Diesel Generator",
    area: "Sakasaka, Tamale",
    serviceName: "Electrical Repair",
    price: "350",
    otpCode: "882319",
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-500" /> Transactional Email & Subsystem Hub
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Provider-agnostic email mailer (Resend, Brevo, SMTP, Mock), delivery logs, exponential retries, and template previewer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full uppercase font-mono">
            Provider: {activeProvider} ⚡
          </span>
          <button
            onClick={() => setShowTestDrawer(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" /> Send Test Email 🚀
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DELIVERABILITY STATS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Total Dispatches</span>
          <div className="text-xl font-black text-stone-900 dark:text-white font-mono">{stats?.totalCount || 0}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Delivery Rate</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{stats?.deliveryRate || 100}%</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Sent Successfully</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{stats?.sentCount || 0}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Failed / Bounced</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{stats?.failedCount || 0}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Queued Retry</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">{stats?.queuedCount || 0}</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TEMPLATE PREVIEWER CATALOG */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 gap-2">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" /> Transactional Template Catalog (19 Templates)
          </h3>
          <span className="text-xs font-mono text-stone-400">
            Selected: <strong className="text-emerald-600 font-bold">{selectedTemplate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Template Selector List */}
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1 text-xs">
            {templateCatalogList.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => setSelectedTemplate(tpl.name)}
                className={`w-full p-2.5 rounded-2xl transition text-left flex items-center justify-between cursor-pointer ${
                  selectedTemplate === tpl.name
                    ? "bg-emerald-600 text-white font-black shadow-xs"
                    : "bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="block">{tpl.label}</span>
                  <span className="text-[9px] font-mono opacity-80 uppercase block">{tpl.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            ))}
          </div>

          {/* Rendered HTML Live Preview Box */}
          <div className="lg:col-span-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-400">
                  Subject: <strong className="text-stone-900 dark:text-white font-bold">{previewRender.subject}</strong>
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  {previewRender.category}
                </span>
              </div>

              {/* Rendered HTML iFrame / Box */}
              <div
                className="bg-white rounded-xl p-4 border border-stone-200 text-stone-900 max-h-64 overflow-y-auto text-xs"
                dangerouslySetInnerHTML={{ __html: previewRender.html }}
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span>Domain Sender: notifications@mail.servora.com</span>
              <button
                onClick={() => setShowTestDrawer(true)}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Send Test Email of This Template ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DATABASE EMAIL LOGS TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" /> Real PostgreSQL Email Audit Logs (`EmailLog`)
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-bold outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTHENTICATION">Authentication</option>
              <option value="MARKETPLACE">Marketplace</option>
              <option value="SERVICE_GIG">Service Gig</option>
              <option value="RENTAL">Tool Rental</option>
              <option value="SUPPORT_DISPUTE">Support & Disputes</option>
              <option value="SECURITY">Security</option>
            </select>

            <button
              onClick={fetchEmailLogs}
              className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs text-xs">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-950 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-800 shadow-xs">
                <tr>
                  <th className="p-4">Recipient & Subject</th>
                  <th className="p-4">Template Name</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Dispatched At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-400 font-bold">
                      Querying Email Log Audit Records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-500 font-semibold">
                      No transactional email logs match your filter.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60">
                      <td className="p-4">
                        <div className="font-extrabold text-stone-900 dark:text-white">{log.recipientEmail}</div>
                        <div className="text-[11px] text-stone-500 truncate max-w-xs">{log.subject}</div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                        {log.templateName}
                      </td>
                      <td className="p-4 uppercase font-mono text-[10px] font-bold text-stone-400">
                        {log.provider}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            log.status === "SENT" || log.status === "DELIVERED"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                              : log.status === "QUEUED"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-stone-400">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Log 👁️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEND TEST EMAIL DRAWER MODAL */}
      {/* ------------------------------------------------------------- */}
      {showTestDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Send className="w-5 h-5" /> Dispatch Test Transactional Email
              </h3>
              <button onClick={() => setShowTestDrawer(false)} className="text-xs font-bold text-stone-400">
                Close (X)
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                  Recipient Email Address:
                </label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-semibold outline-none"
                  placeholder="admin@servora.gh"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                  Select Template:
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                >
                  {templateCatalogList.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.label} ({t.name})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-stone-500 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                Email will be processed via active provider adapter <strong>[{activeProvider.toUpperCase()}]</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowTestDrawer(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={testSending || !testEmailRecipient.trim()}
                onClick={handleSendTestEmail}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Test Email 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LOG INSPECTION & RE-TRIGGER MODAL */}
      {/* ------------------------------------------------------------- */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" /> Email Log Inspection: {inspectingLog.id}
              </h3>
              <button onClick={() => setInspectingLog(null)} className="text-xs font-bold text-stone-400">
                Close (X)
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">Subject & Recipient:</span>
                <div className="font-extrabold text-stone-900 dark:text-white text-sm">{inspectingLog.subject}</div>
                <div className="text-[11px] text-stone-500 font-mono">To: {inspectingLog.recipientEmail}</div>
              </div>

              {inspectingLog.errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 font-mono text-[11px]">
                  <strong>Error Trace:</strong> {inspectingLog.errorMessage}
                </div>
              )}

              <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-1 max-h-40 overflow-y-auto font-mono text-[11px]">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Sanitized Dynamic Payload (`templateData`):</span>
                <pre className="whitespace-pre-wrap">{inspectingLog.templateData || "{}"}</pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                disabled={resendingId === inspectingLog.id}
                onClick={() => handleResendEmail(inspectingLog.id)}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-trigger / Resend Email 🔄
              </button>

              <button
                onClick={() => setInspectingLog(null)}
                className="py-2 px-4 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
