"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/lib/toast";
import {
  Activity,
  ShieldAlert,
  Zap,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Lock,
  Flame,
  Radio,
  Clock,
  Send,
  Users,
  Truck,
  CreditCard,
  Building2,
  FileText,
  AlertOctagon,
  Power,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ServiceHealth {
  name: string;
  category: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  responseTimeMs: number;
  lastSuccess: string;
  lastFailure: string | null;
  errorMessage: string | null;
  failureCount: number;
}

interface IncidentItem {
  id: string;
  serviceName: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  errorMessage: string;
  status: "ACTIVE" | "INVESTIGATING" | "RESOLVED";
  createdAt: string;
}

export function AdminSystemHealthHub({ isDark }: { isDark?: boolean }) {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Emergency Controls State
  const [emergencyControls, setEmergencyControls] = useState<Record<string, boolean>>({
    PAUSE_REGISTRATIONS: false,
    PAUSE_DELIVERIES: false,
    PAUSE_PAYMENTS: false,
    PAUSE_ONBOARDING: false,
    DISABLE_INDIVIDUAL_SERVICES: false,
    DISABLE_INDIVIDUAL_PAYMENT_METHODS: false,
    MAINTENANCE_MODE: false,
  });

  // Emergency Control Confirmation Modal State
  const [pendingControlKey, setPendingControlKey] = useState<string | null>(null);
  const [pendingState, setPendingState] = useState<boolean>(false);
  const [controlReason, setControlReason] = useState("");
  const [applyingControl, setApplyingControl] = useState(false);

  useEffect(() => {
    fetchSystemDiagnostics();
    fetchEmergencyControls();
  }, []);

  async function fetchSystemDiagnostics() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      if (res.ok) {
        setHealthData(data);
      }
    } catch {
      console.warn("Failed to query system health diagnostics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchEmergencyControls() {
    try {
      const res = await fetch("/api/admin/emergency-controls");
      const data = await res.json();
      if (res.ok && data.controls) {
        setEmergencyControls(data.controls);
      }
    } catch {
      console.warn("Failed to fetch emergency controls.");
    }
  }

  function handleToggleEmergencyControl(key: string, currentState: boolean) {
    setPendingControlKey(key);
    setPendingState(!currentState);
    setControlReason("");
  }

  async function confirmEmergencyControlToggle() {
    if (!pendingControlKey) return;
    try {
      setApplyingControl(true);
      const res = await fetch("/api/admin/emergency-controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controlKey: pendingControlKey,
          isEnabled: pendingState,
          reason: controlReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmergencyControls((prev) => ({
          ...prev,
          [pendingControlKey]: pendingState,
        }));
        toast.warning("Emergency Control Toggled 🚨", `Control ${pendingControlKey} is now ${pendingState ? "Active" : "Disabled"}.`);
        setPendingControlKey(null);
        fetchSystemDiagnostics();
      } else {
        toast.error("Control Update Failed", data.error || "Emergency control update failed.");
      }
    } catch {
      toast.error("Network Error", "Failed to update emergency control.");
    } finally {
      setApplyingControl(false);
    }
  }

  const controlDescriptions: Record<string, { label: string; warning: string; impact: string }> = {
    PAUSE_REGISTRATIONS: {
      label: "Pause New Customer & Provider Registrations",
      warning: "This will immediately block all new user account signups on Servora.",
      impact: "New customers and providers attempting to register will receive a 503 Paused notice.",
    },
    PAUSE_DELIVERIES: {
      label: "Pause New Delivery Orders & Dispatch",
      warning: "This will immediately halt new package delivery request submissions.",
      impact: "Customers cannot create new delivery dispatch orders. Ongoing deliveries remain active.",
    },
    PAUSE_PAYMENTS: {
      label: "Pause Mobile Money & Card Payments",
      warning: "This will immediately block payment checkout and MoMo escrow releases.",
      impact: "No new payment transactions can be processed until restored.",
    },
    PAUSE_ONBOARDING: {
      label: "Pause Provider & Artisan Onboarding",
      warning: "This will pause provider registration submissions & Ghana Card onboarding.",
      impact: "New service providers cannot submit onboarding applications.",
    },
    DISABLE_INDIVIDUAL_SERVICES: {
      label: "Disable High-Risk Individual Services",
      warning: "Selectively disables specific service calls (e.g. High Voltage Electrical).",
      impact: "Customers cannot request disabled service categories.",
    },
    DISABLE_INDIVIDUAL_PAYMENT_METHODS: {
      label: "Disable Specific Mobile Money Gateways",
      warning: "Temporarily disables specific payment channels (e.g. Telecel Cash or AT Money).",
      impact: "Disables selected gateway while keeping primary MTN MoMo active.",
    },
    MAINTENANCE_MODE: {
      label: "Enable Full Platform Maintenance Mode",
      warning: "CRITICAL: Restricts the entire platform to Master Administrators only.",
      impact: "All public routes show a system maintenance splash screen.",
    },
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> Operations & System Health Command Center
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Real-time server diagnostics, database query latency, Mobile Money gateway ping, and Master Admin emergency controls.
          </p>
        </div>

        <button
          onClick={fetchSystemDiagnostics}
          disabled={refreshing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Run System Diagnostics ⚡
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LIVE OPERATIONAL METRICS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Active Users", value: healthData?.liveMetrics?.activeUsers || 0, icon: Users, color: "text-blue-500" },
          { label: "Providers Online", value: healthData?.liveMetrics?.providersOnline || 0, icon: Building2, color: "text-emerald-500" },
          { label: "Active Deliveries", value: healthData?.liveMetrics?.activeDeliveries || 0, icon: Truck, color: "text-amber-500" },
          { label: "Pending Orders", value: healthData?.liveMetrics?.pendingDeliveries || 0, icon: Clock, color: "text-purple-500" },
          { label: "Failed Txns", value: healthData?.liveMetrics?.failedTransactions || 0, icon: CreditCard, color: "text-rose-500" },
          { label: "Failed Notifs", value: healthData?.liveMetrics?.failedNotifications || 0, icon: Send, color: "text-indigo-500" },
          { label: "Failed Jobs", value: healthData?.liveMetrics?.failedBackgroundJobs || 0, icon: Server, color: "text-teal-500" },
          { label: "Critical Errors", value: healthData?.liveMetrics?.recentCriticalErrors || 0, icon: AlertOctagon, color: "text-red-500" },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[10px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400">{m.label}</span>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className="text-lg font-black text-stone-900 dark:text-white font-mono">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 12-SERVICE REAL SYSTEM HEALTH MATRIX */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" /> Infrastructure & Service Health Monitor (12 Services)
          </h3>
          <span className="text-[11px] font-mono text-stone-400">
            Overall Status:{" "}
            <strong
              className={`font-black uppercase ${
                healthData?.overallStatus === "HEALTHY"
                  ? "text-emerald-500"
                  : healthData?.overallStatus === "DEGRADED"
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}
            >
              {healthData?.overallStatus || "HEALTHY"}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-stone-400 font-bold bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              Running Diagnostic Pings Across Infrastructure...
            </div>
          ) : (
            healthData?.services?.map((serv: ServiceHealth, idx: number) => (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-900 dark:text-white">{serv.name}</span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${
                        serv.status === "HEALTHY"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                          : serv.status === "DEGRADED"
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {serv.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono block">Category: {serv.category}</span>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-500">Response Latency:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{serv.responseTimeMs} ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MASTER ADMIN EMERGENCY CONTROLS PANEL */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-950 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h3 className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Master Admin Emergency System Controls
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Persisted in PostgreSQL. Toggling immediately affects backend APIs, writes immutable Audit Logs, and alerts administrators.
            </p>
          </div>
          <span className="px-3 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-mono font-black rounded-full uppercase">
            MASTER ADMIN RESTRICTED 🔒
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {Object.entries(controlDescriptions).map(([key, desc]) => {
            const isCurrentlyActive = !!emergencyControls[key];
            return (
              <div
                key={key}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isCurrentlyActive
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800"
                    : "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-stone-900 dark:text-white">{desc.label}</span>
                    {isCurrentlyActive && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white animate-pulse">
                        PAUSED / ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">{desc.warning}</p>
                </div>

                <button
                  onClick={() => handleToggleEmergencyControl(key, isCurrentlyActive)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 shadow-xs ${
                    isCurrentlyActive
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  {isCurrentlyActive ? "Restore Service" : "Pause System"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EMERGENCY CONTROL CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {pendingControlKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertOctagon className="w-5 h-5" /> Confirm Master Admin Emergency Control
              </h3>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-stone-900 dark:text-white block">
                Target Action: {controlDescriptions[pendingControlKey]?.label}
              </span>
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-3 rounded-2xl border border-rose-200 dark:border-rose-800 leading-relaxed font-semibold">
                ⚠️ {controlDescriptions[pendingControlKey]?.impact}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                Reason for Audit Log (Mandatory):
              </label>
              <input
                type="text"
                value={controlReason}
                onChange={(e) => setControlReason(e.target.value)}
                placeholder="Example: High traffic spike / Gateway maintenance / Fraud mitigation"
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-medium outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setPendingControlKey(null)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={applyingControl || !controlReason.trim()}
                onClick={confirmEmergencyControlToggle}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs rounded-xl cursor-pointer shadow-md transition"
              >
                Confirm & Apply Control ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
