import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import { keywordSearch } from "@/lib/rag/keywordSearch";
import { plannedSourceTypes } from "@/lib/rag/sourcePlanner";

function normalizedGrade(candidate: EvidenceCandidate): string {
  return (candidate.grading ?? candidate.locator.match(/grading=([^|]+)/i)?.[1] ?? "").trim().toLowerCase();
}

function hadithFitness(candidate: EvidenceCandidate): number {
  if (candidate.sourceType !== "hadith") return 0;
  const grade = normalizedGrade(candidate);
  if (!grade) return -0.12;
  if (/صحيح|حسن|sahih|hasan|authentic|sound/.test(grade)) return 0.18;
  if (/ضعيف|غريب|موضوع|باطل|منكر|لا يصح|weak|fabricated|mawdu/.test(grade)) return -1.25;
  return -0.08;
}

export function isPrimaryEvidenceEligible(candidate: EvidenceCandidate): boolean {
  return candidate.sourceType !== "hadith" || hadithFitness(candidate) > -1;
}

export function rankCandidates(candidates: EvidenceCandidate[], query: RetrievalQuery): EvidenceCandidate[] {
  const lexical = keywordSearch(query.query, candidates.map((candidate) => candidate.text));
  const wantedTypes = plannedSourceTypes(query);
  return candidates
    .map((candidate, index) => {
      const sourceBoost = wantedTypes.includes(candidate.sourceType) ? 0.18 : -0.1;
      const languageBoost = query.preferredSourceLanguages.includes(candidate.language)
        ? 0.12 : candidate.language === query.queryLanguage ? 0.06 : 0;
      const conceptOverlap = query.conceptIds.filter((id) => candidate.conceptIds.includes(id)).length;
      const conceptBoost = query.conceptIds.length ? (conceptOverlap / query.conceptIds.length) * 0.12 : 0;
      const provenanceBoost = (candidate.url ? 0.05 : 0) + (candidate.locator ? 0.03 : 0);
      const finalScore = candidate.score * 0.5 + lexical[index] * 0.25 + sourceBoost + languageBoost + conceptBoost + provenanceBoost + hadithFitness(candidate);
      return { candidate, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map(({ candidate, finalScore }) => ({ ...candidate, score: finalScore }));
}
