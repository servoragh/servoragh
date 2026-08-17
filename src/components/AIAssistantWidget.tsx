"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, UserCheck, ShieldCheck } from "lucide-react";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "👋 Hi! I am Servora AI Assistant. Ask me about your orders, return policies, or vendor verification in Tamale!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "I am currently processing your request." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "🤖 I am having trouble connecting right now. Please try again shortly!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl flex items-center gap-2 transition transform hover:scale-105 border border-emerald-400/40"
        >
          <Bot className="w-5 h-5" />
          <span>Servora AI Support</span>
        </button>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl w-80 sm:w-96 shadow-2xl overflow-hidden flex flex-col h-96 text-white animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-stone-800 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Servora AI Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-semibold">24/7 Automated Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-950">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] ${
                  m.sender === "user"
                    ? "ml-auto bg-emerald-600 text-white rounded-br-none"
                    : "bg-stone-800 text-stone-200 border border-stone-700 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            ))}
            {loading && <div className="text-stone-500 text-[11px]">Servora AI is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-stone-800 border-t border-stone-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about orders, refunds, or support..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2.5 bg-stone-900 text-white placeholder-stone-400 rounded-xl outline-none border border-stone-700 font-medium"
            />
            <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
