import React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">Servora.gh</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Zero-capital local marketplace connecting residents across Northern Ghana with verified artisans, skilled service professionals, equipment rentals, and local businesses.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Service Artisans</span>
            </div>
          </div>

          {/* Col 2: Top Northern Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Everyday Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services/electricians/tamale" className="hover:text-emerald-400 transition">
                  Electrical & Solar Systems
                </Link>
              </li>
              <li>
                <Link href="/services/phone-repair/tamale" className="hover:text-emerald-400 transition">
                  Device & Electronics Repairs
                </Link>
              </li>
              <li>
                <Link href="/services/fugu-tailors/tamale" className="hover:text-emerald-400 transition">
                  Fashion, Smocks & Tailoring
                </Link>
              </li>
              <li>
                <Link href="/services/ac-fridge-repair/tamale" className="hover:text-emerald-400 transition">
                  Cooling & Appliance Repairs
                </Link>
              </li>
              <li>
                <Link href="/services/plumbers/tamale" className="hover:text-emerald-400 transition">
                  Plumbing, Water & Heavy Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Northern Locations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Northern Locations
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Tamale (Sakasaka, Nyohini, Choggu, Aboabo)</li>
              <li>Bolgatanga & Upper East</li>
              <li>Wa & Upper West</li>
              <li>Yendi, Damongo & Nalerigu</li>
              <li>Dungu (UDS Campus Area)</li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Artisan & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/provider/register" className="text-emerald-400 font-bold hover:underline">
                  Join as a Service Provider
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition">
                  How Servora Works
                </Link>
              </li>
              <li>
                <Link href="/trust-safety" className="hover:text-emerald-400 transition">
                  Trust & Verification Badges
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition">
                  Privacy Policy & Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Servora Ghana. Built for Northern Ghana & Beyond.</p>
          <p className="flex items-center gap-1">
            Empowering Ghanaian Artisans <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
