"use client";

import React, { useState } from "react";
import { Rocket, CheckSquare, Square, Target, Users, ShieldCheck, Share2, Award } from "lucide-react";

export function LaunchModeWidget() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Recruit 5 new artisans across Sakasaka / Bolga / Wa Markets", done: true },
    { id: 2, text: "Verify 3 pending provider identity requests", done: true },
    { id: 3, text: "Create 2 programmatic SEO pages for Northern Ghana", done: false },
    { id: 4, text: "Share 3 featured provider links on Northern Ghana WhatsApp groups", done: false },
    { id: 5, text: "Follow up with customer on first 10 job request quotes", done: false },
    { id: 6, text: "Record weekly North Star Metric (Connections)", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-xs transition">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-900 dark:text-white">Zero-Capital Launch Mode</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Founder's Daily Operations & Growth Tracker</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{progressPercent}%</span>
          <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-bold">Done Today</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="bg-amber-500 dark:bg-amber-400 h-2 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-6">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`w-full p-3 rounded-2xl text-left border flex items-center gap-3 transition cursor-pointer ${
              task.done
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {task.done ? (
              <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0" />
            )}
            <span className={`text-xs font-semibold ${task.done ? "line-through opacity-80" : ""}`}>
              {task.text}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs border-t border-stone-200 dark:border-stone-800 pt-4">
        <div className="p-2 bg-stone-100 dark:bg-stone-800/40 rounded-xl">
          <span className="block font-bold text-amber-600 dark:text-amber-400">GHS 0</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Daily Spend</span>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-800/40 rounded-xl">
          <span className="block font-bold text-emerald-600 dark:text-emerald-400">WhatsApp</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Primary Channel</span>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-800/40 rounded-xl">
          <span className="block font-bold text-blue-600 dark:text-blue-400">North Ghana</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Target Region</span>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-800/40 rounded-xl">
          <span className="block font-bold text-purple-600 dark:text-purple-400">PWA</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Zero App Store Fee</span>
        </div>
      </div>
    </div>
  );
}
