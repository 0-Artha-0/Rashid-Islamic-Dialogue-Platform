"use client";

import Image from "next/image";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

const unavailableRowKeys = ["misconception", "convincing", "context", "evidence", "misunderstood", "summary"] as const;

export function MisconceptionsView() {
  const { locale, t } = useLocale();
  const unavailableRows = unavailableRowKeys.map((key, index) => [t.misconceptions[key], t.misconceptions.messages[index]] as const);
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>

      <Sidebar activeId="issues" />

      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className={`my-auto flex w-full max-w-[620px] flex-col items-center text-center ${locale === "en" ? "text-left" : "text-right"}`}>
          <header className="mb-2 w-full">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{t.misconceptions.title}</h1>
            <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{t.misconceptions.subtitle}</p>
          </header>

          <div className="w-full space-y-1.5">
            {unavailableRows.map(([label, message], index) => (
              <section
                key={label}
                className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${
                  index % 3 === 0
                    ? "border-[#cbd9cf] bg-[#e7efe8]/90"
                    : index % 3 === 1
                      ? "border-[#e4c9c2] bg-[#f4e5e1]/90"
                      : "border-[#ddc89f] bg-[#f1e7d2]/90"
                }`}
              >
                <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{label}</h2>
                <p className="mt-0.5 text-[9px] leading-4 text-[#65796f]">{message}</p>
              </section>
            ))}
          </div>

          <section className={`mt-1.5 w-full rounded-[10px] border border-[#cbd9cf] bg-[#e7efe8]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"}`}>
            <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{t.misconceptions.followUp}</h2>
            <p className="mt-0.5 text-[9px] leading-4 text-[#65796f]">{t.misconceptions.unavailable}</p>
          </section>

          <div dir={locale === "en" ? "ltr" : "rtl"} className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
            <button type="button" disabled className="inline-flex h-8 cursor-not-allowed items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#e7efe8]/60 px-3 text-[10px] font-semibold text-[#8a9991]">{t.misconceptions.viewEvidence}</button>
            <button type="button" disabled className="inline-flex h-8 cursor-not-allowed items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#f4e5e1]/60 px-3 text-[10px] font-medium text-[#8a9991]">{t.misconceptions.followUpQuestion}</button>
            <button type="button" disabled className="inline-flex h-8 cursor-not-allowed items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#f1e7d2]/60 px-3 text-[10px] font-medium text-[#8a9991]">{t.misconceptions.continueDialogue}</button>
          </div>
        </section>
      </main>
    </div>
  );
}
