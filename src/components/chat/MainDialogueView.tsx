"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import type { StructuredResponse } from "@/lib/schemas/response";
import { useLocale } from "@/components/i18n/LocaleProvider";

type MainDialogueViewProps = {
  response: StructuredResponse;
  question: string;
};

type PanelTone = "sage" | "rose" | "sand";

const panelTones: Record<PanelTone, string> = {
  sage: "border-[#cbd9cf] bg-[#e7efe8]/90",
  rose: "border-[#e4c9c2] bg-[#f4e5e1]/90",
  sand: "border-[#ddc89f] bg-[#f1e7d2]/90",
};

function Panel({
  title,
  tone = "sage",
  children,
  className = "",
}: {
  title: string;
  tone?: PanelTone;
  children: ReactNode;
  className?: string;
}) {
  const { locale } = useLocale();
  return (
    <section className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${panelTones[tone]} ${className}`}>
      <h2 className="text-[10px] font-semibold leading-4 text-[#365f4f]">{title}</h2>
      <div className="mt-0.5 text-[10px] font-normal leading-[1.45] text-[#344f46]">
        {children}
      </div>
    </section>
  );
}

function CitationList({ citations }: { citations: StructuredResponse["citations"] }) {
  return (
    <div className="space-y-1.5">
      {citations.map((citation) => (
        <article key={citation.id} className="border-t border-[#365f4f]/10 pt-1.5 first:border-0 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <span className="font-semibold text-[#365f4f]">{citation.sourceName}</span>
            <span className="text-[10px] text-[#65796f]">{citation.locator}</span>
          </div>
          <p className="mt-0.5">{citation.text}</p>
          {citation.url && (
            <p className="mt-0.5 break-all text-[9px] text-[#65796f]">{citation.url}</p>
          )}
        </article>
      ))}
    </div>
  );
}

function SuggestedActions({ actions }: { actions: StructuredResponse["suggestedActions"] }) {
  const { locale } = useLocale();
  const displayAction = (action: string) => locale === "en" ? ({ "عرض الدليل": "View Evidence", "خريطة النقاش": "Discussion Map" } as Record<string, string>)[action] ?? action : action;
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1" dir={locale === "en" ? "ltr" : "rtl"}>
      {actions.map((action) => (
        action === "عرض الدليل" || action === "خريطة النقاش" ? (
          <Link key={action} href={action === "عرض الدليل" ? "/conversations/demo/evidence" : "/conversations/demo/discussion-map"} className="rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#365f4f]">
            {displayAction(action)}
          </Link>
        ) : (
          <button key={action} type="button" disabled className="cursor-not-allowed rounded-full border border-[#d8bd91] bg-[#fffdf8]/65 px-2.5 py-1 text-[9px] leading-3.5 text-[#8a9991]">
            {displayAction(action)}
          </button>
        )
      ))}
    </div>
  );
}

export function MainDialogueView({ response, question }: MainDialogueViewProps) {
  const { locale, t } = useLocale();
  const summary =
    response.dialogueState.points.find((point) => point.kind === "summary")?.label ??
    response.discussionMap.nodes.find((node) => node.kind === "summary")?.label;
  const activePoint = response.dialogueState.points.find(
    (point) => point.id === response.dialogueState.activePointId,
  );
  const hasProgress = Boolean(
    response.dialogueState.mainTopic ||
      response.dialogueState.points.length ||
      response.discussionMap.nodes.length ||
      response.discussionMap.edges.length,
  );

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
        <div className="my-auto flex w-full max-w-[620px] flex-col items-center gap-1.5">
          <header className="w-full text-center">
            <h1 className="text-[18px] font-bold leading-[1.3] text-[#365f4f] sm:text-[20px]">
              {question}
            </h1>
          </header>

          {response.status === "ok" ? (
            <>
              <Panel title={t.mainDialogue.userQuestion} tone="sage">
                <p>{question}</p>
              </Panel>

              {summary && (
                <Panel title={t.mainDialogue.briefSummary} tone="sand">
                  <p>{summary}</p>
                </Panel>
              )}

              <Panel title={t.mainDialogue.explanation} tone="rose">
                <p>{response.message}</p>
              </Panel>

              {(response.citations.length > 0 || response.claims.length > 0) && (
                <Panel title={t.mainDialogue.evidence} tone="sage">
                  {response.citations.length > 0 && (
                    <CitationList citations={response.citations} />
                  )}
                  {response.claims.length > 0 && (
                    <div className="mt-1.5 space-y-1 border-t border-[#365f4f]/10 pt-1.5">
                      {response.claims.map((claim) => (
                        <p key={claim.id}>
                          <span className="font-semibold text-[#365f4f]">{t.mainDialogue.claim}:</span>{" "}
                          {claim.text}
                        </p>
                      ))}
                    </div>
                  )}
                </Panel>
              )}

              {response.disagreement && (
                <Panel title={t.mainDialogue.disagreement} tone="sand">
                  <p>{response.disagreement.disputedPoint}</p>
                  {response.disagreement.agreementPoints.map((point) => (
                    <p key={point} className="mt-0.5">{point}</p>
                  ))}
                  {response.disagreement.views.map((view) => (
                    <div key={view.id} className="mt-1.5 border-t border-[#365f4f]/10 pt-1.5">
                      <p className="font-semibold text-[#365f4f]">{view.label}</p>
                      <p>{view.summary}</p>
                    </div>
                  ))}
                  {response.disagreement.confidentConclusion && (
                    <p className="mt-1.5">{response.disagreement.confidentConclusion}</p>
                  )}
                  {response.disagreement.unresolvedNote && (
                    <p className="mt-0.5">{response.disagreement.unresolvedNote}</p>
                  )}
                </Panel>
              )}

              {response.referral && (
                <Panel title={t.mainDialogue.referral} tone="sand">
                  <p>{response.referral.message}</p>
                  {response.referral.specialistType && <p>{response.referral.specialistType}</p>}
                  {response.referral.safeGeneralInformation && (
                    <p className="mt-0.5">{response.referral.safeGeneralInformation}</p>
                  )}
                </Panel>
              )}

              {hasProgress && (
                <Panel title={t.mainDialogue.whereNow} tone="rose">
                  {response.dialogueState.mainTopic && (
                    <p>{response.dialogueState.mainTopic}</p>
                  )}
                  {activePoint && <p className="mt-0.5">{activePoint.label}</p>}
                  {response.discussionMap.nodes.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      {response.discussionMap.nodes.map((node) => (
                        <span key={node.id}>{node.label}</span>
                      ))}
                    </div>
                  )}
                </Panel>
              )}

              <SuggestedActions actions={response.suggestedActions} />
            </>
          ) : (
            <Panel title={response.status === "clarification_required" ? t.mainDialogue.clarification : response.status === "referral" ? t.mainDialogue.referral : response.status === "insufficient_evidence" ? t.mainDialogue.insufficientEvidence : response.status === "error" ? t.mainDialogue.unable : t.mainDialogue.explanation} tone="rose">
              <p>{response.message}</p>
              {response.status === "referral" && response.referral && (
                <div className="mt-1.5 border-t border-[#365f4f]/10 pt-1.5">
                  {response.referral.specialistType && <p>{response.referral.specialistType}</p>}
                  {response.referral.safeGeneralInformation && (
                    <p className="mt-0.5">{response.referral.safeGeneralInformation}</p>
                  )}
                </div>
              )}
              {response.citations.length > 0 && (
                <div className="mt-1.5 border-t border-[#365f4f]/10 pt-1.5">
                  <CitationList citations={response.citations} />
                </div>
              )}
              <div className="mt-1.5">
                <SuggestedActions actions={response.suggestedActions} />
              </div>
            </Panel>
          )}
        </div>
      </main>
    </div>
  );
}
