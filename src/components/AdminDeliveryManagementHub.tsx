"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Bike,
  UserCheck,
  Search,
  MapPin,
  Phone,
  Package,
  DollarSign,
  User,
  Clock,
  Key,
  Filter,
} from "lucide-react";
import { formatGHS, formatDate } from "@/lib/utils";

export function AdminDeliveryManagementHub() {
  const [activeTab, setActiveTab] = useState<"DELIVERIES" | "PROVIDERS" | "VEHICLES">("DELIVERIES");
  const [providers, setProviders] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchDeliveryAdminData();
  }, []);

  async function fetchDeliveryAdminData() {
    try {
      setLoading(true);
      // 1. Fetch provider & vehicle verifications
      const verifRes = await fetch("/api/admin/delivery/verifications");
      const verifJson = await verifRes.json();
      if (verifJson.success) {
        setProviders(verifJson.providers || []);
        setVehicles(verifJson.vehicles || []);
      }

      // 2. Fetch active delivery requests
      const delivRes = await fetch("/api/delivery/requests/available");
      const delivJson = await delivRes.json();
      if (delivJson.success) {
        setDeliveries(delivJson.deliveries || []);
      }
    } catch (err) {
      console.error("Error loading admin delivery fleet data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (
    id: string,
    action: "APPROVE" | "REJECT" | "SUSPEND",
    targetType: "provider" | "vehicle"
  ) => {
    let rejectionReason = "";
    if (action === "REJECT" || action === "SUSPEND") {
      rejectionReason = prompt(`Enter reason for ${action.toLowerCase()}ing:`) || "";
      if (!rejectionReason) return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/delivery/verifications/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason, targetType }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed.");

      toast.success("Delivery Operations Updated 🚚", json.message || "Action processed successfully.");
      fetchDeliveryAdminData();
    } catch (err: any) {
      toast.error("Action Failed", err.message || "Could not process delivery update.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickupContactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.packageDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProviders = providers.filter((p) => {
    const name = p.user?.name || "";
    const phone = p.user?.phone || "";
    const idNum = p.idNumber || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idNum.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* HEADER BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-300 border border-white/10 mb-2">
            <Truck className="w-4 h-4" /> Comprehensive Fleet & Delivery Marketplace Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Delivery Dispatch & Rider Console</h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitor live package dispatches, verify Ghana Card IDs & rider vehicles, track PIN OTP proof-of-delivery, and audit platform earnings.
          </p>
        </div>

        <button
          onClick={fetchDeliveryAdminData}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Fleet Data</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* METRICS OVERVIEW CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Dispatches</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {deliveries.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Live Requests in System
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Riders</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {providers.length}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {providers.filter((p) => p.verificationStatus === "SUBMITTED" || p.verificationStatus === "PENDING").length} Pending Verifications
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Vehicles</span>
            <Bike className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {vehicles.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Motorcycles, Bikes & Vans
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Take (15%)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatGHS(deliveries.reduce((acc, d) => acc + (parseFloat(d.platformCommission) || 0), 0))}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Accumulated Net Commission
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEARCH & NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => {
              setActiveTab("DELIVERIES");
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === "DELIVERIES"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            📦 Live Delivery Requests ({deliveries.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("PROVIDERS");
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === "PROVIDERS"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            🪪 Rider Verification Queue ({providers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("VEHICLES");
              setStatusFilter("ALL");
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition whitespace-nowrap cursor-pointer ${
              activeTab === "VEHICLES"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
            }`}
          >
            🛵 Vehicles Fleet ({vehicles.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tracking, rider, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300"
          >
            <option value="ALL">Filter: All Statuses</option>
            {activeTab === "DELIVERIES" ? (
              <>
                <option value="SEARCHING_FOR_PROVIDER">SEARCHING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </>
            ) : (
              <>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: LIVE DELIVERIES REQUESTS BOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "DELIVERIES" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          {filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>No delivery requests found matching your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Tracking & Pin</th>
                    <th className="px-4 py-3">Pickup & Receiver</th>
                    <th className="px-4 py-3">Package Specs</th>
                    <th className="px-4 py-3">Financials</th>
                    <th className="px-4 py-3">Rider Assigned</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {filteredDeliveries.map((deliv) => (
                    <tr key={deliv.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition">
                      <td className="px-4 py-3 space-y-1">
                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block text-xs">
                          {deliv.trackingNumber}
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded font-mono font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                          <Key className="w-3 h-3" /> PIN: {deliv.deliveryPin}
                        </div>
                      </td>

                      <td className="px-4 py-3 space-y-1">
                        <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{deliv.pickupAddress}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>To: {deliv.recipientName} ({deliv.recipientPhone})</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 space-y-1">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate max-w-[160px]">
                          {deliv.packageDescription}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {deliv.packageWeightKg}kg • {deliv.requiredVehicleType}
                        </span>
                      </td>

                      <td className="px-4 py-3 space-y-1 font-mono">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          Fee: {formatGHS(parseFloat(deliv.deliveryFee))}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Net Rider: {formatGHS(parseFloat(deliv.providerEarnings))}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {deliv.assignedProvider ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {deliv.assignedProvider.user?.name || "Assigned Rider"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {deliv.assignedProvider.user?.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            deliv.status === "DELIVERED"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                              : deliv.status === "IN_TRANSIT"
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300"
                          }`}
                        >
                          {deliv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: RIDER VERIFICATION QUEUE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "PROVIDERS" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          {filteredProviders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>No rider provider profiles matching current filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredProviders.map((prov) => (
                <div key={prov.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition">
                  {/* Rider Information & Photos */}
                  <div className="flex items-start gap-4">
                    {/* Selfie Preview */}
                    {prov.selfieUrl ? (
                      <img
                        src={prov.selfieUrl}
                        alt="Rider Selfie"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 font-bold text-lg shrink-0">
                        {prov.user?.name?.[0] || "R"}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {prov.user?.name || "Rider Candidate"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            prov.verificationStatus === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : prov.verificationStatus === "REJECTED" || prov.verificationStatus === "SUSPENDED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {prov.verificationStatus}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 font-medium">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {prov.user?.phone}
                        </span>
                        <span>•</span>
                        <span>ID: <strong>{prov.idType || "GHANA_CARD"}</strong> - {prov.idNumber || "GHA-000000000-0"}</span>
                        <span>•</span>
                        <span>Address: {prov.residentialAddress || "Tamale, Northern Region"}</span>
                      </div>

                      {prov.emergencyContactName && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                          Emergency Contact: {prov.emergencyContactName} ({prov.emergencyContactPhone})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Documents */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    {prov.idDocumentUrl && (
                      <a
                        href={prov.idDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View ID Card
                      </a>
                    )}

                    {prov.verificationStatus !== "APPROVED" && (
                      <button
                        onClick={() => handleAction(prov.id, "APPROVE", "provider")}
                        disabled={processingId === prov.id}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Rider
                      </button>
                    )}

                    {prov.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => handleAction(prov.id, "REJECT", "provider")}
                        disabled={processingId === prov.id}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: VEHICLES FLEET */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "VEHICLES" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          {vehicles.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <Bike className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>No registered vehicles in system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Vehicle Details</th>
                    <th className="px-4 py-3">Owner / Rider</th>
                    <th className="px-4 py-3">Plate Number</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition">
                      <td className="px-4 py-3 space-y-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                          {v.make} {v.model} ({v.year || "2023"})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Type: {v.vehicleType} • Color: {v.color || "Black"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                          {v.provider?.user?.name || "Registered Provider"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {v.plateNumber || "M-23-NR-448"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            v.verificationStatus === "APPROVED"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {v.verificationStatus || "SUBMITTED"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {v.verificationStatus !== "APPROVED" && (
                          <button
                            onClick={() => handleAction(v.id, "APPROVE", "vehicle")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
