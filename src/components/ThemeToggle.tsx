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

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
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
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 sm:w-28 sm:h-9 rounded-full bg-stone-200/60 dark:bg-stone-800/60 animate-pulse shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative group p-2 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-purple-500/10 dark:from-indigo-950/80 dark:to-purple-950/80 border border-stone-200/90 dark:border-stone-700/90 hover:border-emerald-500/50 dark:hover:border-indigo-400/50 text-stone-800 dark:text-stone-100 shadow-xs backdrop-blur-md transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? (
        <>
          <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 transition duration-300 group-hover:rotate-45">
            <Moon className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="hidden sm:inline text-xs font-extrabold text-stone-700 dark:text-stone-300 tracking-tight">
            Dark Mode
          </span>
        </>
      ) : (
        <>
          <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-500 transition duration-300 group-hover:rotate-90">
            <Sun className="w-3.5 h-3.5 shrink-0" />
          </div>
          <span className="hidden sm:inline text-xs font-extrabold text-stone-700 dark:text-stone-300 tracking-tight">
            Light Mode
          </span>
        </>
      )}
    </button>
  );
}
