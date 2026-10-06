"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { AttachmentMenu } from "@/components/chat/AttachmentMenu";
import { MainDialogueView, type DialogueTurn } from "@/components/chat/MainDialogueView";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useSession } from "@/components/session/SessionProvider";
import { structuredResponseSchema } from "@/lib/schemas/response";
import type { ConversationTurn } from "@/lib/schemas/conversation";

const examplePrompts = [
  "ما معنى التوحيد؟",
  "هل انتشر الإسلام بالسيف؟",
  "لماذا تختلف آراء العلماء؟",
];

export function NewDialogueView() {
  const { locale, t } = useLocale();
  const { sessionId, userProfile } = useSession();
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setMessage((current) => current || initial);

    const existingConversationId = params.get("conversationId");
    if (!existingConversationId) return;
    setConversationId(existingConversationId);

    fetch(`/api/conversations?id=${encodeURIComponent(existingConversationId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to restore conversation.");
        return res.json() as Promise<{ turns?: ConversationTurn[] }>;
      })
      .then((data) => {
        const stored = Array.isArray(data.turns) ? data.turns : [];
        const restored: DialogueTurn[] = [];
        for (let index = 0; index < stored.length; index += 1) {
          const userTurn = stored[index];
          if (userTurn?.role !== "user") continue;
          const assistantTurn = stored.slice(index + 1).find((turn) => turn.role === "assistant");
          restored.push({
            question: userTurn.content,
            answerText: assistantTurn?.content ?? (locale === "ar" ? "لم يكتمل الرد السابق." : "The previous answer was not completed."),
          });
          if (assistantTurn) index = stored.indexOf(assistantTurn);
        }
        setTurns(restored);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to restore conversation."));
  }, [locale]);

  useEffect(() => {
    if (!isSending) {
      setThinkingStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setThinkingStep((step) => (step + 1) % 4);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isSending]);

  useEffect(() => {
    if (turns.length > 0) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  const thinkingMessages = locale === "en"
    ? ["Understanding your question…", "Checking trusted sources…", "Verifying the evidence…", "Preparing a clear answer…"]
    : ["أفهم سؤالك…", "أراجع المصادر الموثوقة…", "أتحقق من الأدلة…", "أصوغ لك إجابة واضحة…"];

  async function ensureConversation(): Promise<string> {
    if (conversationId) return conversationId;
    if (!sessionId) throw new Error("No active session.");
    const created = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, title: message.slice(0, 100) || null }),
    });
    if (!created.ok) throw new Error("Unable to create conversation.");
    const body = await created.json() as { id?: string };
    if (!body.id) throw new Error("Conversation response has no id.");
    setConversationId(body.id);
    return body.id;
  }

  async function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed || isSending || !sessionId || !userProfile) return;
    setIsSending(true);
    setError(null);
    setMessage("");
    try {
      const id = await ensureConversation();
      const chat = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          conversationId: id,
          message: trimmed,
          userProfile,
        }),
      });
      const body = await chat.json();
      if (!chat.ok) throw new Error(body?.error ?? "Unable to complete the dialogue.");
      const parsed = structuredResponseSchema.parse(body);
      setTurns((current) => [...current, { question: trimmed, response: parsed }]);
    } catch (cause) {
      setMessage(trimmed);
      setError(cause instanceof Error ? cause.message : "Unable to complete the dialogue.");
    } finally {
      setIsSending(false);
    }
  }

  if (turns.length > 0) {
    return (
      <div className="min-h-screen">
        <MainDialogueView turns={turns} />
        <div ref={endRef} />
        <div dir={locale === "en" ? "ltr" : "rtl"} className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,680px)] -translate-x-1/2">
          {isSending && (
            <div aria-live="polite" className="mb-2 flex items-center justify-center gap-3 rounded-full border border-[#d8bd91] bg-[#fffdf8]/95 px-4 py-2 text-[11px] font-medium text-[#365f4f] shadow-md backdrop-blur">
              <Image src="/brand/rashid-rosette.png" alt="" width={24} height={24} className="h-6 w-6 animate-[spin_2.4s_linear_infinite]" />
              <span>{thinkingMessages[thinkingStep]}</span>
            </div>
          )}
          <form
            onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}
            className="flex gap-2 rounded-[14px] border border-[#d8bd91] bg-[#fffdf8]/95 p-2 shadow-lg backdrop-blur"
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={locale === "en" ? "Continue the dialogue..." : "أكمل الحوار..."}
              className="min-w-0 flex-1 rounded-[10px] border border-[#d8bd91] bg-white/90 px-3 py-2.5 text-[12px] text-[#365f4f] outline-none"
              dir={locale === "en" ? "ltr" : "rtl"}
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="rounded-[10px] bg-[#365f4f] px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
            >
              {isSending ? (locale === "en" ? "Thinking…" : "يفكّر…") : t.newDialogue.send}
            </button>
          </form>
          {error && <p className="mt-1 rounded bg-white/90 px-2 py-1 text-[10px] text-[#9a5d52]">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="new-chat" />
      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0">
        <section className="flex w-full max-w-[680px] flex-col items-center text-center">
          <h1 className="text-[28px] font-bold leading-[1.3] text-[#365f4f] sm:text-[30px]">{t.newDialogue.title}</h1>
          <p className="mt-1.5 text-[13px] font-normal leading-5 text-[#344f46] sm:text-[14px]">{t.newDialogue.subtitle}</p>
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
            <button type="button" aria-label={locale === "en" ? "Attach file" : "إرفاق ملف"} aria-expanded={isAttachmentMenuOpen} onClick={() => setIsAttachmentMenuOpen((open) => !open)} className={`absolute bottom-2.5 ${locale === "en" ? "right-2.5" : "left-2.5"} inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#fffdf8]/80 text-[#365f4f]`}>
              <span aria-hidden="true" className="text-[16px] leading-none">＋</span>
            </button>
            {isAttachmentMenuOpen && <AttachmentMenu onClose={() => setIsAttachmentMenuOpen(false)} />}
          </div>
          <section className={`mt-2.5 w-full rounded-[12px] border border-[#e4c9c2] bg-[#f4e5e1]/90 px-4 py-2.5 ${locale === "en" ? "text-left" : "text-right"}`}>
            <h2 className="text-[11px] font-semibold leading-4 text-[#365f4f]">{t.newDialogue.examples}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5" dir={locale === "en" ? "ltr" : "rtl"}>
              {(locale === "en" ? t.newDialogue.prompts : examplePrompts).map((prompt) => (
                <button key={prompt} type="button" onClick={() => setMessage(prompt)} className="rounded-full px-2 py-1 text-[10px] leading-4 text-[#365f4f] hover:bg-white/60">{prompt}</button>
              ))}
            </div>
          </section>
          {isSending && (
            <div aria-live="polite" className="mt-3 flex items-center gap-3 rounded-full border border-[#d8bd91] bg-[#fffdf8]/90 px-4 py-2 text-[11px] font-medium text-[#365f4f] shadow-sm backdrop-blur">
              <Image src="/brand/rashid-rosette.png" alt="" width={24} height={24} className="h-6 w-6 animate-[spin_2.4s_linear_infinite]" />
              <span>{thinkingMessages[thinkingStep]}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[12px] font-medium text-[#365f4f]">{t.newDialogue.back}</Link>
            <button type="button" disabled={isSending || !message.trim() || !sessionId} onClick={() => void sendMessage()} className="inline-flex h-10 min-w-[90px] items-center justify-center rounded-[10px] bg-[#365f4f] px-4 text-[12px] font-semibold text-white disabled:opacity-50">
              {isSending ? (locale === "en" ? "Thinking…" : "يفكّر…") : t.newDialogue.send}
            </button>
          </div>
          {error && <p role="alert" className="mt-2 text-[10px] text-[#9a5d52]">{error}</p>}
        </section>
      </main>
    </div>
  );
}
