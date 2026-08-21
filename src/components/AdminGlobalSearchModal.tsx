"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Users,
  Building2,
  Truck,
  ShoppingBag,
  Wrench,
  Scale,
  ShieldCheck,
  CreditCard,
  FileText,
  X,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Activity,
  PhoneCall,
  MapPin,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface GlobalSearchItem {
  id: string;
  entityType: string;
  title: string;
  subtitle: string;
  details: string;
  badgeColor: string;
  rawRecord: any;
}

export function AdminGlobalSearchModal({
  isOpen,
  onClose,
  onSelectView,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (viewId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GlobalSearchItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedRecord(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/search/global?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (res.ok && data.results) {
          setResults(data.results);
        }
      } catch {
        console.warn("Global Search error.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-20 p-4">
      <div className="fixed inset-0 bg-zinc-950/75 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-900 dark:text-white animate-in fade-in zoom-in-95 duration-150 font-sans">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
          <Search className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across entire Servora platform (e.g. John Mensah, DEL-10482, TXN-82931, Ghana Card)..."
            className="w-full bg-transparent text-sm outline-none placeholder-stone-400 font-semibold text-stone-900 dark:text-white"
          />
          {query && (
            <button onClick={() => setQuery("")} className="mr-2 text-stone-400 hover:text-stone-600 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2 text-xs">
          {loading ? (
            <div className="py-12 text-center text-stone-400 font-bold">
              Searching PostgreSQL Database Across All 13 Entities...
            </div>
          ) : !query.trim() ? (
            <div className="p-8 text-center text-stone-400 font-medium space-y-1">
              <p>Type a customer name, delivery ID, transaction ref, or Ghana Card to search.</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Examples: "John Mensah", "DEL-10482", "TXN-82931", "GHA-72109845-2"
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-stone-400 font-medium">
              No matching records found for "{query}".
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item)}
                className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase ${item.badgeColor}`}>
                      {item.entityType}
                    </span>
                    <span className="font-extrabold text-stone-900 dark:text-white text-xs">{item.title}</span>
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 font-medium">{item.subtitle}</div>
                  <div className="text-[10px] text-stone-400 font-mono">{item.details}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <span>Servora Unified Master Admin Global Search</span>
          <span>13 Entity Index Sync</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RICH ENTITY RECORD INSPECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-stone-900 dark:text-white relative font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${selectedRecord.badgeColor}`}>
                  {selectedRecord.entityType} RECORD INSPECTION
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-2 py-1 text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                Close (X)
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900 dark:text-white">{selectedRecord.title}</h3>
              <p className="text-xs text-stone-500 font-mono">{selectedRecord.subtitle}</p>
            </div>

            {/* Complete Raw Payload Details */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2 text-xs font-mono overflow-x-auto max-h-60">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Complete Record Attributes:</span>
              <pre className="text-[11px] leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                {JSON.stringify(selectedRecord.rawRecord, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  onClose();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer text-center"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
