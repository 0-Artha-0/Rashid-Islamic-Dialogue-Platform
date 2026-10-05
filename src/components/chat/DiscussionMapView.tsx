"use client";

import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/home/Sidebar";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { DiscussionEdge, DiscussionMap, DiscussionNode } from "@/lib/schemas/graph";

type DiscussionMapViewProps = {
  discussionMap: DiscussionMap;
};

const kindLabelsAr: Record<DiscussionNode["kind"], string> = {
  main_question: "السؤال الرئيسي",
  active_point: "نقطة نشطة",
  resolved_point: "نقطة محسومة",
  open_question: "سؤال مفتوح",
  concept: "مفهوم",
  evidence: "دليل",
  misconception: "شبهة",
  viewpoint: "وجهة نظر",
  summary: "ملخص",
};

const statusLabelsAr: Record<NonNullable<DiscussionNode["status"]>, string> = {
  active: "نشط",
  resolved: "محسوم",
  open: "مفتوح",
  disputed: "مختلف عليه",
};

const relationLabelsAr: Record<DiscussionEdge["relation"], string> = {
  LEADS_TO: "يقود إلى",
  SUPPORTS: "يدعم",
  EXPANDS: "يوسّع",
  CONTRASTS: "يقابل",
  RESOLVES: "يحسم",
};

function nodeTone(node: DiscussionNode) {
  if (node.status === "resolved" || node.kind === "resolved_point") {
    return "border-[#cbd9cf] bg-[#e7efe8]/90";
  }
  if (node.status === "disputed" || node.kind === "viewpoint" || node.kind === "misconception") {
    return "border-[#e4c9c2] bg-[#f4e5e1]/90";
  }
  return "border-[#ddc89f] bg-[#f1e7d2]/90";
}

function MapNode({ node, prominent = false, kindLabels, statusLabels }: { node: DiscussionNode; prominent?: boolean; kindLabels: Record<DiscussionNode["kind"], string>; statusLabels: Record<NonNullable<DiscussionNode["status"]>, string> }) {
  return (
    <article className={`flex min-h-10 items-center justify-center rounded-[10px] border px-3 py-2 text-center ${prominent ? "border-[#365f4f] bg-[#365f4f] text-white" : `${nodeTone(node)} text-[#365f4f]`}`}>
      <div className="text-[10px] leading-[1.4]">
        <p className="font-semibold">{node.label}</p>
        <p className={`mt-0.5 text-[9px] ${prominent ? "text-white/80" : "text-[#65796f]"}`}>
          {node.status ? statusLabels[node.status] : kindLabels[node.kind]}
        </p>
      </div>
    </article>
  );
}

export function DiscussionMapView({ discussionMap }: DiscussionMapViewProps) {
  const { locale, t } = useLocale();
  const kindLabels = locale === "en" ? { main_question: "Main question", active_point: "Active point", resolved_point: "Resolved point", open_question: "Open question", concept: "Concept", evidence: "Evidence", misconception: "Misconception", viewpoint: "Viewpoint", summary: "Summary" } : kindLabelsAr;
  const statusLabels = locale === "en" ? { active: "Active", resolved: "Resolved", open: "Open", disputed: "Disputed" } : statusLabelsAr;
  const relationLabels = locale === "en" ? { LEADS_TO: "Leads to", SUPPORTS: "Supports", EXPANDS: "Expands", CONTRASTS: "Contrasts", RESOLVES: "Resolves" } : relationLabelsAr;
  const nodeById = new Map(discussionMap.nodes.map((node) => [node.id, node]));
  const connectedIds = new Set(discussionMap.edges.flatMap((edge) => [edge.source, edge.target]));
  const unconnectedNodes = discussionMap.nodes.filter(
    (node) => !connectedIds.has(node.id) && node.kind !== "main_question",
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

      <Sidebar activeId="discussion-map" />

      <main className="relative z-10 flex min-h-screen flex-1 justify-center overflow-y-auto px-5 py-6 sm:px-8 lg:min-h-0 lg:py-5">
        <section className="my-auto flex w-full max-w-[700px] flex-col items-center gap-4">
          <h1 className="w-full text-center text-[22px] font-bold leading-[1.3] text-[#365f4f]">{t.discussionMap.title}</h1>

          {discussionMap.nodes.length > 0 && (
            <div className="flex w-full max-w-[620px] flex-col items-center gap-4">
              {discussionMap.nodes
                .filter((node) => node.kind === "main_question")
                .map((node) => (
                  <div key={node.id} className="w-full max-w-[260px]">
                    <MapNode node={node} prominent kindLabels={kindLabels} statusLabels={statusLabels} />
                  </div>
                ))}

              {discussionMap.edges.length > 0 && (
                <div className="flex w-full flex-col gap-3">
                  {discussionMap.edges.map((edge) => {
                    const source = nodeById.get(edge.source);
                    const target = nodeById.get(edge.target);
                    if (!source || !target) return null;

                    if (source.kind === "main_question") {
                      return (
                        <div key={edge.id} className="flex flex-col items-center gap-1.5">
                          <div className="flex flex-col items-center text-[8px] leading-3 text-[#65796f]">
                            <svg aria-hidden="true" viewBox="0 0 16 22" fill="none" className="h-5 w-4 text-[#b99a67]">
                              <path d="M8 1v17m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{relationLabels[edge.relation]}</span>
                          </div>
                          <div className="w-full max-w-[300px]">
                            <MapNode node={target} kindLabels={kindLabels} statusLabels={statusLabels} />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={edge.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" dir="ltr">
                        <MapNode node={source} kindLabels={kindLabels} statusLabels={statusLabels} />
                        <div className="flex flex-col items-center gap-0.5 text-[8px] leading-3 text-[#65796f]" dir="rtl">
                          <span aria-hidden="true" className="text-[14px] leading-3">←</span>
                          <span>{relationLabels[edge.relation]}</span>
                        </div>
                        <MapNode node={target} kindLabels={kindLabels} statusLabels={statusLabels} />
                      </div>
                    );
                  })}
                </div>
              )}

              {unconnectedNodes.map((node) => (
                <div key={node.id} className="w-full max-w-[300px]">
                  <MapNode node={node} kindLabels={kindLabels} statusLabels={statusLabels} />
                </div>
              ))}
            </div>
          )}

          <Link
            href="/conversations/demo"
            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#d8bd91] bg-[#fffdf8]/65 px-4 text-[11px] font-medium leading-4 text-[#365f4f] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#365f4f] focus-visible:ring-offset-2"
          >
            {t.discussionMap.back}
          </Link>
        </section>
      </main>
    </div>
  );
}
