"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminDeliveryManagementHub } from "@/components/AdminDeliveryManagementHub";

export default function AdminDeliveryControlPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 space-y-6 text-slate-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Master Admin Dashboard
        </Link>

        <AdminDeliveryManagementHub />
      </div>
    </div>
  );
}
