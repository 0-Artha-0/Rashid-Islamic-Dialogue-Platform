import type { DialogueState } from "@/lib/schemas/dialogue";
import type { RouterOutput } from "@/lib/schemas/router";

export type RouteQuestionInput = {
  question: string;
  dialogueState?: DialogueState;
};

export async function routeQuestion(_input: RouteQuestionInput): Promise<RouterOutput> {
  throw new Error("routeQuestion is not implemented yet.");
}
