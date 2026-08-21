"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Wrench,
  Calendar,
  MessageSquare,
  Truck,
  DollarSign,
  Star,
  Users,
  Settings,
  Layers,
  CheckCircle2,
  TrendingUp,
  Plus,
} from "lucide-react";

interface DynamicProviderDashboardProps {
  providerName: string;
  businessType: string;
  capabilities: string[]; // e.g. ["PRODUCTS", "SERVICES", "BOOKINGS", "QUOTES", "RENTALS", "DELIVERY"]
}

export function DynamicProviderDashboard({
  providerName = "Northern Tech & Artisans",
  businessType = "Multi-Service Merchant & Artisan",
  capabilities = ["PRODUCTS", "SERVICES", "BOOKINGS", "QUOTES", "RENTALS", "DELIVERY"],
}: DynamicProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>(capabilities[0] || "SERVICES");

  const availableModules = [
    {
      id: "PRODUCTS",
      name: "Products & Stock Inventory",
      icon: ShoppingBag,
      description: "Manage retail goods, prices, inventory, and online store orders.",
    },
    {
      id: "SERVICES",
      name: "Services & Hourly Rates",
      icon: Wrench,
      description: "Define service offerings, fixed pricing, and hourly artisan rates.",
    },
    {
      id: "BOOKINGS",
      name: "Bookings & Calendar Slots",
      icon: Calendar,
      description: "Set appointment availability, room reservations, and client slots.",
    },
    {
      id: "QUOTES",
      name: "Custom Bids & Quotes",
      icon: MessageSquare,
      description: "Respond to customer service requests with custom pricing and terms.",
    },
    {
      id: "RENTALS",
      name: "Tool & Fleet Rentals",
      icon: Layers,
      description: "List equipment, generators, vehicles, and daily rental rates.",
    },
    {
      id: "DELIVERY",
      name: "Dispatch & Logistics",
      icon: Truck,
      description: "Track local pickup, door-to-door delivery, and rider assignments.",
    },
  ].filter((m) => capabilities.includes(m.id));

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full uppercase font-mono">
            Capability Configured Business 🏪
          </span>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white mt-1">{providerName}</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">{businessType} • Active Servora Merchant</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {capabilities.map((cap) => (
            <span
              key={cap}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono font-extrabold rounded-xl uppercase"
            >
              ✓ {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Dynamic Capability Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {availableModules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.id;

          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {mod.name}
            </button>
          );
        })}
      </div>

      {/* Active Capability Panel */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-4">
        {activeTab === "PRODUCTS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" /> Products & Store Inventory
                </h3>
                <p className="text-xs text-stone-500">Manage catalog listings, prices, and stock quantities.</p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add New Product
              </button>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Storefront Inventory Active. 12 Items listed in catalog.
            </div>
          </div>
        )}

        {activeTab === "SERVICES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-500" /> Artisan Services & Pricing Rates
                </h3>
                <p className="text-xs text-stone-500">Manage fixed service prices and hourly artisan rates.</p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Service Offering
              </button>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Service Directory Active. Hourly Rate: GHS 50.00 / hour.
            </div>
          </div>
        )}

        {activeTab === "BOOKINGS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" /> Booking Calendar & Time Slots
                </h3>
                <p className="text-xs text-stone-500">Manage customer appointments and room reservations.</p>
              </div>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Booking Engine Active. 4 Upcoming Reservations confirmed.
            </div>
          </div>
        )}

        {activeTab === "QUOTES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" /> Custom Bids & Quote Requests
                </h3>
                <p className="text-xs text-stone-500">Respond to customer requests with custom estimates.</p>
              </div>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Quote Engine Active. 2 Open customer requests in your area.
            </div>
          </div>
        )}

        {activeTab === "RENTALS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" /> Tool & Equipment Rentals Fleet
                </h3>
                <p className="text-xs text-stone-500">Manage daily rates, security deposits, and return dates.</p>
              </div>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Rental Engine Active. 5 Heavy Duty tools available for daily rent.
            </div>
          </div>
        )}

        {activeTab === "DELIVERY" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-500" /> Dispatch & Logistics Orders
                </h3>
                <p className="text-xs text-stone-500">Monitor active deliveries, tracking OTPs, and rider payouts.</p>
              </div>
            </div>
            <div className="p-8 text-center text-xs text-stone-400 font-semibold bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800">
              Universal Delivery Engine Active. 3 Express deliveries in transit.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
