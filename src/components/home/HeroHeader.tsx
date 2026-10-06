import React from "react";
import Image from "next/image";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function HeroHeader() {
  const { t } = useLocale();
  return (
    <header className="flex flex-col items-center text-center max-w-xl mx-auto mb-4 sm:mb-5">
      {/* Central Brand Logo */}
      <div className="mb-3 sm:mb-4">
        <Image
          src="/brand/rashid-logo.svg"
          alt="راشد | RASHID"
          width={100}
          height={56}
          priority
          className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* Quranic Verse & Citation */}
      <div className="mb-3 sm:mb-3.5 space-y-1">
        <p className="text-base/6 sm:text-lg/7 md:text-[18px]/[24px] font-semibold text-[#1d3933] tracking-normal">
          «وجعلناكم شعوباً وقبائل لتعارفوا»
        </p>
        <p className="text-[10px] sm:text-[11px] text-[#5e776e] font-normal leading-4">
          سورة الحجرات، الآية 13
        </p>
      </div>

      {/* Main Greeting Headline */}
      <h1 className="text-2xl/8 sm:text-3xl/9 md:text-[36px]/[40px] font-bold text-[#17332c] tracking-tight mb-2">
        {t.home.welcome}
      </h1>

      {/* Subtitle */}
      <p className="text-xs sm:text-[13px] text-[#465f57] font-normal leading-relaxed max-w-lg">
        {t.home.subtitle}
      </p>
    </header>
  );
}
