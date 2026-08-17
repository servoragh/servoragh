import React from "react";
import { CheckCircle2, ShieldCheck, Award, Zap, Clock, Star } from "lucide-react";

interface TrustBadgeProps {
  type: "PHONE_VERIFIED" | "IDENTITY_VERIFIED" | "BUSINESS_VERIFIED" | "TOP_RATED" | "FAST_RESPONDER" | "EXPERIENCED";
  size?: "sm" | "md";
}

export function TrustBadge({ type, size = "md" }: TrustBadgeProps) {
  const configs = {
    PHONE_VERIFIED: {
      label: "Phone Verified",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    IDENTITY_VERIFIED: {
      label: "ID Verified",
      color: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      icon: ShieldCheck,
    },
    BUSINESS_VERIFIED: {
      label: "Business Verified",
      color: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      icon: Award,
    },
    TOP_RATED: {
      label: "Top Rated Artisan",
      color: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800",
      icon: Star,
    },
    FAST_RESPONDER: {
      label: "Fast Responder",
      color: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      icon: Zap,
    },
    EXPERIENCED: {
      label: "Experienced",
      color: "bg-stone-100 text-stone-900 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
      icon: Clock,
    },
  };

  const config = configs[type] || configs.PHONE_VERIFIED;
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs sm:text-sm gap-1.5";

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${config.color} ${sizeClasses}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
