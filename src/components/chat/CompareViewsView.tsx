"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { StructuredResponse } from "@/lib/schemas/response";

type CompareViewsViewProps = { response: StructuredResponse };

const tones = [
  "border-[#cbd9cf] bg-[#e7efe8]/90",
  "border-[#e4c9c2] bg-[#f4e5e1]/90",
  "border-[#ddc89f] bg-[#f1e7d2]/90",
];

function Panel({ title, children, tone = tones[0] }: { title: string; children: ReactNode; tone?: string }) {
  const { locale } = useLocale();
  return (
    <section className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${tone}`}>
      <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{title}</h2>
      <div className="mt-0.5 text-[10px] leading-[1.45] text-[#344f46]">{children}</div>
    </section>
  );
}

function displayDemoValue(value: string, locale: "ar" | "en") {
  if (locale !== "en") return value;

  const mappings: Record<string, string> = {
    "demo disagreement": "Demo disagreement",
    "موضع خلاف تجريبي": "Demo disagreement point",
    "الرأي الأول": "First view",
    "ملخص تجريبي": "Demo summary",
    "الرأي الثاني": "Second view",
    "نقطة اتفاق تجريبية": "Demo agreement point",
    "هذا Mock لا يمثل مادة شرعية حقيقية.": "Demo note: this mock does not represent real religious content.",
  };

  return mappings[value] ?? value;
}

export function CompareViewsView({ response }: CompareViewsViewProps) {
  const { locale, t } = useLocale();
  const disagreement = response.disagreement;
  const claimsByEvidence = new Map(
    response.citations.map((citation) => [
      citation.id,
      response.claims.filter((claim) => claim.evidenceIds.includes(citation.id)),
    ]),
  );

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="perspectives" />
      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[620px] flex-col items-center gap-1.5">
          <header className="mb-0.5 w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{t.compareViews.title}</h1>
          </header>

          {disagreement && (
            <>
              <Panel title={t.compareViews.disagreement} tone={tones[2]}>
                {displayDemoValue(disagreement.disputedPoint, locale)}
              </Panel>

              {disagreement.views.map((view, index) => {
                const evidence = view.evidenceIds
                  .map((evidenceId) => response.citations.find((citation) => citation.id === evidenceId))
                  .filter((citation) => citation !== undefined);
                return (
                  <Panel key={view.id} title={displayDemoValue(view.label, locale)} tone={tones[index % tones.length]}>
                    <p>{displayDemoValue(view.summary, locale)}</p>
                    {evidence.map((citation) => (
                      <div key={citation.id} className="mt-1 border-t border-[#365f4f]/10 pt-1">
                        <p>{citation.sourceName}: {citation.text}</p>
                        {(claimsByEvidence.get(citation.id) ?? []).map((claim) => (
                          <p key={claim.id} className="mt-0.5">{claim.text}</p>
                        ))}
                      </div>
                    ))}
                  </Panel>
                );
              })}

              {disagreement.agreementPoints.map((point, index) => (
                <Panel key={`${index}-${point}`} title={locale === "en" ? "Point of agreement" : "نقطة اتفاق"} tone={tones[0]}>
                  {displayDemoValue(point, locale)}
                </Panel>
              ))}

              {disagreement.confidentConclusion && (
                <Panel title={t.compareViews.confident} tone={tones[0]}>
                  {disagreement.confidentConclusion}
                </Panel>
              )}

              {disagreement.unresolvedNote && (
                <Panel title={t.compareViews.open} tone={tones[1]}>
                  {displayDemoValue(disagreement.unresolvedNote, locale)}
                </Panel>
              )}
            </>
          )}

          {response.suggestedActions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1" dir={locale === "en" ? "ltr" : "rtl"}>
              {response.suggestedActions.map((action) => (
                action === "عرض أدلة كل رأي" || action === "العودة للنقاش" || action === "سؤال متابعة" ? (
                  <Link key={action} href={action === "عرض أدلة كل رأي" ? "/conversations/demo/evidence" : action === "العودة للنقاش" ? "/conversations/demo/debate" : "/conversations/demo/related-question"} className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">
                    {locale === "en" ? ({ "عرض أدلة كل رأي": "View Evidence for Each View", "العودة للنقاش": "Return to Discussion", "سؤال متابعة": "Related Question" } as Record<string, string>)[action] : action}
                  </Link>
                ) : (
                  <button key={action} type="button" className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">
                    {locale === "en" ? ({ "عرض أدلة كل رأي": "View Evidence for Each View", "العودة للنقاش": "Return to Discussion" } as Record<string, string>)[action] ?? action : action}
                  </button>
                )
              ))}
            </div>
          )}

          <Link href="/conversations/demo" className="mt-1 inline-flex h-9 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[11px] font-medium leading-4 text-[#365f4f]">
            {t.compareViews.back}
          </Link>
        </section>
      </main>
    </div>
  );
}
