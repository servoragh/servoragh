"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function syncTheme() {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }

    // Initial check from localStorage / DOM
    const savedTheme = localStorage.getItem("servora_theme") as "light" | "dark" | null;
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    window.addEventListener("servora_theme_changed", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("servora_theme_changed", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme(event?: React.MouseEvent<HTMLButtonElement>) {
    const nextTheme = theme === "light" ? "dark" : "light";

    const updateDOM = () => {
      setTheme(nextTheme);
      localStorage.setItem("servora_theme", nextTheme);

      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }

      window.dispatchEvent(new Event("servora_theme_changed"));
    };

    const doc = document as any;

    // Modern View Transitions API for unified, seamless ripple transition
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rect = event?.currentTarget?.getBoundingClientRect();
      const x = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
      const y = event?.clientY ?? (rect ? rect.top + rect.height / 2 : 30);

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        updateDOM();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    } else {
      // Fallback: Uniform synchronized CSS transition across all DOM elements
      document.documentElement.classList.add("theme-transitioning");
      updateDOM();
      setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 450);
    }
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 sm:w-28 sm:h-9 rounded-full bg-slate-200/60 dark:bg-slate-800/60 animate-pulse shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative group p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <div className="p-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 transition-transform duration-300 group-hover:rotate-12">
            <Moon className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">
            Dark Mode
          </span>
        </>
      ) : (
        <>
          <div className="p-1 rounded-full bg-amber-500/15 text-amber-400 dark:bg-amber-400/20 dark:text-amber-300 transition-transform duration-300 group-hover:rotate-45 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            <Sun className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="hidden sm:inline text-xs font-bold text-slate-200 tracking-tight">
            Light Mode
          </span>
        </>
      )}
    </button>
  );
}
