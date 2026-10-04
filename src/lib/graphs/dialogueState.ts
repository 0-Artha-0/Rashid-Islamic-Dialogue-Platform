import type { DialogueState } from "@/lib/schemas/dialogue";

export function createEmptyDialogueState(): DialogueState {
  return {
    mainTopic: null,
    activePoint: null,
    resolvedPoints: [],
    openQuestions: [],
    disputedPoints: [],
    evidenceUsed: [],
  };
}
