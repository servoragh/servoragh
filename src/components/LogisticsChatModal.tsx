"use client";

import React, { useState } from "react";
import { Truck, MapPin, Send, X, PhoneCall, CheckCircle } from "lucide-react";

interface LogisticsChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTitle: string;
  courierName: string;
  deliveryAddress: string;
}

export function LogisticsChatModal({
  isOpen,
  onClose,
  orderTitle,
  courierName,
  deliveryAddress,
}: LogisticsChatModalProps) {
  const [messages, setMessages] = useState([
    { id: "1", sender: courierName, text: `Hello! I am carrying your order "${orderTitle}". I will arrive in ~15 mins.`, time: "Just now" },
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", text: input, time: "Just now" },
    ]);
    setInput("");
  }

  function handleShareLandmark(landmark: string) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", text: `📍 Delivery Landmark Share: ${landmark}`, time: "Just now" },
    ]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Rider & Delivery Chat</h3>
              <p className="text-[10px] text-stone-400">Order: {orderTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Courier Info Bar */}
        <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 font-bold flex items-center justify-center text-xs">
              {courierName.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-white block text-xs">{courierName}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> En Route to {deliveryAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Landmark Quick Share Buttons */}
        <div className="space-y-1">
          <span className="text-[10px] text-stone-400 font-bold block">QUICK LANDMARK SHARE (TAMALE):</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
            {["Near Aboabo Market", "Sakasaka Roundabout", "Nyohini Taxi Rank", "Near Central Mosque"].map((lm) => (
              <button
                key={lm}
                onClick={() => handleShareLandmark(lm)}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 shrink-0 font-medium"
              >
                📍 {lm}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream */}
        <div className="h-60 overflow-y-auto bg-stone-950 p-3 rounded-2xl space-y-2 border border-stone-800">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-xl max-w-[85%] ${
                m.sender === "You" ? "ml-auto bg-emerald-600 text-white" : "bg-stone-800 text-stone-200"
              }`}
            >
              <div className="text-[9px] opacity-75 font-semibold mb-0.5">{m.sender}</div>
              <p className="text-xs">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Type delivery note for courier..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2.5 bg-stone-800 text-white rounded-xl outline-none text-xs border border-stone-700"
          />
          <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
