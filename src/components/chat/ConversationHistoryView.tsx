"use client";

import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function ConversationHistoryView() {
  const { locale } = useLocale();
  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="history" />
      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[520px] flex-col items-center text-center">
          <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{locale === "en" ? "Conversation History" : "المحادثات السابقة"}</h1>
          <div className="mt-3 w-full rounded-[12px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 py-5">
            <p className="text-[11px] leading-5 text-[#65796f]">{locale === "en" ? "No previous conversations to display." : "لا توجد محادثات سابقة لعرضها."}</p>
          </div>
          <Link
            href="/"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[11px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {locale === "en" ? "Back" : "رجوع"}
          </Link>
        </section>
      </main>
    </div>
  );
}
