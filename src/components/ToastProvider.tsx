"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastMessage } from "@/lib/toast";
import { CheckCircle2, AlertTriangle, Info, Bell, X } from "lucide-react";

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration);
      }
    });

    return () => unsubscribe();
  }, []);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((t) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        let borderClass = "border-emerald-500/30 dark:border-emerald-500/30";
        let bgGlow = "bg-emerald-500/10";
        let titleColor = "text-emerald-950 dark:text-emerald-200";

        if (t.type === "error") {
          icon = <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = "border-rose-500/30 dark:border-rose-500/30";
          bgGlow = "bg-rose-500/10";
          titleColor = "text-rose-950 dark:text-rose-200";
        } else if (t.type === "warning") {
          icon = <Bell className="w-5 h-5 text-amber-500 shrink-0" />;
          borderClass = "border-amber-500/30 dark:border-amber-500/30";
          bgGlow = "bg-amber-500/10";
          titleColor = "text-amber-950 dark:text-amber-200";
        } else if (t.type === "info") {
          icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          borderClass = "border-blue-500/30 dark:border-blue-500/30";
          bgGlow = "bg-blue-500/10";
          titleColor = "text-blue-950 dark:text-blue-200";
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border ${borderClass} rounded-2xl shadow-2xl flex items-start justify-between gap-3 text-xs transition-all animate-in slide-in-from-top-4 fade-in duration-200`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${bgGlow} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <div className="space-y-0.5 pt-0.5">
                <h4 className={`font-black text-sm tracking-tight ${titleColor}`}>
                  {t.title}
                </h4>
                {t.description && (
                  <p className="text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
