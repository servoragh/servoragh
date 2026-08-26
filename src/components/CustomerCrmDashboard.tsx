"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Smartphone,
  Globe,
  Tag,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Lock,
  LogOut,
  Key,
  Eye,
  FileText,
  Pin,
  RefreshCw,
  Sliders,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Filter,
  UserCheck,
  UserX,
  AlertCircle,
  Percent,
} from "lucide-react";
import {
  CrmCustomer,
  CustomerStatus,
  VerificationTier,
  RiskLevel,
  AdminNote,
} from "@/lib/crmTypes";
import { formatGHS, formatDate } from "@/lib/utils";

interface CustomerCrmDashboardProps {
  isDark?: boolean;
}

export function CustomerCrmDashboard({ isDark = false }: CustomerCrmDashboardProps) {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | "ALL">("ALL");
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "ALL">("ALL");
  const [selectedTier, setSelectedTier] = useState<VerificationTier | "ALL">("ALL");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  // Selected Customer for 360 Workspace Drawer
  const [activeCustomer, setActiveCustomer] = useState<CrmCustomer | null>(null);
  const [activeTab, setActiveTab] = useState<"identity" | "financial" | "omnichannel" | "notes">("identity");

  // Modal States
  const [actionModal, setActionModal] = useState<{
    type: "STATUS" | "SECURITY" | "FINANCIAL" | "SHADOW_LOGIN" | null;
    customer: CrmCustomer | null;
  }>({ type: null, customer: null });

  const [formStatus, setFormStatus] = useState<CustomerStatus>("ACTIVE");
  const [formReason, setFormReason] = useState("");
  const [formAdjType, setFormAdjType] = useState<"WALLET_CREDIT" | "DISCOUNT_VOUCHER" | "REFUND" | "ESCROW_FREEZE">("WALLET_CREDIT");
  const [formAmount, setFormAmount] = useState<number>(50);
  const [formTitle, setFormTitle] = useState("");

  // Notes & Tag Form State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteIsPinned, setNewNoteIsPinned] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [processing, setProcessing] = useState(false);

  // Shadow Login Generated Token Result
  const [shadowResult, setShadowResult] = useState<{ token: string; expiresAt: string } | null>(null);

  useEffect(() => {
    fetchCrmCustomers();
  }, [selectedStatus, selectedRisk, selectedTier, selectedTag]);

  async function fetchCrmCustomers() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedRisk !== "ALL") params.set("riskLevel", selectedRisk);
      if (selectedTier !== "ALL") params.set("verificationTier", selectedTier);
      if (selectedTag !== "ALL") params.set("tag", selectedTag);

      const res = await fetch(`/api/admin/crm/customers?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.customers) {
        setCustomers(data.customers);
        // If active customer drawer is open, refresh active customer data
        if (activeCustomer) {
          const updated = data.customers.find((c: CrmCustomer) => c.id === activeCustomer.id);
          if (updated) setActiveCustomer(updated);
        }
      } else {
        throw new Error(data.error || "Failed to fetch CRM customers.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchCrmCustomers();
  }

  async function handleExecuteAction(e: React.FormEvent) {
    e.preventDefault();
    if (!actionModal.customer || !actionModal.type) return;

    try {
      setProcessing(true);
      const customerId = actionModal.customer.id;
      let payload: any = { actionType: "" };

      if (actionModal.type === "STATUS") {
        payload = {
          actionType: "UPDATE_STATUS",
          status: formStatus,
          reason: formReason || "Admin status adjustment",
        };
      } else if (actionModal.type === "FINANCIAL") {
        payload = {
          actionType: "FINANCIAL_ADJUSTMENT",
          adjustmentType: formAdjType,
          amount: formAmount,
          title: formTitle || `Manual ${formAdjType}`,
        };
      } else if (actionModal.type === "SHADOW_LOGIN") {
        if (!formReason.trim()) {
          toast.warning("Reason Required", "Admin reason is required for shadow login impersonation.");
          setProcessing(false);
          return;
        }
        payload = {
          actionType: "SHADOW_LOGIN",
          reason: formReason,
        };
      } else if (actionModal.type === "SECURITY") {
        payload = {
          actionType: "SECURITY_OVERRIDE",
          reason: formReason || "Force invalidate sessions & reset",
        };
      }

      const res = await fetch(`/api/admin/crm/customers/${encodeURIComponent(customerId)}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (actionModal.type === "SHADOW_LOGIN" && data.shadowToken) {
          setShadowResult(data.shadowToken);
          toast.success("Shadow Token Generated 🔑", "Impersonation session ready.");
        } else {
          setActionModal({ type: null, customer: null });
          setFormReason("");
          toast.success("CRM Action Completed ✓", "Customer record updated.");
        }
        fetchCrmCustomers();
      } else {
        toast.error("CRM Action Failed", data.error || "Failed to execute CRM action.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to communicate with CRM endpoint.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCustomer || !newNoteContent.trim()) return;

    try {
      setProcessing(true);
      const res = await fetch(`/api/admin/crm/customers/${encodeURIComponent(activeCustomer.id)}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNoteContent, isPinned: newNoteIsPinned }),
      });
      if (res.ok) {
        setNewNoteContent("");
        setNewNoteIsPinned(false);
        toast.success("Internal Note Added 📝", "Note attached to customer record.");
        fetchCrmCustomers();
      } else {
        const data = await res.json();
        toast.error("Note Failed", data.error || "Failed to add note.");
      }
    } catch (e) {
      toast.error("Network Error", "Failed to add note.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleAddTag(tagToAdd: string) {
    if (!activeCustomer || !tagToAdd.trim()) return;
    const cleanTag = tagToAdd.trim();
    if (activeCustomer.tags.includes(cleanTag)) return;

    const newTags = [...activeCustomer.tags, cleanTag];
    await updateTagsForActiveCustomer(newTags);
    setNewTagInput("");
  }

  async function handleRemoveTag(tagToRemove: string) {
    if (!activeCustomer) return;
    const newTags = activeCustomer.tags.filter((t) => t !== tagToRemove);
    await updateTagsForActiveCustomer(newTags);
  }

  async function updateTagsForActiveCustomer(newTags: string[]) {
    if (!activeCustomer) return;
    try {
      const res = await fetch(`/api/admin/crm/customers/${encodeURIComponent(activeCustomer.id)}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      if (res.ok) {
        fetchCrmCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Summary Metrics Calculations
  const totalLTV = customers.reduce((acc, c) => acc + c.lifetimeValue, 0);
  const activeCount = customers.filter((c) => c.status === "ACTIVE").length;
  const highRiskCount = customers.filter((c) => c.riskLevel === "HIGH" || c.riskLevel === "CRITICAL").length;
  const suspendedCount = customers.filter((c) => c.status === "SUSPENDED" || c.status === "FROZEN_ESCROW" || c.status === "BANNED").length;

  // Helper Badge Color Lookups
  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "PENDING_VERIFICATION":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "SUSPENDED":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30";
      case "FROZEN_ESCROW":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30";
      case "BANNED":
        return "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30";
      default:
        return "bg-stone-500/20 text-stone-700 dark:text-stone-300 border-stone-500/30";
    }
  };

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "MEDIUM":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800";
      case "CRITICAL":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse";
    }
  };

  const getTierBadge = (tier: VerificationTier) => {
    switch (tier) {
      case "TIER_3_ENTERPRISE":
        return { label: "Tier 3 Enterprise", color: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30", icon: Building2 };
      case "TIER_2_IDENTITY":
        return { label: "Tier 2 ID Verified", color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30", icon: ShieldCheck };
      case "TIER_1_BASIC":
        return { label: "Tier 1 Phone", color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30", icon: Phone };
      default:
        return { label: "Unverified", color: "bg-stone-500/20 text-stone-600 dark:text-stone-400 border-stone-500/30", icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6 font-sans text-stone-900 dark:text-stone-100">
      {/* ------------------------------------------------------------- */}
      {/* HEADER & METRICS SUMMARY ROW */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center font-black shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  360° Customer Management & CRM 👥
                </h2>
                <span className="text-xs text-emerald-400 font-bold tracking-wide">
                  Enterprise Operational Control Center
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-2 max-w-3xl leading-relaxed">
              Complete customer lifecycle management, real-time risk/fraud index, omni-channel interaction streams, financial ledgers & admin controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCrmCustomers}
              className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-stone-700"
              title="Refresh Customer Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sync Records</span>
            </button>
          </div>
        </div>

        {/* Analytics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Total Managed Accounts
            </span>
            <span className="text-2xl font-black text-white mt-1 block">{customers.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
              {activeCount} Active on Platform
            </span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Total Customer LTV Volume
            </span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {formatGHS(totalLTV)}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Cumulative Lifetime Trade</span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              High / Critical Risk Flags
            </span>
            <span className={`text-2xl font-black mt-1 block ${highRiskCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {highRiskCount}
            </span>
            <span className="text-[10px] text-stone-400 mt-1 block">Fraud & Dispute Markers</span>
          </div>

          <div className="p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Restricted & Suspended
            </span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{suspendedCount}</span>
            <span className="text-[10px] text-stone-400 mt-1 block">Requires Ops Review</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTERING & SEARCH TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone (+233...), email, or area (e.g. Sakasaka)..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Filter className="w-4 h-4" /> Filter Records
          </button>
        </form>

        {/* Filter Dropdowns & Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/80 text-xs font-semibold">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="p-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none font-bold text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="FROZEN_ESCROW">FROZEN_ESCROW</option>
              <option value="BANNED">BANNED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Risk Level Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="p-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none font-bold text-xs"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="CRITICAL">CRITICAL Risk</option>
            </select>
          </div>

          {/* Tier Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="p-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none font-bold text-xs"
            >
              <option value="ALL">All Verification Tiers</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="TIER_1_BASIC">Tier 1 (Phone)</option>
              <option value="TIER_2_IDENTITY">Tier 2 (National ID)</option>
              <option value="TIER_3_ENTERPRISE">Tier 3 (Enterprise)</option>
            </select>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto ml-auto">
            {["ALL", "VIP", "Sakasaka", "Nyohini", "Dispute Risk", "High Spender"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  selectedTag === t
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                }`}
              >
                {t === "ALL" ? "All Tags" : `#${t}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CUSTOMER ROSTER TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-stone-400 font-bold">
            Querying Enterprise CRM Database...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-stone-500 font-semibold">
            No customer profiles match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-stone-100 dark:bg-stone-950 text-stone-500 uppercase tracking-wider text-[10px] font-bold border-b border-stone-200 dark:border-stone-800 shadow-xs">
                <tr>
                  <th className="p-4">Customer Identity</th>
                  <th className="p-4">Verification & Tier</th>
                  <th className="p-4">Lifetime LTV</th>
                  <th className="p-4">Risk & Fraud Index</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">360° Workspace Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800/80">
                {customers.map((cust) => {
                  const tier = getTierBadge(cust.verificationTier);
                  const TierIcon = tier.icon;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-stone-100/80 dark:hover:bg-stone-800/60 transition duration-150"
                    >
                      {/* Customer Identity */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {cust.avatarUrl ? (
                            <img
                              src={cust.avatarUrl}
                              alt={cust.name}
                              className="w-9 h-9 rounded-full object-cover border border-emerald-500 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {cust.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                              <span>{cust.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                                {cust.accountType}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                              {cust.phone} {cust.email ? `• ${cust.email}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Verification & Tier */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${tier.color}`}
                        >
                          <TierIcon className="w-3 h-3" />
                          <span>{tier.label}</span>
                        </span>
                        <span className="block text-[10px] text-stone-400 mt-1 font-mono">
                          {cust.serviceArea}
                        </span>
                      </td>

                      {/* Lifetime LTV */}
                      <td className="p-4">
                        <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          {formatGHS(cust.lifetimeValue)}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {cust.totalOrdersCount} Orders • AOV {formatGHS(cust.averageOrderValue)}
                        </div>
                      </td>

                      {/* Risk & Fraud Index */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getRiskBadge(
                              cust.riskLevel,
                              cust.riskScore
                            )}`}
                          >
                            {cust.riskLevel} ({cust.riskScore})
                          </span>
                        </div>
                        {cust.disputeCount > 0 && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">
                            ⚠️ {cust.disputeCount} Disputes Logged
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                            cust.status
                          )}`}
                        >
                          {cust.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setActiveCustomer(cust);
                            setActiveTab("identity");
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl shadow transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>360° Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setActionModal({ type: "STATUS", customer: cust })
                          }
                          className="p-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-xl transition cursor-pointer"
                          title="Change Account Status"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 360-DEGREE CUSTOMER WORKSPACE DRAWER / MODAL */}
      {/* ------------------------------------------------------------- */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setActiveCustomer(null)}
          />

          <aside className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col justify-between z-10 text-stone-900 dark:text-stone-100 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeCustomer.avatarUrl ? (
                  <img
                    src={activeCustomer.avatarUrl}
                    alt={activeCustomer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-lg">
                    {activeCustomer.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <span>{activeCustomer.name}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                        activeCustomer.status
                      )}`}
                    >
                      {activeCustomer.status}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    ID: {activeCustomer.userId} • Joined {formatDate(activeCustomer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActionModal({ type: "SHADOW_LOGIN", customer: activeCustomer })}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  title="Shadow Login Mode"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Impersonate</span>
                </button>
                <button
                  onClick={() => setActiveCustomer(null)}
                  className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-5 text-xs font-bold overflow-x-auto">
              {[
                { id: "identity", label: "Identity & Profile", icon: UserCheck },
                { id: "financial", label: "Financial Ledger & Wallet", icon: DollarSign },
                { id: "omnichannel", label: "Interaction Stream", icon: MessageSquare },
                { id: "notes", label: "Admin Notes & Audit", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-4 border-b-2 font-extrabold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* TAB 1: IDENTITY & PROFILE */}
              {activeTab === "identity" && (
                <div className="space-y-6">
                  {/* Risk Score Warning Box */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${getRiskBadge(
                      activeCustomer.riskLevel,
                      activeCustomer.riskScore
                    )}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-5 h-5" />
                      <div>
                        <span className="font-extrabold text-xs block uppercase tracking-wider">
                          Automated Trust & Risk Index: {activeCustomer.riskLevel} ({activeCustomer.riskScore}/100)
                        </span>
                        <span className="text-[11px] opacity-90 block">
                          Calculated from disputes, device switches, and verification signals.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActionModal({ type: "SECURITY", customer: activeCustomer })}
                      className="px-3 py-1.5 bg-stone-900 text-white font-bold text-[11px] rounded-xl shadow cursor-pointer"
                    >
                      Security Override
                    </button>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                        Contact Points
                      </span>
                      <div className="text-xs font-bold space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> {activeCustomer.phone}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" /> {activeCustomer.email || "No Email Registered"}
                        </p>
                        <p className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Active
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
                      <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                        Verification Tier Status
                      </span>
                      <div className="text-xs font-bold space-y-1">
                        <p className="flex items-center gap-1.5 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" /> {activeCustomer.verificationTier}
                        </p>
                        <p className="text-[11px] text-stone-400 font-normal">
                          Ghana Card / National ID verified & matched against central database.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GPS Addresses */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Saved Service & Delivery Addresses (GPS Pinned)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCustomer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs space-y-1"
                        >
                          <div className="font-extrabold flex items-center justify-between">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <MapPin className="w-3.5 h-3.5" /> {addr.title} ({addr.area})
                            </span>
                          </div>
                          <p className="text-stone-500 text-[11px]">
                            {addr.street || "Main Road"} {addr.landmark ? `• ${addr.landmark}` : ""}
                          </p>
                          {addr.latitude && (
                            <span className="text-[9px] font-mono text-stone-400 block">
                              GPS: {addr.latitude.toFixed(4)}, {addr.longitude?.toFixed(4)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Devices & Fingerprints */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                      Connected Devices & Fingerprints
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      {activeCustomer.connectedIdentities.deviceIds.map((dev) => (
                        <span key={dev} className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 rounded-lg text-[11px] flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-stone-400" /> {dev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tag Manager */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Custom Customer Tags & Dynamic Cohorts
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeCustomer.tags.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <span>#{t}</span>
                          <button
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-rose-500 cursor-pointer ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag(newTagInput);
                            }
                          }}
                          placeholder="+ Add tag (Press Enter)"
                          className="px-3 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs outline-none font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FINANCIAL LEDGER & WALLET */}
              {activeTab === "financial" && (
                <div className="space-y-6">
                  {/* Financial Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                        Customer LTV
                      </span>
                      <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                        {formatGHS(activeCustomer.lifetimeValue)}
                      </span>
                    </div>

                    <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">
                        Wallet Balance
                      </span>
                      <span className="text-xl font-black text-stone-900 dark:text-white mt-1 block">
                        {formatGHS(activeCustomer.walletBalance)}
                      </span>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
                      <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300 block">
                        Pending Escrow
                      </span>
                      <span className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1 block">
                        {formatGHS(activeCustomer.pendingEscrow)}
                      </span>
                    </div>
                  </div>

                  {/* Manual Financial Adjustment Trigger Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActionModal({ type: "FINANCIAL", customer: activeCustomer })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Issue Credit / Voucher / Refund
                    </button>
                  </div>

                  {/* Transaction Timeline */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Chronological Transaction & Escrow Timeline
                    </span>

                    {activeCustomer.recentTransactions.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-950 rounded-2xl">
                        No transactions logged yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeCustomer.recentTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-stone-900 dark:text-white block">
                                  {tx.title}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {tx.type} • {formatDate(tx.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 block">
                                +{formatGHS(tx.amount)}
                              </span>
                              <span className="text-[9px] font-mono uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: OMNICHANNEL INTERACTION STREAM */}
              {activeTab === "omnichannel" && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                    Omnichannel Stream (Chat, SMS, WhatsApp & Community)
                  </span>

                  {activeCustomer.omnichannelEvents.length === 0 ? (
                    <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-950 rounded-2xl">
                      No interaction stream logs recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeCustomer.omnichannelEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> {ev.title}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {formatDate(ev.timestamp)}
                            </span>
                          </div>
                          <p className="text-stone-700 dark:text-stone-300 font-medium">
                            {ev.summary}
                          </p>
                          <span className="text-[9px] font-mono uppercase text-stone-400 block">
                            Channel: {ev.channel}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ADMIN COLLABORATION & AUDIT */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  {/* Sticky Notes Section */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Internal Admin Sticky Notes & Team Mentions
                    </span>

                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={2}
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Add internal operational note (e.g. @agent verify delivery before releasing payout)..."
                        className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newNoteIsPinned}
                            onChange={(e) => setNewNoteIsPinned(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Pin to top of customer profile</span>
                        </label>
                        <button
                          type="submit"
                          disabled={processing || !newNoteContent.trim()}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer disabled:opacity-50"
                        >
                          Post Internal Note
                        </button>
                      </div>
                    </form>

                    {/* Notes List */}
                    <div className="space-y-2 pt-2">
                      {activeCustomer.internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            note.isPinned
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                              : "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800"
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                              <span>{note.adminName}</span>
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {formatDate(note.createdAt)}
                            </span>
                          </div>
                          <p className="font-medium leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Immutable Audit Log */}
                  <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                      Immutable Administrative Audit Trail
                    </span>
                    <div className="space-y-2">
                      {activeCustomer.activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-extrabold text-stone-900 dark:text-white block">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              By {log.performedBy} {log.ipAddress ? `• IP: ${log.ipAddress}` : ""}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OPERATIONAL ACTION MODALS */}
      {/* ------------------------------------------------------------- */}
      {actionModal.type && actionModal.customer && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm"
            onClick={() => setActionModal({ type: null, customer: null })}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-stone-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-base font-bold">
                {actionModal.type === "STATUS" && "Update Account Status"}
                {actionModal.type === "FINANCIAL" && "Financial Manual Adjustment"}
                {actionModal.type === "SHADOW_LOGIN" && "Shadow Login (Impersonation Mode)"}
                {actionModal.type === "SECURITY" && "Security Override"}
              </h3>
              <button
                onClick={() => {
                  setActionModal({ type: null, customer: null });
                  setShadowResult(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="space-y-4 text-xs">
              {/* STATUS MODAL */}
              {actionModal.type === "STATUS" && (
                <>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Target Status State *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                    >
                      <option value="ACTIVE">ACTIVE (Normal Operations)</option>
                      <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                      <option value="SUSPENDED">SUSPENDED (Restrict Access)</option>
                      <option value="FROZEN_ESCROW">FROZEN_ESCROW (Freeze Payouts)</option>
                      <option value="BANNED">BANNED (Permanent Lock)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Mandatory Admin Operational Reason *
                    </label>
                    <input
                      type="text"
                      required
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      placeholder="e.g. Fraud dispute review / Verified Ghana card docs"
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                    />
                  </div>
                </>
              )}

              {/* FINANCIAL MODAL */}
              {actionModal.type === "FINANCIAL" && (
                <>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Adjustment Type *
                    </label>
                    <select
                      value={formAdjType}
                      onChange={(e) => setFormAdjType(e.target.value as any)}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                    >
                      <option value="WALLET_CREDIT">Direct Wallet Credit (GHS)</option>
                      <option value="DISCOUNT_VOUCHER">Discretionary Voucher (GHS)</option>
                      <option value="REFUND">Dispute Payout Refund (GHS)</option>
                      <option value="ESCROW_FREEZE">Freeze Outgoing Escrow (GHS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Amount (GHS) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Adjustment Title / Note
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Goodwill credit for delayed artisan dispatch"
                      className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                    />
                  </div>
                </>
              )}

              {/* SHADOW LOGIN MODAL */}
              {actionModal.type === "SHADOW_LOGIN" && (
                <>
                  {shadowResult ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2">
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs block">
                        Shadow Token Generated Successfully!
                      </span>
                      <p className="font-mono text-[10px] break-all bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded">
                        {shadowResult.token}
                      </p>
                      <span className="text-[10px] text-stone-500 block">
                        Expires at: {formatDate(shadowResult.expiresAt)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Mandatory Admin Reason for Shadow Login *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        placeholder="e.g. Investigating checkout bug reported by user on mobile web..."
                        className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                      />
                    </div>
                  )}
                </>
              )}

              {/* SECURITY OVERRIDE MODAL */}
              {actionModal.type === "SECURITY" && (
                <div>
                  <p className="text-stone-500 text-xs mb-3">
                    Triggering a security override will immediately invalidate all active sessions, force a 2FA re-authentication prompt, and log this event in the immutable audit trail.
                  </p>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Security Reason
                  </label>
                  <input
                    type="text"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="e.g. Suspicious multi-device login activity detected"
                    className="w-full p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none font-medium"
                  />
                </div>
              )}

              {/* Submit Footer */}
              {!shadowResult && (
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActionModal({ type: null, customer: null })}
                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow cursor-pointer disabled:opacity-50"
                  >
                    {processing ? "Executing..." : "Confirm Action"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
