"use client";

import React, { useState } from "react";
import { CircleIndicatorIcon } from "@/components/ui/icons";
import { useLocale } from "@/components/i18n/LocaleProvider";

export interface SearchInputBarProps {
  placeholder?: string;
  onSubmit?: (query: string) => void;
  className?: string;
}

export function SearchInputBar({
  placeholder = "اكتب سؤالك هنا...",
  onSubmit,
  className = "",
}: SearchInputBarProps) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && onSubmit) {
      onSubmit(trimmed);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-xl sm:max-w-[574px] mx-auto mb-4 sm:mb-2.5 ${className}`}
      aria-label={locale === "en" ? "Question form" : "نموذج طرح الأسئلة"}
    >
      <div className="relative flex items-center bg-white/95 backdrop-blur-sm border border-[#dcd6c8] rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#bfb5a2] focus-within:border-[#203c35] focus-within:ring-2 focus-within:ring-[#203c35]/15 transition-all duration-150 p-1.5 px-2">
        {/* Right Action Button (Trailing in RTL / on the left) */}
        <button
          type="submit"
          aria-label={locale === "en" ? "Send question" : "إرسال السؤال"}
          className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[14px] bg-[#365f4f] hover:bg-[#2d5143] text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#365f4f] cursor-pointer shrink-0 shadow-sm"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
          >
            <path
              d="M3.5 10.8 20.5 3.5l-7.2 17-2.1-7.4-7.7-2.3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m11.2 13.1 9.3-9.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 px-3 text-xs sm:text-sm text-[#18342e] placeholder-[#768e85] focus:outline-none focus:ring-0 text-right font-normal"
          dir={locale === "en" ? "ltr" : "rtl"}
        />

        {/* Far Right Circle Indicator Icon (Leading in RTL) */}
        <div className="pe-2 ps-1 flex items-center pointer-events-none text-[#768e85]">
          <CircleIndicatorIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
      </div>
    </form>
  );
}
