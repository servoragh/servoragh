"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check saved theme or default to light mode
    const savedTheme = localStorage.getItem("servora_theme") as "light" | "dark" | null;
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("servora_theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("servora_theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer border border-stone-300 dark:border-stone-700 shadow-xs"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? (
        <>
          <Moon className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="hidden sm:inline font-bold">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="hidden sm:inline font-bold">Light Mode</span>
        </>
      )}
    </button>
  );
}
