"use client";

import React, { useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";

interface CsvImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImporterModal({ isOpen, onClose, onSuccess }: CsvImporterModalProps) {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleImport() {
    if (!csvText.trim()) {
      setError("Please paste CSV data or sample records.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse CSV simple parser
      const lines = csvText.trim().split("\n");
      const records = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || "Artisan",
          phone: parts[1] || `+233${Math.floor(100000000 + Math.random() * 900000000)}`,
          businessName: parts[2] || `${parts[0] || "Tamale"} Services`,
          serviceArea: parts[3] || "Sakasaka, Tamale Central",
          yearsExperience: Number(parts[4]) || 3,
        };
      });

      const res = await fetch("/api/admin/import-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providersData: records }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");

      setResult(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sampleCsv = `Kwame Mensah, +233244889901, Kwame Electric Sakasaka, Sakasaka, 5
Fuseini Ibrahim, +233209988772, Fuseini Phone Repairs, Sakasaka Hub, 6
Hajia Fatima, +233245554434, Northern Grace Fugu, Aboabo Market, 10
Alhassan Yakubu, +233556677881, Yakubu Plumbing, Choggu, 4`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-lg text-stone-900 dark:text-white">CSV Artisan Importer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-3">
          Paste CSV lines formatted as: <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-emerald-600 font-mono">Name, Phone, BusinessName, ServiceArea, ExperienceYears</code>
        </p>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Successfully imported {result.importedCount} service artisans into Tamale!</span>
          </div>
        )}

        <textarea
          rows={6}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={`Or click "Use Sample CSV" below...`}
          className="w-full p-3 font-mono text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none mb-3"
        />

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCsvText(sampleCsv)}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Use Sample CSV
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:underline"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              {loading ? "Importing..." : "Batch Import Artisans"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
