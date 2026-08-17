"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, CheckCircle, Send, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProductQASubsystemProps {
  productId: string;
  vendorName: string;
}

export function ProductQASubsystem({ productId, vendorName }: ProductQASubsystemProps) {
  const [qas, setQas] = useState<any[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQAs();
  }, [productId]);

  async function fetchQAs() {
    try {
      setLoading(true);
      const res = await fetch(`/api/chat/qa?productId=${productId}`);
      const data = await res.json();
      if (data.qas) setQas(data.qas);
    } catch (err) {
      console.error("Failed to load QAs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!questionInput.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/chat/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, question: questionInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post question.");

      setQuestionInput("");
      fetchQAs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePostAnswer(qaId: string) {
    const answerText = replyInputMap[qaId];
    if (!answerText || !answerText.trim()) return;

    try {
      const res = await fetch("/api/chat/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qaId, answer: answerText }),
      });

      if (!res.ok) throw new Error("Failed to post answer.");
      setReplyInputMap((prev) => ({ ...prev, [qaId]: "" }));
      setActiveReplyId(null);
      fetchQAs();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 text-xs text-stone-900 dark:text-white">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-base">Customer Questions & Answers ({qas.length})</h3>
        </div>
        <span className="text-[11px] text-stone-400">Ask {vendorName} or past buyers</span>
      </div>

      {/* Post New Question Form */}
      <form onSubmit={handlePostQuestion} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Have a question about specs, warranty, or delivery in Tamale?"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white outline-none"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow shrink-0"
          >
            {submitting ? "Asking..." : "Ask Question"}
          </button>
        </div>
      </form>

      {/* Q&A Thread List */}
      {loading ? (
        <div className="text-center py-6 text-stone-400">Loading product Q&A...</div>
      ) : qas.length === 0 ? (
        <div className="text-center py-6 text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
          No questions asked yet for this item. Be the first to ask!
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
          {qas.map((qa) => (
            <div key={qa.id} className="pt-4 first:pt-0 space-y-2">
              {/* Question */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  Q
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-stone-900 dark:text-white">{qa.question}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                    <span>Asked by {qa.author?.name}</span>
                    <span>&bull;</span>
                    <span>{formatDate(qa.createdAt)}</span>
                    {qa.isVerifiedBuyer && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer */}
              {qa.answer ? (
                <div className="ml-8 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Answer from {qa.answeredBy?.providerProfile?.businessName || qa.answeredBy?.name || vendorName}</span>
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200">{qa.answer}</p>
                </div>
              ) : (
                <div className="ml-8">
                  {activeReplyId === qa.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Write your answer..."
                        value={replyInputMap[qa.id] || ""}
                        onChange={(e) =>
                          setReplyInputMap((prev) => ({ ...prev, [qa.id]: e.target.value }))
                        }
                        className="flex-1 p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-white outline-none"
                      />
                      <button
                        onClick={() => handlePostAnswer(qa.id)}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                      >
                        Submit Answer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyId(qa.id)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Answer this question
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
