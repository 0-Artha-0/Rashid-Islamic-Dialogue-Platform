"use client";

import Image from "next/image";
import Link from "next/link";
import type { UserProfile } from "@/lib/schemas/userProfile";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

type ExplanationDepth = UserProfile["explanationDepth"];

type ExplanationDepthOption = {
  label: string;
  value: ExplanationDepth;
};

export function ExplanationDepthView() {
  const { locale, t } = useLocale();
  const { draft, setExplanationDepth } = useOnboarding();
  const options: ExplanationDepthOption[] = [
    { label: t.depth.options.brief, value: "brief" }, { label: t.depth.options.balanced, value: "balanced" }, { label: t.depth.options.detailed, value: "detailed" },
  ];

  return (
    <main dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#f8f4eb] px-4 py-8 text-[#365f4f]">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/onboarding-background.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <section className="flex w-full max-w-[540px] flex-col items-center text-center">
        <Image
          src="/brand/rashid-logo.svg"
          alt="راشد | RASHID"
          width={100}
          height={56}
          priority
          className="h-auto w-[92px] object-contain"
        />

        <div className="mt-12 flex items-center justify-center gap-1.5" dir={locale === "en" ? "ltr" : "rtl"} aria-hidden="true">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`h-1.5 w-1.5 rounded-full ${
                step === 4 ? "bg-[#365f4f]" : "bg-[#ead9be]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[10px] font-normal leading-4 text-[#8a7858]">
          {t.depth.step}
        </p>

        <h1 className="mt-2 text-[28px] font-bold leading-[1.3] text-[#365f4f]">
          {t.depth.title}
        </h1>

        <div className="mt-2 flex w-full max-w-[500px] flex-col items-center gap-1.5" role="group" aria-label={t.depth.aria}>
          {options.map((option) => {
            const isSelected = draft.explanationDepth === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setExplanationDepth(option.value)}
                className={`flex h-11 w-full items-center justify-center rounded-[12px] bg-[#fffdf8]/35 px-3 text-[13px] font-semibold leading-5 text-[#365f4f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-2 border-[#365f4f]"
                    : "border border-[#d8bd91] hover:bg-[#fffdf8]/65"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
          <Link
            href="/onboarding/goal"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/45 px-4 text-[12px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-[#fffdf8]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.depth.back}
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M16 10H4m0 0 5-5m-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/onboarding/interests"
            className="inline-flex h-10 min-w-[90px] items-center justify-center rounded-[10px] bg-[#365f4f] px-4 text-[12px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.depth.continue}
            {locale === "en" && <span aria-hidden="true" className="ms-1">→</span>}
          </Link>
        </div>
      </section>
    </main>
  );
}
