"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Upload,
  ShieldAlert,
  Bot,
  UserCheck,
  Building2,
  Truck,
  Scale,
  Search,
  CheckCheck,
  Paperclip,
  Lock,
  EyeOff,
  AlertCircle,
  PlusCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatGHS, formatDate } from "@/lib/utils";

interface UnifiedMessagingHubProps {
  currentUserId: string;
  currentUserRole: "CUSTOMER" | "PROVIDER" | "ADMIN";
  initialScope?: string;
}

export function UnifiedMessagingHub({
  currentUserId,
  currentUserRole,
  initialScope,
}: UnifiedMessagingHubProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomData, setActiveRoomData] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [activeScopeFilter, setActiveScopeFilter] = useState<string>(initialScope || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [sending, setSending] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, [activeScopeFilter]);

  useEffect(() => {
    if (activeRoomId) {
      fetchRoomDetails(activeRoomId);
    }
  }, [activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoomData?.messages]);

  async function fetchRooms() {
    try {
      setLoadingRooms(true);
      const scopeParam = activeScopeFilter !== "all" ? `?scope=${activeScopeFilter}` : "";
      const res = await fetch(`/api/chat/rooms${scopeParam}`);
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms || []);
        if (data.rooms && data.rooms.length > 0 && !activeRoomId) {
          setActiveRoomId(data.rooms[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  }

  async function fetchRoomDetails(roomId: string) {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveRoomData(data.room);
      }
    } catch (err) {
      console.error("Failed to load room details:", err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!messageInput.trim() && !attachmentUrl) || !activeRoomId || sending) return;

    setSending(true);
    setModerationWarning(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: activeRoomId,
          content: messageInput,
          attachments: attachmentUrl ? JSON.stringify([attachmentUrl]) : null,
          isInternalNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.warning) {
          setModerationWarning(data.error || "Message blocked by automated safety policy.");
        } else {
          alert(data.error || "Failed to send message.");
        }
        return;
      }

      setMessageInput("");
      setAttachmentUrl("");
      fetchRoomDetails(activeRoomId);
      fetchRooms();
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  }

  const filteredRooms = rooms.filter((r) => {
    const matchesScope = activeScopeFilter === "all" || r.scope === activeScopeFilter;
    const matchesSearch =
      !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.participants.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesScope && matchesSearch;
  });

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "C2B":
        return { label: "Buyer ↔ Vendor", icon: MessageSquare, color: "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
      case "C2ADMIN_SUPPORT":
        return { label: "Helpdesk Ticket", icon: UserCheck, color: "bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/30" };
      case "B2ADMIN":
        return { label: "Merchant Ops", icon: Building2, color: "bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-500/30" };
      case "B2B_WHOLESALE":
        return { label: "Wholesale B2B", icon: Sparkles, color: "bg-amber-600/20 text-amber-600 dark:text-amber-400 border-amber-500/30" };
      case "DISPUTE_MEDIATION":
        return { label: "3-Way Dispute", icon: Scale, color: "bg-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500/30" };
      case "LOGISTICS_COURIER":
        return { label: "Courier Order", icon: Truck, color: "bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" };
      case "BOT_HELP":
        return { label: "AI Bot Triage", icon: Bot, color: "bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" };
      default:
        return { label: scope, icon: MessageSquare, color: "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700" };
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs h-[720px] flex flex-col md:flex-row text-stone-900 dark:text-white text-xs">
      {/* LEFT PANEL: CHANNELS & INBOX LIST */}
      <div className="w-full md:w-80 border-r border-stone-200 dark:border-stone-800 flex flex-col bg-stone-50 dark:bg-stone-950/60">
        {/* Header & Filter Scope Pills */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <span>Messaging Channels</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              {rooms.length} Active
            </span>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700/60 shadow-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-stone-900 dark:text-white placeholder-stone-400 outline-none w-full font-medium"
            />
          </div>

          {/* Channel Scope Filters */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: "all", label: "All" },
              { id: "C2B", label: "Store" },
              { id: "C2ADMIN_SUPPORT", label: "Support" },
              { id: "B2B_WHOLESALE", label: "Wholesale" },
              { id: "DISPUTE_MEDIATION", label: "Disputes" },
              { id: "LOGISTICS_COURIER", label: "Courier" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveScopeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                  activeScopeFilter === f.id
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-200 dark:bg-stone-850 text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-200 dark:divide-stone-850/60">
          {loadingRooms ? (
            <div className="p-8 text-center text-stone-500">Loading messaging threads...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-stone-500">No active conversations found.</div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              const badge = getScopeBadge(room.scope);
              const BadgeIcon = badge.icon;
              const otherParticipant = room.participants.find((p: any) => p.id !== currentUserId) || room.participants[0];

              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-3.5 transition flex items-start gap-3 cursor-pointer ${
                    isActive ? "bg-emerald-50 dark:bg-stone-850 border-l-4 border-emerald-600 dark:border-emerald-500" : "hover:bg-stone-100 dark:hover:bg-stone-900"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-white font-bold flex items-center justify-center shrink-0 border border-stone-300 dark:border-stone-700">
                    {otherParticipant?.name?.charAt(0) || "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-stone-900 dark:text-white text-xs truncate">
                        {otherParticipant?.name || room.title}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-emerald-600 text-white font-black text-[10px] rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${badge.color}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {room.lastMessage ? room.lastMessage.content : "Tap to open thread..."}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: MAIN CHAT CONVERSATION WORKSPACE */}
      <div className="flex-1 flex flex-col bg-white dark:bg-stone-900">
        {activeRoomData ? (
          <>
            {/* Active Thread Header */}
            <div className="p-4 bg-stone-50 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">{activeRoomData.title || "Conversation Thread"}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      getScopeBadge(activeRoomData.scope).color
                    }`}
                  >
                    {getScopeBadge(activeRoomData.scope).label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Channel ID: {activeRoomData.id.slice(0, 13)} &bull; End-to-End Encrypted Marketplace Layer
                </p>
              </div>

              {currentUserRole === "ADMIN" && (
                <button
                  onClick={() => setIsInternalNote(!isInternalNote)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    isInternalNote ? "bg-amber-600 text-white" : "bg-stone-200 dark:bg-stone-800 text-amber-600 dark:text-amber-400 border border-amber-600/40"
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>{isInternalNote ? "Staff Internal Mode" : "Public Mode"}</span>
                </button>
              )}
            </div>

            {/* Moderation Alert Banner */}
            {moderationWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{moderationWarning}</span>
                </div>
                <button onClick={() => setModerationWarning(null)} className="font-bold text-stone-900 dark:text-white hover:underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-925">
              {activeRoomData.messages?.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                const isNote = msg.isInternalNote;

                let attachments: string[] = [];
                try {
                  attachments = JSON.parse(msg.attachments || "[]");
                } catch {}

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl space-y-1.5 ${
                        isNote
                          ? "bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80"
                          : isMe
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-bl-none"
                      }`}
                    >
                      {/* Sender Name */}
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-semibold">
                        <span>{isNote ? "🔒 Internal Staff Note" : msg.sender?.name || "User"}</span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>

                      {/* Message Content */}
                      <p className="text-xs leading-relaxed whitespace-pre-line">{msg.content}</p>

                      {/* Attachment Photo */}
                      {attachments.length > 0 && (
                        <div className="pt-2">
                          <img
                            src={attachments[0]}
                            alt="Attachment"
                            className="max-h-48 rounded-xl object-cover border border-stone-300 dark:border-stone-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 space-y-2">
              {isInternalNote && (
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Posting as private staff note (hidden from customer & vendor)
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isInternalNote ? "Write staff-only note..." : "Type message..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 p-3 bg-white dark:bg-stone-900 text-stone-900 dark:text-white placeholder-stone-400 rounded-2xl outline-none border border-stone-300 dark:border-stone-700 font-medium"
                />

                {/* Upload Image Button */}
                <label className="p-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl cursor-pointer border border-stone-300 dark:border-stone-700 shrink-0">
                  <Upload className="w-4 h-4" />
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
                        const data = await res.json();
                        if (data.url) setAttachmentUrl(data.url);
                      } catch {
                        alert("Image upload failed.");
                      }
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </div>

              {attachmentUrl && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Paperclip className="w-3 h-3" /> Photo attached! Click send to include image.
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500">
            <MessageSquare className="w-12 h-12 mb-3 text-stone-400 dark:text-stone-700" />
            <h4 className="text-base font-bold text-stone-900 dark:text-white mb-1">Select a Channel to Start Chatting</h4>
            <p className="text-xs max-w-sm">
              Connect with buyers, vendors, couriers, or platform helpdesk support in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
