"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useSession } from "@/components/session/SessionProvider";
import type { Conversation } from "@/lib/schemas/conversation";

export function ConversationHistoryView() {
  const { locale } = useLocale();
  const { sessionId, isHydrated } = useSession();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!sessionId) { setLoading(false); return; }
    fetch(`/api/conversations?sessionId=${encodeURIComponent(sessionId)}`)
      .then(async (res) => res.ok ? res.json() : [])
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [isHydrated, sessionId]);

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="history" />
      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-8 sm:px-8 lg:min-h-0">
        <section className="w-full max-w-[720px]">
          <h1 className="text-center text-[22px] font-bold text-[#365f4f]">{locale === "en" ? "Conversation History" : "المحادثات السابقة"}</h1>
          <p className="mt-1 text-center text-[11px] text-[#71877c]">{locale === "en" ? "Your saved Rashid dialogues" : "حواراتك المحفوظة مع راشد"}</p>
          <div className="mt-5 space-y-3">
            {loading && <p className="text-center text-[12px] text-[#71877c]">{locale === "en" ? "Loading…" : "جارٍ تحميل المحادثات…"}</p>}
            {!loading && items.length === 0 && <div className="rounded-[14px] border border-[#d8bd91] bg-[#fffdf8]/90 p-5 text-center text-[12px] text-[#65796f]">{locale === "en" ? "No previous conversations yet." : "لا توجد محادثات سابقة بعد."}</div>}
            {items.map((conversation) => (
              <article key={conversation.id} className="rounded-[16px] border border-[#d8bd91] bg-[#fffdf8]/92 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[13px] font-bold text-[#365f4f]">{conversation.title || conversation.primaryTopic || (locale === "en" ? "Rashid dialogue" : "حوار مع راشد")}</h2>
                    <p className="mt-1 text-[10px] text-[#71877c]">{new Date(conversation.updatedAt).toLocaleString(locale === "en" ? "en" : "ar")}</p>
                  </div>
                  <Link href={`/new-dialogue?conversationId=${encodeURIComponent(conversation.id)}`} className="shrink-0 rounded-full border border-[#d8bd91] bg-[#eef4ef] px-3 py-1.5 text-[10px] font-semibold text-[#365f4f] hover:bg-white">
                    {locale === "en" ? "Continue" : "متابعة"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
