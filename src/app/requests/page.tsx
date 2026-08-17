"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, MessageSquare, PlusCircle, Filter } from "lucide-react";
import { RequestWizardModal } from "@/components/RequestWizardModal";
import { formatDate } from "@/lib/utils";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [filterArea, setFilterArea] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [filterArea]);

  async function fetchRequests() {
    try {
      setLoading(true);
      const url = filterArea ? `/api/requests?area=${encodeURIComponent(filterArea)}` : "/api/requests";
      const res = await fetch(url);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              Service Requests in Northern Ghana
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Browse jobs posted by customers seeking verified artisans, skilled service experts, and local professionals for any task across Northern Ghana.
            </p>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Request</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl mb-8 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter by Area:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {["", "Sakasaka", "Nyohini", "Choggu", "Aboabo", "Dungu"].map((area) => (
              <button
                key={area}
                onClick={() => setFilterArea(area)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  filterArea === area
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                }`}
              >
                {area || "All Tamale Areas"}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        {loading ? (
          <div className="text-center py-12 text-stone-500 text-sm">Loading job requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl text-center border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white mb-2">No Service Requests Found</h3>
            <p className="text-xs text-stone-500 mb-4">Be the first to post a service request in Tamale!</p>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Post Request Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
                      {req.service?.name}
                    </span>
                    <span className="text-xs text-stone-400">&bull;</span>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{req.location?.area}, Tamale</span>
                    </div>
                    <span className="text-xs text-stone-400">&bull;</span>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{req.urgency}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    {req.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-400 pt-2">
                    <span>Posted by {req.customer?.name}</span>
                    <span>&bull;</span>
                    <span>{formatDate(req.createdAt)}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {req.quotes?.length || 0} Quotes Received
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                  <Link
                    href={`/requests/${req.id}`}
                    className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition text-center"
                  >
                    View Request & Submit Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RequestWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
