"use client";

import Image from "next/image";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SourcesView() {
  const { locale } = useLocale();
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="sources" />
      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[620px] flex-col items-center text-center">
          <h1 className="text-[20px] font-bold leading-[1.3]">{locale === "en" ? "Sources & Evidence" : "المصادر والأدلة"}</h1>
          <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{locale === "en" ? "Trusted sources in Rashid" : "المصادر المعتمدة في مساحة راشد"}</p>
          <div className="mt-3 w-full rounded-[10px] border border-[#cbd9cf] bg-[#e7efe8]/90 px-4 py-5">
            <p className="text-[11px] leading-5 text-[#65796f]">{locale === "en" ? "No public sources are currently available." : "لا توجد مصادر عامة متاحة للعرض حالياً."}</p>
            <p className="mt-1 text-[9px] leading-4 text-[#7a8d84]">{locale === "en" ? "Sources linked to answers will appear here when available." : "ستظهر هنا المصادر المعتمدة عند توفر سجل المصادر."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
