"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { StructuredResponse } from "@/lib/schemas/response";

type DebateModeViewProps = { response: StructuredResponse };

function Panel({ title, children, tone }: { title: string; children: ReactNode; tone: "sage" | "rose" | "sand" }) {
  const { locale } = useLocale();
  const toneClass = {
    sage: "border-[#cbd9cf] bg-[#e7efe8]/90",
    rose: "border-[#e4c9c2] bg-[#f4e5e1]/90",
    sand: "border-[#ddc89f] bg-[#f1e7d2]/90",
  }[tone];
  return (
    <section className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${toneClass}`}>
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

export function DebateModeView({ response }: DebateModeViewProps) {
  const { locale } = useLocale();
  const l = locale === "en" ? { title: "Debate Mode", claim: "Claim", evidence: "Evidence", related: "Related evidence IDs:", agreement: "Point of agreement", disputed: "Point of disagreement", open: "What remains open", resolved: "Resolved", viewEvidence: "View Evidence", summary: "Debate Summary", back: "Back" } : { title: "وضع المناظرة", claim: "ادعاء", evidence: "الدليل", related: "معرّفات الأدلة المرتبطة:", agreement: "نقطة اتفاق", disputed: "نقطة خلاف", open: "ما بقي مفتوحاً", resolved: "ما تم حسمه", viewEvidence: "عرض الأدلة", summary: "ملخص المناظرة", back: "رجوع" };
  const disagreement = response.disagreement;
  const resolvedPoints = response.dialogueState.points.filter(
    (point) => point.status === "resolved" || response.dialogueState.resolvedPointIds.includes(point.id),
  );
  const openPoints = response.dialogueState.points.filter(
    (point) => point.status === "open" || response.dialogueState.openPointIds.includes(point.id),
  );
  const disputedPoints = response.dialogueState.points.filter(
    (point) => point.status === "disputed" || response.dialogueState.disputedPointIds.includes(point.id),
  );

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} className="relative isolate flex min-h-screen w-full flex-col-reverse overflow-hidden bg-[#f8f4eb] text-[#365f4f] lg:h-screen lg:min-h-0 lg:flex-row">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <Image src="/images/onboarding-background.jpeg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      </div>
      <Sidebar activeId="debate" />
      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[620px] flex-col items-center gap-1.5">
          <header className="mb-0.5 w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">{l.title}</h1>
            {disagreement?.disputedPoint && <p className="mt-1 text-[10px] leading-4 text-[#65796f]">{displayDemoValue(disagreement.disputedPoint, locale)}</p>}
          </header>

          {response.claims.map((claim) => (
            <Panel key={claim.id} title={l.claim} tone="sage">
              <p>{claim.text}</p>
              {claim.status && <p className="mt-0.5">{claim.status}</p>}
            </Panel>
          ))}

          {response.citations.length > 0 && (
            <Panel title={l.evidence} tone="rose">
              {response.citations.map((citation) => <p key={citation.id}>{citation.text}</p>)}
            </Panel>
          )}

          {disagreement && disagreement.views.map((view, index) => (
            <Panel key={view.id} title={displayDemoValue(view.label, locale)} tone={index % 2 === 0 ? "sand" : "rose"}>
              <p>{displayDemoValue(view.summary, locale)}</p>
              {view.evidenceIds.length > 0 && (
                <p className="mt-0.5">{l.related} {view.evidenceIds.join("، ")}</p>
              )}
            </Panel>
          ))}

          {disagreement && disagreement.agreementPoints.map((point, index) => (
            <Panel key={`${index}-${point}`} title={l.agreement} tone="sage">{displayDemoValue(point, locale)}</Panel>
          ))}
          {disputedPoints.map((point) => <Panel key={point.id} title={l.disputed} tone="rose">{point.label}</Panel>)}
          {disagreement?.unresolvedNote && <Panel title={l.open} tone="sand">{displayDemoValue(disagreement.unresolvedNote, locale)}</Panel>}
          {resolvedPoints.map((point) => <Panel key={point.id} title={l.resolved} tone="sage">{point.label}</Panel>)}
          {openPoints.map((point) => <Panel key={point.id} title={l.open} tone="sand">{point.label}</Panel>)}

          {response.suggestedActions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1" dir={locale === "en" ? "ltr" : "rtl"}>
              <Link href="/conversations/demo/evidence" className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">{l.viewEvidence}</Link>
              <Link href="/conversations/demo/debate/summary" className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">{l.summary}</Link>
              {response.suggestedActions.map((action) => {
                const destination = action === "عرض أدلة كل رأي"
                  ? "/conversations/demo/evidence"
                  : action === "العودة للنقاش"
                    ? "/conversations/demo"
                    : action === "سؤال متابعة"
                      ? "/conversations/demo/related-question"
                    : null;
                const displayAction = locale === "en" ? ({ "عرض أدلة كل رأي": "View Evidence for Each View", "العودة للنقاش": "Return to Discussion", "سؤال متابعة": "Related Question" } as Record<string, string>)[action] ?? action : action;
                return destination ? (
                  <Link key={action} href={destination} className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">
                    {displayAction}
                  </Link>
                ) : (
                  <button key={action} type="button" className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">{displayAction}</button>
                );
              })}
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
