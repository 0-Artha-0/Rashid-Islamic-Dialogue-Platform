"use client";
import React from "react";
import { UserIcon, GlobeIcon } from "@/components/ui/icons";
import { useLocale } from "@/components/i18n/LocaleProvider";

export interface TopUtilityBarProps {
  onProfileClick?: () => void;
  onLanguageToggle?: () => void;
  className?: string;
}

export function TopUtilityBar({
  onLanguageToggle,
  className = "",
}: TopUtilityBarProps) {
  const { locale, toggleLocale } = useLocale();
  return (
    <button
      type="button"
      aria-label={locale === "en" ? "Change language" : "تغيير اللغة"}
      title={locale === "en" ? "Change language" : "تغيير اللغة"}
      onClick={() => { toggleLocale(); onLanguageToggle?.(); }}
      className={`inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#d8bd91] bg-[#f8f4eb] text-[#365f4f] transition-colors hover:bg-[#fffdf8] focus:outline-none focus:ring-2 focus:ring-[#365f4f]/25 ${className}`}
    >
      <GlobeIcon className="h-6 w-6" />
    </button>
  );
}
