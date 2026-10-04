export type DialogueMove =
  | "ANSWER"
  | "CLARIFY"
  | "DEFINE"
  | "SHOW_EVIDENCE"
  | "EXPLAIN_DISAGREEMENT"
  | "REFER";

export async function planNextMove(): Promise<DialogueMove> {
  throw new Error("planNextMove is not implemented yet.");
}
