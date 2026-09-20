"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building2,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { toast } from "@/lib/toast";

interface DemoAccount {
  id: "customer" | "provider" | "admin";
  roleName: string;
  roleLabel: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  destination: string;
  badgeColor: string;
  borderColor: string;
  activeColor: string;
  icon: React.ElementType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "customer",
    roleName: "CUSTOMER",
    roleLabel: "Customer / Buyer",
    name: "Amina Abdul-Rahman",
    email: "amina@gmail.com",
    phone: "+233241112233",
    password: "password123",
    destination: "/dashboard (Customer Hub)",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    borderColor: "hover:border-emerald-500/60 dark:hover:border-emerald-500/60",
    activeColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    icon: User,
  },
  {
    id: "provider",
    roleName: "PROVIDER",
    roleLabel: "Artisan / Business Seller",
    name: "Kwame Electrical & AC",
    email: "kwame.electric@gmail.com",
    phone: "+233244889900",
    password: "password123",
    destination: "/business/portal (Provider Portal)",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    borderColor: "hover:border-amber-500/60 dark:hover:border-amber-500/60",
    activeColor: "bg-amber-600 hover:bg-amber-700 text-white",
    icon: Building2,
  },
  {
    id: "admin",
    roleName: "ADMIN",
    roleLabel: "Super Admin",
    name: "Servora Master Admin",
    email: "admin@servora.gh",
    phone: "+233240000000",
    password: "admin12345",
    destination: "/admin (Admin Console)",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    borderColor: "hover:border-purple-500/60 dark:hover:border-purple-500/60",
    activeColor: "bg-purple-600 hover:bg-purple-700 text-white",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authenticatingId, setAuthenticatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"customer" | "provider">("customer");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function performLogin(targetPhoneOrEmail: string, targetPassword: string, demoId?: string) {
    setLoading(true);
    if (demoId) setAuthenticatingId(demoId);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: targetPhoneOrEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      toast.success("Welcome Back! 👋", `Logged in as ${data.user?.name || "User"}. Redirecting...`);

      setTimeout(() => {
        if (data.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else if (data.user?.role === "PROVIDER") {
          window.location.href = "/business/portal";
        } else {
          window.location.href = "/dashboard";
        }
      }, 400);
    } catch (err: any) {
      setError(err.message);
      toast.error("Login Failed", err.message || "Please check credentials.");
    } finally {
      setLoading(false);
      setAuthenticatingId(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(phoneOrEmail, password);
  }

  function handleFillCredentials(account: DemoAccount) {
    setPhoneOrEmail(account.email);
    setPassword(account.password);
    if (account.id === "provider") {
      setAccountType("provider");
    } else {
      setAccountType("customer");
    }
    toast.info("Credentials Filled", `Filled ${account.roleLabel} login info into the form.`);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info("Copied to Clipboard", text);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="py-6 sm:py-12 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-center p-3 sm:p-4 min-h-[calc(100vh-140px)] transition-colors duration-200">
      <div className="bg-white/95 dark:bg-stone-900/95 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            Log in to Servora<span className="text-emerald-600 dark:text-emerald-400">.gh</span>
          </h1>
          <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
            NORTHERN MARKETPLACE & ARTISAN TRADE HUB
          </p>
        </div>

        {/* ⚡ Quick 1-Click Demo Login Box */}
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-emerald-50/20 to-stone-100 dark:from-stone-800/80 dark:via-emerald-950/20 dark:to-stone-800/40 border border-emerald-200/80 dark:border-emerald-800/50 shadow-inner">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>Easy 1-Click Login Details (All User Types)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Ready to Test
            </span>
          </div>

          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isAuthenticating = authenticatingId === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`p-3 rounded-xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${acc.borderColor}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-stone-900 dark:text-white">
                          {acc.name}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${acc.badgeColor}`}>
                          {acc.roleLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 dark:text-stone-400 font-mono flex-wrap">
                        <button
                          type="button"
                          onClick={() => copyText(acc.email, `${acc.id}-email`)}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                          title="Click to copy email"
                        >
                          <span>{acc.email}</span>
                          {copiedKey === `${acc.id}-email` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => copyText(acc.password, `${acc.id}-pwd`)}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                          title="Click to copy password"
                        >
                          <span>pwd: {acc.password}</span>
                          {copiedKey === `${acc.id}-pwd` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleFillCredentials(acc)}
                      disabled={loading}
                      className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition cursor-pointer disabled:opacity-50"
                      title="Fill email and password into form below"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => performLogin(acc.email, acc.password, acc.id)}
                      disabled={loading}
                      className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 ${acc.activeColor}`}
                    >
                      {isAuthenticating ? (
                        <span>Logging in...</span>
                      ) : (
                        <>
                          <span>1-Click Login</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
            or sign in with credentials
          </span>
          <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
        </div>

        {/* Account Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl mb-4 text-xs font-bold border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setAccountType("customer")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              accountType === "customer"
                ? "bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Customer / Buyer
          </button>
          <button
            type="button"
            onClick={() => setAccountType("provider")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              accountType === "provider"
                ? "bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Business / Seller
          </button>
        </div>

        {/* Social Authentication Buttons */}
        <SocialAuthButtons actionLabel="Sign in" />

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Phone Number or Email
            </label>
            <input
              type="text"
              placeholder={accountType === "provider" ? "kwame.electric@gmail.com or +233244889900" : "amina@gmail.com or admin@servora.gh"}
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Password
              </label>
              <a href="#" className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-11 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && !authenticatingId ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-xs text-stone-500 dark:text-stone-400 text-center mt-6 space-y-1">
          <p>Don't have an account yet?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 font-bold pt-1">
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Register as a Customer (100% Free)
            </Link>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
            <Link href="/provider/register" className="text-amber-600 dark:text-amber-400 hover:underline">
              Register your Business (100% Free)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
