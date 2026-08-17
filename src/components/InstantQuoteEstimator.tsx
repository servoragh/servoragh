"use client";

import React, { useState } from "react";
import { Calculator, Zap, ArrowRight, ShieldCheck, Tag, Clock } from "lucide-react";
import { formatGHS } from "@/lib/utils";

const ESTIMATOR_DATA: Record<string, { min: number; max: number; unit: string; time: string }> = {
  "Electrical & Solar": { min: 80, max: 250, unit: "per service call", time: "1 - 3 hours" },
  "AC & Fridge Repair": { min: 100, max: 350, unit: "per diagnostic & repair", time: "2 - 4 hours" },
  "Plumbing & Water Systems": { min: 70, max: 220, unit: "per fixture", time: "1 - 2 hours" },
  "Device & Phone Repair": { min: 50, max: 180, unit: "per device screen/part", time: "30 - 90 mins" },
  "Fugu & Smock Tailoring": { min: 120, max: 450, unit: "per custom smock", time: "2 - 5 days" },
  "Tool & Heavy Equipment": { min: 95, max: 300, unit: "per daily rental", time: "Immediate" },
  "Other / Custom Service": { min: 60, max: 200, unit: "starting estimate", time: "Same day" },
};

interface InstantQuoteEstimatorProps {
  onApplyEstimate?: (estimatedBudget: number) => void;
}

export function InstantQuoteEstimator({ onApplyEstimate }: InstantQuoteEstimatorProps) {
  const [selectedCategory, setSelectedCategory] = useState("Electrical & Solar");
  const [jobScope, setJobScope] = useState<"minor" | "standard" | "major">("standard");
  const [urgency, setUrgency] = useState<"standard" | "urgent" | "emergency">("standard");

  const baseData = ESTIMATOR_DATA[selectedCategory] || ESTIMATOR_DATA["Other / Custom Service"];

  // Multiplier logic
  const scopeMultiplier = jobScope === "minor" ? 0.75 : jobScope === "major" ? 1.6 : 1.0;
  const urgencyMultiplier = urgency === "urgent" ? 1.25 : urgency === "emergency" ? 1.5 : 1.0;

  const estimatedMin = Math.round(baseData.min * scopeMultiplier * urgencyMultiplier);
  const estimatedMax = Math.round(baseData.max * scopeMultiplier * urgencyMultiplier);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-white space-y-6">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-white">Instant Service Price Estimator</h3>
            <p className="text-xs text-stone-400">Algorithmic Northern Ghana rate guidance</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full text-[10px] font-bold">
          LIVE RATES 🇬🇭
        </span>
      </div>

      <div className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-stone-300 font-bold mb-1.5 text-xs">Select Service Type</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-white font-bold outline-none text-xs"
          >
            {Object.keys(ESTIMATOR_DATA).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Scope & Urgency Toggles */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-stone-300 font-bold mb-1.5 text-xs">Job Complexity</label>
            <div className="grid grid-cols-3 gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setJobScope("minor")}
                className={`py-1.5 rounded-lg transition ${
                  jobScope === "minor" ? "bg-emerald-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Minor
              </button>
              <button
                type="button"
                onClick={() => setJobScope("standard")}
                className={`py-1.5 rounded-lg transition ${
                  jobScope === "standard" ? "bg-emerald-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setJobScope("major")}
                className={`py-1.5 rounded-lg transition ${
                  jobScope === "major" ? "bg-emerald-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Major
              </button>
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-bold mb-1.5 text-xs">Urgency Level</label>
            <div className="grid grid-cols-3 gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 text-[11px] font-bold text-center">
              <button
                type="button"
                onClick={() => setUrgency("standard")}
                className={`py-1.5 rounded-lg transition ${
                  urgency === "standard" ? "bg-emerald-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setUrgency("urgent")}
                className={`py-1.5 rounded-lg transition ${
                  urgency === "urgent" ? "bg-amber-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setUrgency("emergency")}
                className={`py-1.5 rounded-lg transition ${
                  urgency === "emergency" ? "bg-rose-600 text-white" : "text-stone-400 hover:text-white"
                }`}
              >
                Immediate
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-stone-800 to-emerald-950/80 border border-emerald-700/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-stone-300 text-xs">
            <span>Estimated Northern Fair Rate:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Clock className="w-3.5 h-3.5" /> Est. {baseData.time}
            </span>
          </div>

          <div className="text-3xl font-black text-emerald-400 tracking-tight flex items-baseline gap-2">
            <span>
              {formatGHS(estimatedMin)} – {formatGHS(estimatedMax)}
            </span>
            <span className="text-xs font-normal text-stone-400">/ {baseData.unit}</span>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Includes labor & standard diagnostic inspection across Northern Region.</span>
          </div>
        </div>
      </div>

      {onApplyEstimate && (
        <button
          onClick={() => onApplyEstimate(Math.round((estimatedMin + estimatedMax) / 2))}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>Use Estimated Budget ({formatGHS(Math.round((estimatedMin + estimatedMax) / 2))})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
