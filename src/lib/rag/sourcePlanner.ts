import type { RetrievalQuery } from "@/lib/schemas/retrieval";
import type { SourceType } from "@/lib/schemas/corpus";

export type RetrievalNeedPlan = {
  need: string;
  sourceTypes: SourceType[];
  required: boolean;
};

const SOURCE_MAP: Record<string, SourceType[]> = {
  quran: ["quran"],
  qur: ["quran"],
  "قرآن": ["quran"],
  hadith: ["hadith"],
  "حديث": ["hadith"],
  tafsir: ["tafsir"],
  "تفسير": ["tafsir"],
  definition: ["terminology", "other_approved"],
  terminology: ["terminology"],
  context: ["tafsir", "other_approved", "seerah", "history"],
  evidence: ["quran", "hadith", "tafsir", "other_approved"],
  aqeedah: ["aqeedah"],
  fiqh: ["fiqh"],
  seerah: ["seerah", "history"],
  misconception: ["misconception", "other_approved"],
};

function sourceTypesForNeed(need: string): SourceType[] {
  const normalized = need.trim().toLowerCase();
  for (const [key, types] of Object.entries(SOURCE_MAP)) {
    if (normalized.includes(key)) return types;
  }
  return ["other_approved"];
}

export function planRetrieval(query: RetrievalQuery): RetrievalNeedPlan[] {
  const needs = query.needs.length ? query.needs : ["evidence"];
  return needs.map((need) => ({ need, sourceTypes: sourceTypesForNeed(need), required: true }));
}

export function plannedSourceTypes(query: RetrievalQuery): SourceType[] {
  if (query.sourceTypes.length) return query.sourceTypes;
  return [...new Set(planRetrieval(query).flatMap((item) => item.sourceTypes))];
}
