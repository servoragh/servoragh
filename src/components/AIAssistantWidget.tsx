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
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 font-sans text-xs max-w-[calc(100vw-32px)]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl flex items-center gap-2 transition transform hover:scale-105 border border-emerald-400/40 cursor-pointer"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="text-xs sm:text-xs font-extrabold">Servora AI Support</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-[calc(100vw-32px)] sm:w-96 max-w-sm shadow-2xl overflow-hidden flex flex-col h-[400px] text-stone-900 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">Servora AI Assistant</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">24/7 Automated Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white p-1 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-stone-50 dark:bg-stone-950">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[88%] ${
                  m.sender === "user"
                    ? "ml-auto bg-emerald-600 text-white rounded-br-none"
                    : "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-bl-none shadow-xs"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            ))}
            {loading && <div className="text-stone-500 text-[11px]">Servora AI is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about orders, refunds, or support..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-white placeholder-stone-400 rounded-xl outline-none border border-stone-300 dark:border-stone-700 font-medium"
            />
            <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
