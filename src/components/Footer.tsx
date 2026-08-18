"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 pt-12 pb-8 border-t border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-stone-900 dark:text-white">Servora.gh</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Zero-capital local marketplace connecting residents across Northern Ghana with verified artisans, skilled service professionals, equipment rentals, and local businesses.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Service Artisans</span>
            </div>
          </div>

          {/* Col 2: Top Northern Services */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-3">
              Everyday Services
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/services/electricians/tamale" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Electrical & Solar Systems
                </Link>
              </li>
              <li>
                <Link href="/services/phone-repair/tamale" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Device & Electronics Repairs
                </Link>
              </li>
              <li>
                <Link href="/services/fugu-tailoring/tamale" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Northern Fugu & Tailoring
                </Link>
              </li>
              <li>
                <Link href="/services/plumbing/tamale" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Plumbing & Borehole Techs
                </Link>
              </li>
              <li>
                <Link href="/rentals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Heavy Equipment Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Neighborhood Hubs */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-3">
              Tamale Neighborhood Hubs
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/neighborhoods/sakasaka" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Sakasaka Hub
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods/choggu" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Choggu & Hilltop
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods/aboabo" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Aboabo Central Market
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods/nyohini" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Nyohini & Hospital Area
                </Link>
              </li>
              <li>
                <Link href="/neighborhoods/dungu-uds" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Dungu & UDS Campus
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Trust */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  How Servora Works
                </Link>
              </li>
              <li>
                <Link href="/trust-safety" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Ghana Card Verification
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/provider/register" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Register as an Artisan / Vendor
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  Community Notice Board
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <p>© {new Date().getFullYear()} Servora Ghana. Built for Northern Region Marketplace.</p>
          <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
            <span>Powered by</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Community Trust in Tamale</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
