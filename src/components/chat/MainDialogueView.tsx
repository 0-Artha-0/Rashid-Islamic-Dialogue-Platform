"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { StructuredResponse } from "@/lib/schemas/response";
import type { EvidenceItem } from "@/lib/schemas/evidence";

export type DialogueTurn = {
  question: string;
  response: StructuredResponse;
};

function sourceLabel(citation: EvidenceItem, locale: "ar" | "en") {
  const url = citation.url ?? "";
  const ar = locale === "ar";
  if (citation.sourceType === "quran") return ar ? "القرآن الكريم" : "Quran";
  if (url.includes("dorar.net")) return ar ? "الدرر السنية" : "Dorar";
  if (url.includes("hadeethenc.com")) return ar ? "موسوعة الأحاديث النبوية" : "HadeethEnc";
  if (url.includes("quranenc.com")) return ar ? "موسوعة القرآن الكريم" : "QuranEnc";
  if (url.includes("tafsir.net")) return ar ? "ملتقى أهل التفسير" : "Tafsir.net";
  if (url.includes("islamenc.com")) return ar ? "الموسوعة الإسلامية" : "IslamEnc";
  if (url.includes("islamcontent.com")) return ar ? "المحتوى الإسلامي" : "IslamContent";
  if (citation.sourceType === "hadith") return ar ? "مصدر حديث معتمد" : "Approved Hadith Source";
  if (citation.sourceType === "tafsir") return ar ? "مصدر تفسير معتمد" : "Approved Tafsir Source";
  return ar ? "مصدر معتمد" : "Approved source";
}

function sourceLocator(citation: EvidenceItem) {
  const quran = citation.locator.match(/(?:Quran\s+|quran:)(\d+):(\d+)/i);
  if (quran) return `${quran[1]}:${quran[2]}`;
  const hadith = citation.locator.match(/hadith:(\d+)/i);
  if (hadith) return `حديث ${hadith[1]}`;
  return citation.locator;
}

