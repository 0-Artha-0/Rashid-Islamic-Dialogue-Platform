"use client";

import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { AtomicClaim } from "@/lib/schemas/claims";
import type { EvidenceItem } from "@/lib/schemas/evidence";

const sourceTypeLabelsAr: Record<EvidenceItem["sourceType"], string> = {
  quran: "القرآن الكريم",
  tafsir: "التفسير",
  hadith: "الحديث",
  aqeedah: "العقيدة",
  fiqh: "الفقه",
  seerah: "السيرة",
  history: "التاريخ",
  misconception: "الشبهات",
  terminology: "المصطلحات",
  other_approved: "مصدر معتمد",
};

const relationLabelsAr: Record<NonNullable<EvidenceItem["relation"]>, string> = {
  SUPPORTS: "يدعم",
  QUALIFIES: "يقيّد",
  CONTRADICTS: "يعارض",
  DEFINES: "يعرّف",
  CONTEXTUALIZES: "يضع في السياق",
};

const sourceTypeLabelsEn: Record<EvidenceItem["sourceType"], string> = {
  quran: "Quran", tafsir: "Tafsir", hadith: "Hadith", aqeedah: "Creed", fiqh: "Jurisprudence",
  seerah: "Prophetic biography", history: "History", misconception: "Misconceptions",
  terminology: "Terminology", other_approved: "Approved source",
};

const relationLabelsEn: Record<NonNullable<EvidenceItem["relation"]>, string> = {
  SUPPORTS: "Supports", QUALIFIES: "Qualifies", CONTRADICTS: "Contradicts", DEFINES: "Defines", CONTEXTUALIZES: "Provides context",
};

type SourceDetailViewProps = {
  citation: EvidenceItem;
  claims: AtomicClaim[];
};

function DetailRow({ label, value, locale }: { label: string; value: string; locale: "ar" | "en" }) {
  return (
    <section className={`w-full rounded-[10px] border border-[#cbd9cf] bg-[#e7efe8]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"}`}>
      <h2 className="text-[9px] font-semibold leading-4 text-[#65796f]">{label}</h2>
      <p className="mt-0.5 break-words text-[10px] leading-[1.45] text-[#344f46]">{value}</p>
    </section>
  );
}

export function SourceDetailView({ citation, claims }: SourceDetailViewProps) {
  const { locale, t } = useLocale();
  const sourceTypeLabels = locale === "en" ? sourceTypeLabelsEn : sourceTypeLabelsAr;
  const relationLabels = locale === "en" ? relationLabelsEn : relationLabelsAr;
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

      <Sidebar activeId="sources" />

      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[540px] flex-col items-center gap-2">
          <header className="mb-0.5 w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{t.sourceDetail.title}</h1>
          </header>

          <DetailRow locale={locale} label={t.sourceDetail.sourceName} value={citation.sourceName} />
          <DetailRow locale={locale} label={t.sourceDetail.sourceType} value={sourceTypeLabels[citation.sourceType]} />
          <DetailRow locale={locale} label={t.sourceDetail.originalText} value={citation.text} />
          <DetailRow locale={locale} label={t.sourceDetail.location} value={citation.locator} />
          {citation.relation && (
            <DetailRow locale={locale} label={t.sourceDetail.relation} value={relationLabels[citation.relation]} />
          )}
          {citation.url && (
            <DetailRow locale={locale} label={t.sourceDetail.url} value={citation.url} />
          )}
          {claims.length > 0 && (
            <section className={`w-full rounded-[10px] border border-[#e4c9c2] bg-[#f4e5e1]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"}`}>
              <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{t.sourceDetail.linkedClaim}</h2>
              <div className="mt-0.5 space-y-1 text-[10px] leading-[1.45] text-[#344f46]">
                {claims.map((claim) => <p key={claim.id}>{claim.text}</p>)}
              </div>
            </section>
          )}

          <div className="mt-1 flex items-center justify-center gap-2" dir={locale === "en" ? "ltr" : "rtl"}>
            <Link
              href="/conversations/demo/evidence"
              className="inline-flex h-8 items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#fffdf8]/65 px-3 text-[10px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.sourceDetail.back}
            </Link>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center rounded-[9px] bg-[#365f4f] px-3 text-[10px] font-semibold leading-4 text-white transition-colors hover:bg-[#2d5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.sourceDetail.useSource}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
