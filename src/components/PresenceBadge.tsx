"use client";

import React, { useEffect, useState } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { formatRelativeTime } from "@/lib/timeFormatter";

interface PresenceBadgeProps {
  businessSlug?: string;
  userId?: string;
  initialIsOnline?: boolean;
  initialLastSeen?: string | Date | null;
  businessHours?: any;
  showHours?: boolean;
}

export function PresenceBadge({
  businessSlug,
  userId,
  initialIsOnline = false,
  initialLastSeen,
  businessHours,
  showHours = true,
}: PresenceBadgeProps) {
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const [lastSeen, setLastSeen] = useState<string | Date | null>(initialLastSeen || null);

  useEffect(() => {
    async function checkPresence() {
      if (!businessSlug && !userId) return;
      try {
        const param = businessSlug ? `businessSlug=${businessSlug}` : `userId=${userId}`;
        const res = await fetch(`/api/presence/status?${param}`);
        const data = await res.json();
        if (data.success) {
          setIsOnline(data.isOnlineNow);
          setLastSeen(data.lastSeen);
        }
      } catch (_) {}
    }

    checkPresence();
    const interval = setInterval(checkPresence, 30000); // Re-check presence every 30s
    return () => clearInterval(interval);
  }, [businessSlug, userId]);

  const relativeTime = lastSeen ? formatRelativeTime(lastSeen) : null;

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      {/* Real Online Presence Status Indicator */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
          isOnline
            ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline ? "bg-emerald-500" : "bg-stone-400"
            }`}
          ></span>
        </span>
        <span>{isOnline ? "Online now" : relativeTime ? `Active ${relativeTime}` : "Offline"}</span>
      </div>

      {/* Business Hours co-existing badge */}
      {showHours && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
          <Clock className="w-3 h-3 text-emerald-500" />
          <span>Open today</span>
        </div>
      )}
    </div>
  );
}
