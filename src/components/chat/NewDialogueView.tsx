"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { AttachmentMenu } from "@/components/chat/AttachmentMenu";
import { useLocale } from "@/components/i18n/LocaleProvider";

const examplePrompts = [
  "ما معنى التوحيد؟",
  "هل انتشر الإسلام بالسيف؟",
  "لماذا تختلف آراء العلماء؟",
];

export function NewDialogueView() {
  const { locale, t } = useLocale();
  const [message, setMessage] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

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
        <section className="flex w-full max-w-[680px] flex-col items-center text-center">
          <h1 className="text-[28px] font-bold leading-[1.3] text-[#365f4f] sm:text-[30px]">
            {t.newDialogue.title}
          </h1>
          <p className="mt-1.5 text-[13px] font-normal leading-5 text-[#344f46] sm:text-[14px]">
            {t.newDialogue.subtitle}
          </p>

          <div className="relative mt-2 w-full">
          <label className="w-full" htmlFor="new-dialogue-message">
            <span className="sr-only">{t.newDialogue.placeholder}</span>
            <textarea
              id="new-dialogue-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t.newDialogue.placeholder}
              rows={2}
              className={`block min-h-[60px] w-full resize-none rounded-[12px] border border-[#d8bd91] bg-[#e7efe8]/95 px-4 py-3 ${locale === "en" ? "text-left" : "text-right"} text-[13px] leading-5 text-[#365f4f] placeholder-[#667d71] shadow-[0_1px_3px_rgba(55,74,61,0.06)] focus:outline-none focus:ring-2 focus:ring-[#365f4f]/20`}
              dir={locale === "en" ? "ltr" : "rtl"}
            />
          </label>
          <button
            type="button"
            aria-label={locale === "en" ? "Attach file" : "إرفاق ملف"}
            aria-expanded={isAttachmentMenuOpen}
            onClick={() => setIsAttachmentMenuOpen((open) => !open)}
            className={`absolute bottom-2.5 ${locale === "en" ? "right-2.5" : "left-2.5"} inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#fffdf8]/80 text-[#365f4f] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f]/30`}
          >
            <span aria-hidden="true" className="text-[16px] leading-none">＋</span>
          </button>
          {isAttachmentMenuOpen && <AttachmentMenu onClose={() => setIsAttachmentMenuOpen(false)} />}
          </div>

          <section className={`mt-2.5 w-full rounded-[12px] border border-[#e4c9c2] bg-[#f4e5e1]/90 px-4 py-2.5 ${locale === "en" ? "text-left" : "text-right"}`}>
            <h2 className="text-[11px] font-semibold leading-4 text-[#365f4f]">
              {t.newDialogue.examples}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5" dir={locale === "en" ? "ltr" : "rtl"}>
              {(locale === "en" ? t.newDialogue.prompts : examplePrompts).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setMessage(prompt)}
                  className="rounded-full px-2 py-1 text-[10px] leading-4 text-[#365f4f] transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f]/30"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[12px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.newDialogue.back}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 min-w-[90px] items-center justify-center rounded-[10px] bg-[#365f4f] px-4 text-[12px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.newDialogue.send}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
