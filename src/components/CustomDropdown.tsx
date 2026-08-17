"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomDropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomDropdownProps {
  options: CustomDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  placeholder = "Select...",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${isOpen ? "z-[60]" : ""} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition outline-none border cursor-pointer ${
          isOpen
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200"
        } ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Custom Modern Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1.5 w-48 bg-white border border-stone-200 rounded-2xl shadow-2xl z-[60] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