function InlineAnswer({
  response,
  onCitation,
}: {
  response: StructuredResponse;
  onCitation: (citation: EvidenceItem) => void;
}) {
  const evidenceById = new Map(response.citations.map((citation) => [citation.id, citation]));
  const sentences = response.message.split(/(?<=[.!؟?])\s+/).filter(Boolean);

  return (
    <div className="space-y-2 text-[14px] leading-8 text-[#2f5045]">
      {sentences.map((sentence, index) => {
        const claim = response.claims[index] ?? (response.claims.length === 1 ? response.claims[0] : undefined);
        const citations = (claim?.evidenceIds ?? [])
          .map((id) => evidenceById.get(id))
          .filter((item): item is EvidenceItem => Boolean(item));
        return (
          <p key={index}>
            {sentence}
            {citations.map((citation) => {
              const number = response.citations.findIndex((item) => item.id === citation.id) + 1;
              return (
                <button
                  key={citation.id}
                  type="button"
                  onClick={() => onCitation(citation)}
                  className="mx-0.5 align-super text-[10px] font-bold text-[#9c7650] hover:text-[#365f4f]"
                  aria-label={`Open source ${number}`}
                >
                  [{number}]
                </button>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

function MapMini({ response }: { response: StructuredResponse }) {
  const { locale } = useLocale();
  return (
    <div className="space-y-2">
      {response.discussionMap.nodes.map((node, index) => (
        <div key={node.id} className="relative flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className={`mt-1 h-3 w-3 rounded-full border-2 ${node.status === "resolved" ? "border-[#6f9a82] bg-[#dceadf]" : node.status === "active" ? "border-[#c48b7c] bg-[#f4ddd8]" : "border-[#c8aa73] bg-[#f4ead4]"}`} />
            {index < response.discussionMap.nodes.length - 1 && <span className="h-8 w-px bg-[#d8bd91]" />}
          </div>
          <div className="pb-2">
            <p className="text-[12px] font-semibold text-[#365f4f]">{node.label}</p>
            <p className="mt-0.5 text-[10px] text-[#72847c]">
              {node.status === "resolved"
                ? (locale === "ar" ? "تمت مناقشته" : "Resolved")
                : node.status === "active"
                  ? (locale === "ar" ? "النقطة الحالية" : "Current point")
                  : (locale === "ar" ? "نقطة مفتوحة" : "Open point")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MainDialogueView({ turns }: { turns: DialogueTurn[] }) {
  const { locale } = useLocale();
  const [drawer, setDrawer] = useState<"sources" | "map" | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<EvidenceItem | null>(null);
  const latest = turns[turns.length - 1]?.response;

  const allCitations = useMemo(() => {
    const seen = new Map<string, EvidenceItem>();
    for (const turn of turns) for (const citation of turn.response.citations) seen.set(citation.id, citation);
    return [...seen.values()];
  }, [turns]);

  function openCitation(citation: EvidenceItem) {
    setSelectedCitation(citation);
    setDrawer("sources");
  }

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>

      <Sidebar
        activeId="new-chat"
        onNavigate={(id) => {
          if (id === "discussion-map") {
            setSelectedCitation(null);
            setDrawer("map");
            return true;
          }
          if (id === "sources") {
            setSelectedCitation(null);
            setDrawer("sources");
            return true;
          }
          return false;
        }}
      />

      <main className="relative z-10 flex min-h-screen flex-1 flex-col overflow-hidden lg:min-h-0">
        <header className="shrink-0 border-b border-[#d8bd91]/50 bg-[#fffaf0]/75 px-4 py-3 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-[820px] items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image src="/brand/rashid-logo.svg" alt="Rashid" width={34} height={34} className="h-8 w-8" />
              <div>
                <h1 className="text-[14px] font-bold text-[#365f4f]">{locale === "ar" ? "حوار راشد" : "Rashid Dialogue"}</h1>
                <p className="text-[9px] text-[#73837b]">{locale === "ar" ? "حوار موثّق خطوة بخطوة" : "A sourced dialogue, step by step"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => { setDrawer("map"); setSelectedCitation(null); }} className="rounded-full border border-[#d8bd91] bg-white/70 px-3 py-1.5 text-[10px] font-semibold hover:bg-white">
                {locale === "ar" ? "خريطة الحوار" : "Dialogue map"}
              </button>
              <button type="button" onClick={() => { setDrawer("sources"); setSelectedCitation(null); }} className="rounded-full border border-[#d8bd91] bg-white/70 px-3 py-1.5 text-[10px] font-semibold hover:bg-white">
                {locale === "ar" ? `المصادر (${allCitations.length})` : `Sources (${allCitations.length})`}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-8">
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6">
            {turns.map((turn, turnIndex) => (
              <section key={turn.response.responseId} className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[78%] rounded-[18px_18px_5px_18px] border border-[#c8d8ce] bg-[#e7efe8]/95 px-4 py-3 shadow-sm">
                    <p className="mb-1 text-[9px] font-semibold text-[#71877c]">{locale === "ar" ? "أنت" : "You"}</p>
                    <p className="text-[13px] leading-6 text-[#365f4f]">{turn.question}</p>
                  </div>
                </div>

                <div className="flex items-start justify-start gap-2.5">
                  <div className="mt-1 shrink-0 rounded-full border border-[#d8bd91] bg-[#fffaf0] p-1 shadow-sm">
                    <Image src="/brand/rashid-logo.svg" alt="" width={30} height={30} className="h-7 w-7" />
                  </div>
                  <div className="max-w-[82%] rounded-[18px_18px_18px_5px] border border-[#e4c9c2] bg-[#fff8f4]/95 px-4 py-3 shadow-sm">
                    <p className="mb-1 text-[9px] font-semibold text-[#a06f63]">{locale === "ar" ? "راشد" : "Rashid"}</p>
                    {turn.response.status === "ok" ? (
                      <InlineAnswer response={turn.response} onCitation={openCitation} />
                    ) : (
                      <p className="text-[13px] leading-7 text-[#2f5045]">{turn.response.message}</p>
                    )}
                    {turn.response.status === "ok" && turn.response.citations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => { setDrawer("sources"); setSelectedCitation(turn.response.citations[0]); }}
                        className="mt-3 text-[10px] font-semibold text-[#9c7650] hover:underline"
                      >
                        {locale === "ar" ? "عرض المصادر المستخدمة" : "View used sources"}
                      </button>
                    )}
                  </div>
                </div>

                {turnIndex < turns.length - 1 && <div className="mx-auto h-px w-2/3 bg-[#d8bd91]/30" />}
              </section>
            ))}
            <div id="dialogue-end" />
          </div>
        </div>
      </main>

      {drawer && latest && (
        <div className="fixed inset-0 z-[70] bg-black/10 backdrop-blur-[1px]" onClick={() => setDrawer(null)}>
          <aside
            onClick={(event) => event.stopPropagation()}
            className={`absolute top-0 h-full w-[min(92vw,390px)] overflow-y-auto border-[#d8bd91] bg-[#fffaf0]/98 p-5 shadow-2xl ${locale === "ar" ? "left-0 border-r" : "right-0 border-l"}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#365f4f]">
                {drawer === "map" ? (locale === "ar" ? "خريطة الحوار" : "Dialogue map") : (locale === "ar" ? "المصادر والأدلة" : "Sources & evidence")}
              </h2>
              <button type="button" onClick={() => setDrawer(null)} className="rounded-full border border-[#d8bd91] px-2.5 py-1 text-[11px]">×</button>
            </div>

            {drawer === "map" ? (
              <MapMini response={latest} />
            ) : selectedCitation ? (
              <div>
                <div className="rounded-[14px] border border-[#cbd9cf] bg-[#eef4ef] p-4">
                  <p className="text-[12px] font-bold text-[#365f4f]">{sourceLabel(selectedCitation, locale)}</p>
                  <p className="mt-1 text-[10px] text-[#71877c]">{sourceLocator(selectedCitation)}</p>
                  <p
                    className="mt-3 whitespace-pre-wrap text-[14px] leading-8 text-[#2f5045]"
                    style={selectedCitation.sourceType === "quran" ? { fontFamily: '"Noto Naskh Arabic", "Traditional Arabic", "Times New Roman", serif' } : undefined}
                  >
                    {selectedCitation.text}
                  </p>
                  {selectedCitation.url && (
                    <a href={selectedCitation.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[10px] font-semibold text-[#9c7650] hover:underline">
                      {locale === "ar" ? "فتح المصدر الأصلي" : "Open original source"}
                    </a>
                  )}
                </div>
                <button type="button" onClick={() => setSelectedCitation(null)} className="mt-3 text-[10px] font-semibold text-[#365f4f] hover:underline">
                  {locale === "ar" ? "عرض كل المصادر" : "View all sources"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {allCitations.length === 0 && <p className="text-[12px] text-[#71877c]">{locale === "ar" ? "لا توجد مصادر معروضة لهذه المحادثة بعد." : "No sources yet."}</p>}
                {allCitations.map((citation, index) => (
                  <button key={citation.id} type="button" onClick={() => setSelectedCitation(citation)} className="w-full rounded-[12px] border border-[#cbd9cf] bg-[#eef4ef] p-3 text-start hover:bg-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#365f4f]">[{index + 1}] {sourceLabel(citation, locale)}</span>
                      <span className="text-[9px] text-[#71877c]">{sourceLocator(citation)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[#52675e]">{citation.text}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
