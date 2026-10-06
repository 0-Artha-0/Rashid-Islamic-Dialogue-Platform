"use client";

import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { AtomicClaim } from "@/lib/schemas/claims";
import type { EvidenceItem } from "@/lib/schemas/evidence";
import type { StructuredResponse } from "@/lib/schemas/response";

type WhyDidYouSayThisViewProps = {
  response: StructuredResponse;
};

const claimStatusLabelsAr: Record<NonNullable<AtomicClaim["status"]>, string> = {
  SUPPORTED: "مدعوم بالدليل",
  PARTIAL: "مدعوم جزئياً",
  CONFLICTED: "محل خلاف",
  UNSUPPORTED: "غير مدعوم",
};

const relationLabelsAr: Record<NonNullable<EvidenceItem["relation"]>, string> = {
  SUPPORTS: "يدعم الادعاء",
  QUALIFIES: "يقيّد الادعاء",
  CONTRADICTS: "يعارض الادعاء",
  DEFINES: "يعرّف الادعاء",
  CONTEXTUALIZES: "يضع الادعاء في سياقه",
};

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

export function WhyDidYouSayThisView({ response }: WhyDidYouSayThisViewProps) {
  const { locale, t } = useLocale();
  const claimStatusLabels = locale === "en" ? { SUPPORTED: "Supported", PARTIAL: "Partially supported", CONFLICTED: "Disputed", UNSUPPORTED: "Unsupported" } : claimStatusLabelsAr;
  const relationLabels = locale === "en" ? { SUPPORTS: "Supports the claim", QUALIFIES: "Qualifies the claim", CONTRADICTS: "Contradicts the claim", DEFINES: "Defines the claim", CONTEXTUALIZES: "Places the claim in context" } : relationLabelsAr;
  const sourceTypeLabels = locale === "en" ? { quran: "Quran", tafsir: "Tafsir", hadith: "Hadith", aqeedah: "Creed", fiqh: "Jurisprudence", seerah: "Prophetic biography", history: "History", misconception: "Misconceptions", terminology: "Terminology", other_approved: "Approved source" } : sourceTypeLabelsAr;
  const claimEvidence = response.claims.map((claim) => ({
    claim,
    evidence: response.citations.filter((citation) => claim.evidenceIds.includes(citation.id)),
  }));

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

      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[620px] flex-col items-center gap-2">
          <header className="w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{t.whyThis.title}</h1>
            <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{t.whyThis.subtitle}</p>
          </header>

          {claimEvidence.map(({ claim, evidence }) => (
            <div key={claim.id} className="flex w-full flex-col gap-1.5">
              <section className={`w-full rounded-[10px] border border-[#cbd9cf] bg-[#e7efe8]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"}`}>
                <div className="flex items-start justify-between gap-3 text-[10px] leading-4 text-[#344f46]">
                  <span className="font-semibold text-[#365f4f]">{t.whyThis.claim}</span>
                  {claim.status && (
                    <span className="shrink-0">{claimStatusLabels[claim.status]}</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] leading-[1.45]">{claim.text}</p>
              </section>

              {evidence.map((citation) => (
                <article key={citation.id} className={`w-full rounded-[10px] border border-[#ddc89f] bg-[#f1e7d2]/90 px-3 py-2 ${locale === "en" ? "text-left" : "text-right"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                    <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{t.whyThis.evidence}</h2>
                    <span className="text-[9px] leading-4 text-[#65796f]">{sourceTypeLabels[citation.sourceType]}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] font-semibold leading-4 text-[#365f4f]">{citation.sourceName}</p>
                  <p className="text-[10px] leading-[1.45] text-[#344f46]">{citation.text}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[9px] leading-4 text-[#65796f]">
                    <span>{citation.locator}</span>
                    {citation.relation && <span>{relationLabels[citation.relation]}</span>}
                  </div>
                </article>
              ))}
            </div>
          ))}

          <Link
            href="/conversations/demo"
            className="inline-flex h-8 items-center justify-center rounded-[9px] border border-[#d8bd91] bg-[#fffdf8]/65 px-3 text-[10px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.whyThis.back}
          </Link>
        </section>
      </main>
    </div>
  );
}
