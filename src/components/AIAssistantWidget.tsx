"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bot, X, Send, Sparkles, UserCheck, ShieldCheck, Zap, HelpCircle, PhoneCall, ChevronRight } from "lucide-react";

const QUICK_PROMPTS = [
  { label: "⚡ Find Electrician", prompt: "How do I find a verified electrician in Tamale?" },
  { label: "💳 Escrow Refunds", prompt: "How does Mobile Money escrow refund protection work?" },
  { label: "🛒 Track Request", prompt: "Check status of my latest service request" },
  { label: "📞 Live Support", prompt: "Connect me to a live support agent" },
];

export function AIAssistantWidget() {
  const pathname = usePathname() || "";
  const [userRole, setUserRole] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "👋 Hi there! I'm Servora AI Assistant. Ask me anything about finding verified artisans, tracking orders, or Mobile Money escrow safety in Northern Ghana!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role) setUserRole(data.user.role);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isAdminOrBusinessRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/delivery/provider");

  const isAdminOrBusinessUser =
    userRole === "ADMIN" || userRole === "BUSINESS" || userRole === "PROVIDER";

  if (isAdminOrBusinessRoute || isAdminOrBusinessUser) {
    return null;
  }

  async function sendMessage(textToSend: string) {
    if (!textToSend.trim()) return;

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "I am currently processing your request." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I am having trouble connecting right now. Please try again shortly!" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Helper to format bold **stars** cleanly into JSX without raw asterisk text
  function formatMessageText(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-stone-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 font-sans text-xs max-w-[calc(100vw-32px)]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative px-4 py-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 border border-emerald-400/40 cursor-pointer active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 shrink-0 group-hover:rotate-12 transition duration-300" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <span className="text-xs font-black tracking-tight">Servora AI Support</span>
        </button>
      ) : (
        <div className="bg-white/95 dark:bg-stone-900/95 border border-stone-200/90 dark:border-stone-800/90 rounded-3xl w-[calc(100vw-32px)] sm:w-96 max-w-sm shadow-2xl overflow-hidden flex flex-col h-[480px] text-stone-900 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-200 backdrop-blur-2xl">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 dark:from-emerald-950 dark:via-stone-900 dark:to-stone-950 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md text-amber-400 flex items-center justify-center font-bold border border-white/20 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Servora AI Support</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-emerald-200 font-medium">Google Gemini Powered &bull; 24/7 Active</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-stone-100/90 dark:bg-stone-800/90 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(qp.prompt)}
                className="px-2.5 py-1 bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold rounded-full border border-stone-200/80 dark:border-stone-700 shrink-0 transition cursor-pointer shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-stone-50/70 dark:bg-stone-950/70">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-3xl max-w-[88%] shadow-2xs leading-relaxed text-xs ${
                  m.sender === "user"
                    ? "ml-auto bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white rounded-tr-xs font-semibold"
                    : "bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200/90 dark:border-stone-700/90 rounded-tl-xs font-medium"
                }`}
              >
                <p className="whitespace-pre-line">{formatMessageText(m.text)}</p>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="bg-white dark:bg-stone-800 text-stone-500 border border-stone-200/90 dark:border-stone-700/90 rounded-3xl rounded-tl-xs p-3.5 max-w-[70%] flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[11px] font-bold text-stone-400 ml-1">Servora AI typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Box */}
          <form onSubmit={handleFormSubmit} className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200/90 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about orders, refunds, or support..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder-stone-400 rounded-2xl outline-none border border-stone-300 dark:border-stone-700 font-medium text-xs focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md cursor-pointer disabled:opacity-40 transition active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
