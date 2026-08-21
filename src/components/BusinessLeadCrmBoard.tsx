"use client";

import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  DollarSign,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { formatGHS, formatDate } from "@/lib/utils";

interface BusinessLeadCrmBoardProps {
  leads: any[];
  incomingCalls: any[];
  whatsappNumber?: string;
  onRefresh: () => void;
}

export function BusinessLeadCrmBoard({
  leads,
  incomingCalls,
  whatsappNumber,
  onRefresh,
}: BusinessLeadCrmBoardProps) {
  const [activeTab, setActiveTab] = useState<"crm" | "incoming">("crm");
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<any>(null);

  // Quote Form State
  const [laborCost, setLaborCost] = useState("");
  const [materialsCost, setMaterialsCost] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("2-3 days");
  const [notes, setNotes] = useState("");
  const [sendingQuote, setSendingQuote] = useState(false);

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/business/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForQuote) return;
    setSendingQuote(true);
    try {
      const res = await fetch("/api/business/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLeadForQuote.id,
          serviceRequestId: selectedLeadForQuote.serviceRequestId,
          laborCost,
          materialsCost,
          estimatedTimeline,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send quote proposal.");

      setSelectedLeadForQuote(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingQuote(false);
    }
  };

  const crmStages = [
    { key: "NEW_INQUIRY", label: "New Inquiry", color: "bg-blue-500" },
    { key: "QUOTE_SENT", label: "Quote Sent", color: "bg-amber-500" },
    { key: "IN_PROGRESS", label: "Work In Progress", color: "bg-purple-500" },
    { key: "COMPLETED", label: "Completed & Invoiced", color: "bg-emerald-500" },
    { key: "DECLINED", label: "Declined", color: "bg-stone-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Dispatch & Lead CRM Center
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">Customer Leads & Gig Pipeline</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Oversee incoming service call dispatches, build itemized quotes, and manage your CRM sales pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("crm")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "crm"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Leads Pipeline ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "incoming"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Community Calls Stream ({incomingCalls.length})
          </button>
        </div>
      </div>

      {/* CRM KANBAN PIPELINE BOARD */}
      {activeTab === "crm" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {crmStages.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);

            return (
              <div
                key={stage.key}
                className="bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 min-w-[240px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white">{stage.label}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageLeads.map((lead) => {
                      const waLink = `https://wa.me/${(lead.customerWhatsApp || lead.customerPhone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${lead.customerName}, following up regarding your lead inquiry on Servora.`
                      )}`;

                      return (
                        <div
                          key={lead.id}
                          className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-stone-900 dark:text-white flex items-center justify-between">
                              <span>{lead.customerName}</span>
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 p-1"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </h5>
                            <span className="text-[10px] text-stone-400 block mt-0.5">{lead.customerPhone}</span>
                          </div>

                          {lead.notes && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 bg-stone-50 dark:bg-stone-900/40 p-2 rounded-xl">
                              {lead.notes}
                            </p>
                          )}

                          {lead.quoteAmount && (
                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              Quote: {formatGHS(lead.quoteAmount)}
                            </div>
                          )}

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between gap-1">
                            {stage.key === "NEW_INQUIRY" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLeadForQuote(lead);
                                  setLaborCost("");
                                  setMaterialsCost("");
                                  setNotes("");
                                }}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold shadow transition-all"
                              >
                                Send Proposal Quote
                              </button>
                            )}

                            {stage.key !== "NEW_INQUIRY" && (
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                className="w-full py-1 px-2 bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg text-[10px] font-bold text-stone-900 dark:text-white"
                              >
                                <option value="NEW_INQUIRY">NEW_INQUIRY</option>
                                <option value="QUOTE_SENT">QUOTE_SENT</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="DECLINED">DECLINED</option>
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className="py-8 text-center text-stone-400 text-[10px]">Empty stage</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMMUNITY CALLS DISPATCH STREAM */}
      {activeTab === "incoming" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingCalls.map((reqCall) => {
            const hasQuoted = reqCall.quotes && reqCall.quotes.length > 0;

            return (
              <div
                key={reqCall.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-bold uppercase">
                      Urgency: {reqCall.urgency || "SAME_DAY"}
                    </span>
                    <h4 className="text-base font-bold text-stone-900 dark:text-white mt-2">{reqCall.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">{reqCall.description}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Budget: {reqCall.budgetMin ? formatGHS(reqCall.budgetMin) : "Open for Quotes"}
                    </span>
                    {reqCall.location && (
                      <span className="text-[10px] text-stone-400 flex items-center justify-end gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {reqCall.location.area}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="text-xs text-stone-500">
                    Posted by <strong className="text-stone-900 dark:text-white">{reqCall.customer?.name || "Community Member"}</strong>
                  </div>

                  {hasQuoted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Proposal Sent
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadForQuote({
                          serviceRequestId: reqCall.id,
                          customerName: reqCall.customer?.name || "Community Customer",
                          customerPhone: reqCall.customer?.phone || "",
                        });
                        setLaborCost("");
                        setMaterialsCost("");
                        setNotes("");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Bid / Send Proposal Quote
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {incomingCalls.length === 0 && (
            <div className="col-span-full py-16 text-center text-stone-400 text-xs">
              No open community service calls available at this moment.
            </div>
          )}
        </div>
      )}

      {/* ITEMIZED QUOTE PROPOSAL BUILDER MODAL */}
      {selectedLeadForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSendQuote}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-base">Itemized Quote Proposal Builder</h3>
                <p className="text-[11px] text-stone-500">Sending to: {selectedLeadForQuote.customerName}</p>
              </div>
              <button type="button" onClick={() => setSelectedLeadForQuote(null)} className="text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Labor Cost (GHS) *</label>
              <input
                type="number"
                required
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="250"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Parts & Materials Cost (GHS)</label>
              <input
                type="number"
                value={materialsCost}
                onChange={(e) => setMaterialsCost(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Estimated Completion Timeline *</label>
              <input
                type="text"
                required
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g. 2-4 hours, 2 days"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Proposal Notes & Customer Terms</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Includes 3-month workmanship warranty, genuine spare parts..."
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-white"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-xs flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
              <span>Total Estimated Quote:</span>
              <span className="text-sm font-black">
                {formatGHS((parseFloat(laborCost || "0") + parseFloat(materialsCost || "0")))}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setSelectedLeadForQuote(null)}
                className="px-4 py-2 text-xs font-bold text-stone-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingQuote}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20"
              >
                {sendingQuote ? "Sending Quote..." : "Dispatch Proposal Quote"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
