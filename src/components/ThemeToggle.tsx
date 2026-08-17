"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check saved local theme preference or default to light
    const savedTheme = localStorage.getItem("servora_theme") as "light" | "dark" | null;
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("servora_theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("servora_theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer border border-stone-200 dark:border-stone-700"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="hidden sm:inline">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </button>
  );
}
