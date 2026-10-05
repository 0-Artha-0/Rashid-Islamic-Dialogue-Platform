"use client";

import Image from "next/image";
import Link from "next/link";
import type { Language } from "@/lib/schemas/common";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

const languageOptions: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function LanguageView() {
  const { locale, setLocale, t } = useLocale();
  const { draft, setUiLanguage, setPreferredResponseLanguage } = useOnboarding();
  const language = draft.uiLanguage;

  return (
    <main dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8f4eb] px-4 py-8 text-[#365f4f]">
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

      <section className="flex w-full max-w-[412px] -translate-y-8 flex-col items-center text-center sm:-translate-y-14">
        <Image
          src="/brand/rashid-logo.svg"
          alt="راشد | RASHID"
          width={100}
          height={56}
          priority
          className="h-auto w-[92px] object-contain"
        />

        <div className="mt-5 flex items-center justify-center gap-1.5" dir="rtl" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={`h-[7px] w-[7px] rounded-full ${
                step === 0 ? "bg-[#365f4f]" : "bg-[#ead9be]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-[10px] font-normal leading-4 text-[#8a7858]">
          {t.language.step}
        </p>

        <h1 className="mt-1 text-[27px] font-bold leading-[1.35] text-[#365f4f]">
          {t.language.title}
        </h1>

        <div className="mt-2.5 flex w-full flex-col gap-1.5" role="radiogroup" aria-label={t.language.label}>
          {languageOptions.map((option) => {
            const isSelected = language === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => { setLocale(option.value); setUiLanguage(option.value); setPreferredResponseLanguage(option.value); }}
                className={`flex h-10 w-full items-center justify-center rounded-[12px] border bg-[#fffdf8]/35 px-4 text-[12px] font-semibold leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-2 border-[#365f4f] text-[#365f4f]"
                    : "border-[#d8bd91] text-[#365f4f] hover:bg-[#fffdf8]/65"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
          <Link
            href="/landing"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/45 px-4 text-[11px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-[#fffdf8]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.language.back}
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
              <path d="M16 10H4m0 0 5-5m-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/onboarding/religious-background"
            className="inline-flex h-8 items-center justify-center rounded-[10px] bg-[#365f4f] px-4 text-[11px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.language.continue}
            {locale === "en" && <span aria-hidden="true" className="ms-1">→</span>}
          </Link>
        </div>
      </section>
    </main>
  );
}
