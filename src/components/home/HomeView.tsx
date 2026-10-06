"use client";

import React from "react";
import Image from "next/image";
import { Sidebar } from "./Sidebar";
import { TopUtilityBar } from "./TopUtilityBar";
import { HeroHeader } from "./HeroHeader";
import { SearchInputBar } from "./SearchInputBar";
import { FeatureCardsGrid } from "./FeatureCardsGrid";
import { SuggestionChips } from "./SuggestionChips";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useRouter } from "next/navigation";

export function HomeView() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const handleSearchSubmit = (query: string) => {
    void query;
    router.push("/new-dialogue");
  };

  const handleSelectFeature = (id: string) => {
    const destinations: Record<string, string> = {
      answers: "/new-dialogue",
      perspectives: "/conversations/demo/compare-views",
      map: "/conversations/demo/discussion-map",
      debate: "/conversations/demo/debate",
      misconception: "/misconceptions",
      referral: "/conversations/demo/referral",
    };
    const destination = destinations[id];
    if (destination) router.push(destination);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    void suggestion;
    router.push("/new-dialogue");
  };

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate min-h-screen lg:h-screen lg:max-h-screen lg:p-4 w-full bg-[#fbf8f1] text-[#1b3630] flex flex-col-reverse lg:flex-row overflow-y-auto lg:overflow-hidden selection:bg-[#d1ded6] selection:text-[#1b3a32]">
      {/* Decorative Illustrated Islamic Background Artwork */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#faf7f0]">
        <Image
          src="/images/home-background.png"
          alt="Islamic architectural watercolor artwork"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Right Navigation Sidebar (First flex child sits on the RIGHT in RTL) */}
      <Sidebar />

      {/* Main Interactive Workspace (Sits to the LEFT of the sidebar in RTL) */}
      <div className="flex-1 flex flex-col justify-between min-h-screen lg:min-h-0 h-full p-4 sm:p-5 lg:p-6 lg:pe-16 lg:pt-10 relative z-10 overflow-y-auto lg:overflow-visible">
        {/* Top-Left Utility Controls Capsule [ 👤 | 🌐 ] */}
        <header className={`absolute top-4 sm:top-5 lg:top-2 z-30 ${locale === "en" ? "right-4 sm:right-6 lg:right-4" : "left-4 sm:left-6 lg:left-2"}`}>
          <TopUtilityBar
            onProfileClick={() => console.log("Profile clicked")}
            onLanguageToggle={() => console.log("Language toggle clicked")}
          />
        </header>

        {/* Central Workspace: Logo -> Verse -> Citation -> Greeting -> Subtitle -> Search -> 2x3 Cards -> Chips */}
        <main className="relative isolate flex-1 flex flex-col items-center justify-center my-auto py-2 sm:py-3 w-full max-w-3xl mx-auto lg:scale-[0.98] lg:origin-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 600"
              preserveAspectRatio="none"
              className="absolute inset-x-2 top-[88px] bottom-[-24px] h-[calc(100%-64px)] w-[calc(100%-1rem)] overflow-visible drop-shadow-[0_3px_10px_rgba(70,58,38,0.035)]"
            >
              <path
                d="M44 586V184C44 149 65 130 102 130H184C205 130 220 117 228 96C249 42 343 12 500 12C657 12 751 42 772 96C780 117 795 130 816 130H898C935 130 956 149 956 184V500C956 552 928 586 878 586H122C72 586 44 552 44 500Z"
                fill="#fffdf6"
                fillOpacity="0.82"
                stroke="#e8d9c1"
                strokeOpacity="0.75"
                strokeWidth="1.25"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Brand Logo & Typography */}
          <HeroHeader />

          {/* Long Horizontal Prompt Input */}
          <SearchInputBar placeholder={t.home.search} onSubmit={handleSearchSubmit} />

          {/* 2 × 3 Feature Cards Grid */}
          <FeatureCardsGrid onSelectFeature={handleSelectFeature} />

          {/* Prompt Suggestion Chips */}
          <SuggestionChips onSelectSuggestion={handleSelectSuggestion} />
        </main>

        {/* Bottom Spacer for Balanced Proportions */}
        <footer className="h-2 sm:h-3" aria-hidden="true" />
      </div>
    </div>
  );
}
