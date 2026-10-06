"use client";

import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { DialoguePoint } from "@/lib/schemas/dialogue";
import type { DiscussionNode, DiscussionMap } from "@/lib/schemas/graph";
import type { DisagreementState } from "@/lib/schemas/disagreement";
import type { StructuredResponse } from "@/lib/schemas/response";

type DiscussionStateViewProps = {
  dialogueState: StructuredResponse["dialogueState"];
  discussionMap: DiscussionMap;
  disagreement: DisagreementState | null;
};

type RowTone = "sage" | "rose" | "sand";

const rowTones: Record<RowTone, string> = {
  sage: "border-[#cbd9cf] bg-[#e7efe8]/90",
  rose: "border-[#e4c9c2] bg-[#f4e5e1]/90",
  sand: "border-[#ddc89f] bg-[#f1e7d2]/90",
};

function StateRow({
  label,
  tone,
  children,
}: {
  label: string;
  tone: RowTone;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  return (
    <section className={`w-full rounded-[10px] border px-3 py-2 ${locale === "en" ? "text-left" : "text-right"} ${rowTones[tone]}`}>
      <div className="flex items-start gap-1.5 text-[10px] leading-4 text-[#344f46]" dir={locale === "en" ? "ltr" : "rtl"}>
        <span aria-hidden="true" className="shrink-0 text-[#365f4f]">●</span>
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-[#365f4f]">{label}: </span>
          {children}
        </div>
      </div>
    </section>
  );
}

function StatePointRow({
  point,
  label,
  tone,
}: {
  point: DialoguePoint | DiscussionNode;
  label: string;
  tone: RowTone;
}) {
  return (
    <StateRow label={label} tone={tone}>
      {point.label}
    </StateRow>
  );
}

export function DiscussionStateView({
  dialogueState,
  discussionMap,
  disagreement,
}: DiscussionStateViewProps) {
  const { locale, t } = useLocale();
  const activePoint =
    dialogueState.points.find((point) => point.id === dialogueState.activePointId) ??
    dialogueState.points.find((point) => point.status === "active");
  const activeNode = activePoint
    ? undefined
    : discussionMap.nodes.find((node) => node.kind === "active_point" || node.status === "active");

  const resolvedPoints = dialogueState.points.filter(
    (point) => point.status === "resolved" || dialogueState.resolvedPointIds.includes(point.id),
  );
  const resolvedNodes = discussionMap.nodes.filter(
    (node) =>
      (node.kind === "resolved_point" || node.status === "resolved") &&
      !resolvedPoints.some((point) => point.label === node.label),
  );

  const openQuestions = dialogueState.points.filter(
    (point) =>
      point.kind === "question" &&
      (point.status === "open" || dialogueState.openPointIds.includes(point.id)),
  );
  const openQuestionNodes = discussionMap.nodes.filter(
    (node) =>
      node.kind === "open_question" &&
      !openQuestions.some((point) => point.label === node.label),
  );

  const disputedPoints = dialogueState.points.filter(
    (point) => point.status === "disputed" || dialogueState.disputedPointIds.includes(point.id),
  );
  const disputedNodes = discussionMap.nodes.filter(
    (node) =>
      node.status === "disputed" &&
      !disputedPoints.some((point) => point.label === node.label),
  );

  const hasStateRows = Boolean(
    activePoint ||
      activeNode ||
      resolvedPoints.length ||
      resolvedNodes.length ||
      openQuestions.length ||
      openQuestionNodes.length ||
      disputedPoints.length ||
      disputedNodes.length ||
      disagreement,
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
        <div className="my-auto flex w-full max-w-[620px] flex-col items-center gap-2">
          <header className="w-full text-center">
            <h1 className="text-[20px] font-bold leading-[1.3] text-[#365f4f]">
              {t.discussionState.title}
            </h1>
            {dialogueState.mainTopic && (
              <p className="mt-1 text-[10px] leading-4 text-[#65796f]">
                {dialogueState.mainTopic}
              </p>
            )}
          </header>

          {hasStateRows && (
            <div className="flex w-full flex-col gap-1.5">
              {resolvedPoints.map((point) => (
                <StatePointRow key={point.id} point={point} label={t.discussionState.resolved} tone="sage" />
              ))}
              {resolvedNodes.map((node) => (
                <StatePointRow key={node.id} point={node} label={t.discussionState.resolved} tone="sage" />
              ))}

              {activePoint && (
                <StatePointRow point={activePoint} label={t.discussionState.current} tone="rose" />
              )}
              {!activePoint && activeNode && (
                <StatePointRow point={activeNode} label={t.discussionState.current} tone="rose" />
              )}

              {openQuestions.map((point) => (
                <StatePointRow key={point.id} point={point} label={t.discussionState.open} tone="sand" />
              ))}
              {openQuestionNodes.map((node) => (
                <StatePointRow key={node.id} point={node} label={t.discussionState.open} tone="sand" />
              ))}

              {disputedPoints.map((point) => (
                <StatePointRow key={point.id} point={point} label={t.discussionState.disputed} tone="sage" />
              ))}
              {disputedNodes.map((node) => (
                <StatePointRow key={node.id} point={node} label={t.discussionState.disputed} tone="sage" />
              ))}

              {disagreement && (
                <StateRow label={t.discussionState.disputed} tone="sage">
                  <p>{disagreement.disputedPoint}</p>
                  {disagreement.views.map((view) => (
                    <p key={view.id} className="mt-0.5">
                      <span className="font-semibold">{view.label}: </span>
                      {view.summary}
                    </p>
                  ))}
                </StateRow>
              )}
            </div>
          )}

          <div className="flex w-full items-center justify-center pt-0.5">
            <Link
              href="/conversations/demo"
              className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[11px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
            >
              {t.discussionState.back}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
