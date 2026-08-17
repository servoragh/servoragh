"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Briefcase, PlusCircle, ShieldCheck, Clock, CheckCircle2, MessageSquare, ExternalLink, Camera, Save, Copy, Check } from "lucide-react";
import { UnifiedMessagingHub } from "@/components/UnifiedMessagingHub";
import { formatGHS, formatDate } from "@/lib/utils";

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"requests" | "messages" | "profile">("requests");
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Fetch user's requests
        const reqRes = await fetch("/api/requests");
        const reqData = await reqRes.json();
        if (reqData.requests) setRequests(reqData.requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUserProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      });

      if (!res.ok) throw new Error("Failed to update profile.");
      setSavedSuccess(true);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-stone-500">Loading your dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Please Log In</h2>
        <p className="text-stone-500 text-sm mb-4">You must be logged in to view your dashboard.</p>
        <Link href="/login" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl">
          Log In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-stone-50 dark:bg-stone-950 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-2xl flex items-center justify-center border border-emerald-300 overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-stone-900 dark:text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Phone: {user.phone} &bull; Referral Code: <code className="font-mono text-emerald-600 font-bold">{user.referralCode}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "PROVIDER" && user.providerProfile && (
              <Link
                href={`/provider/${user.providerProfile.slug}`}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>My Public Business Storefront</span>
              </Link>
            )}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "requests"
                ? "bg-emerald-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            My Job Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "messages"
                ? "bg-emerald-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages & Support Inbox</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-emerald-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile & Avatar Settings ⚙️</span>
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">Activity & Jobs</h2>

            {requests.length === 0 ? (
              <p className="text-xs text-stone-500">No active job requests yet.</p>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => (
                  <div key={r.id} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">{r.title}</h4>
                      <p className="text-xs text-stone-500">{r.service?.name} &bull; {r.location?.area} &bull; Status: {r.status}</p>
                    </div>
                    <Link href={`/requests/${r.id}`} className="text-xs font-bold text-emerald-600 hover:underline">
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <UnifiedMessagingHub
              currentUserId={user.id}
              currentUserRole={user.role}
            />
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">Personal Profile & Avatar Settings</h2>
                <p className="text-xs text-stone-500">Upload your profile photo and manage account details.</p>
              </div>
              {savedSuccess && (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveUserProfile} className="space-y-6">
              {/* Avatar Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="relative w-20 h-20 rounded-2xl bg-emerald-600 text-white font-black text-3xl flex items-center justify-center overflow-hidden shrink-0 border-2 border-emerald-500">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    name.charAt(0) || "U"
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="font-bold text-stone-900 dark:text-white">Profile Avatar / Photo</h4>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      type="text"
                      placeholder="https://... or upload photo"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="p-2.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white outline-none flex-1 max-w-sm"
                    />
                    <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Camera className="w-4 h-4" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const d = await res.json();
                            if (d.url) setAvatarUrl(d.url);
                          } catch {
                            alert("Photo upload failed.");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white font-bold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={user.phone}
                    disabled
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-stone-500 font-bold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
