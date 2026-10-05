"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function LandingView() {
  const { locale, t } = useLocale();
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate min-h-screen w-full overflow-hidden bg-[#faf7f0] text-[#194036]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/home-background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#fffdf6]/10" aria-hidden="true" />
      </div>

      <main className="relative flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8">
        <section className="flex w-full max-w-[580px] flex-col items-center text-center">
          <Image
            src="/brand/rashid-logo.svg"
            alt="راشد | RASHID"
            width={100}
            height={56}
            priority
            className="h-auto w-[72px] object-contain"
          />

          <h1 className="mt-2 text-[26px] font-bold leading-[1.3] text-[#1b493d] sm:text-[30px]">
            {t.landing.welcome}
          </h1>
          <p className="mt-1.5 max-w-[540px] text-[13px] font-normal leading-[1.8] text-[#344f46] sm:text-[14px]">
            {t.landing.subtitle}
          </p>

          <div className="mt-3 w-full rounded-[12px] border border-[#ddc89f]/80 bg-[#fffdf8]/80 px-4 py-2.5 backdrop-blur-[2px]">
            <p className="text-[14px] font-semibold leading-6 text-[#285344] sm:text-[15px]">
              {t.landing.verse}
            </p>
            <p className="mt-0.5 text-[11px] font-normal leading-4 text-[#65796f]">
              {t.landing.citation}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5" dir="rtl">
            <Link
              href="/onboarding/language"
              className="inline-flex min-h-9 items-center justify-center rounded-[10px] bg-[#365f4f] px-5 py-2 text-[13px] font-semibold leading-5 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.landing.start}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
