"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { Wrench, ArrowLeft } from "lucide-react";

export default function PostServiceRequestPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen py-12 px-4 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center">
      <RequestWizardModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push("/dashboard");
        }}
      />
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black">Post a Service Request</h1>
        <p className="text-stone-500 text-xs">
          Requesting verified quotes from carpenters, electricians, mechanics, and artisans across Tamale.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Open Request Wizard
        </button>
        <div>
          <Link href="/dashboard" className="text-xs text-stone-400 hover:underline">
            ← Return to Customer Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
