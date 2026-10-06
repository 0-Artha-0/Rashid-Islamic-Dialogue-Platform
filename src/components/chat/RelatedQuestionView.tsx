"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function RelatedQuestionView() {
  const [question, setQuestion] = useState("");
  const { locale } = useLocale();

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
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

      <Sidebar activeId="new-chat" />

      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[540px] flex-col items-center text-center">
          <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{locale === "en" ? "Related Question" : "سؤال مرتبط"}</h1>
          <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{locale === "en" ? "Write a question related to the dialogue" : "اكتب سؤالاً مرتبطاً بالحوار"}</p>

          <label className="mt-2.5 block w-full">
            <span className="sr-only">اكتب سؤالك المرتبط بالحوار</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="اكتب سؤالك المرتبط بالحوار..."
              rows={2}
              className={`block min-h-[58px] w-full resize-none rounded-[10px] border border-[#d8bd91] bg-[#e7efe8]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} text-[11px] leading-[1.45] text-[#344f46] placeholder-[#65796f] focus:outline-none focus:ring-2 focus:ring-[#365f4f]/20`}
              dir={locale === "en" ? "ltr" : "rtl"}
            />
          </label>

          <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
            <Link
              href="/conversations/demo"
              className="inline-flex h-8 items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#fffdf8]/65 px-3 text-[10px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              رجوع
            </Link>
            <button
              type="button"
              disabled
              aria-label={locale === "en" ? "Send related question unavailable" : "إرسال السؤال المرتبط غير متاح"}
              className="inline-flex h-8 cursor-not-allowed items-center justify-center rounded-[9px] bg-[#8a9991] px-3 text-[10px] font-semibold leading-4 text-white"
            >
              إرسال
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
