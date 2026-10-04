import { NextResponse } from "next/server";
import { createEmptyDialogueState } from "@/lib/graphs/dialogueState";

export async function POST() {
  return NextResponse.json(
    {
      responseId: "unimplemented",
      conversationId: "unimplemented",
      status: "error",
      message: "RASHID chat pipeline is not implemented yet.",
      contentLevel: "B",
      route: "EXPLAIN",
      citations: [],
      claims: [],
      dialogueState: createEmptyDialogueState(),
      discussionMap: { nodes: [], edges: [] },
      disagreement: null,
      referral: null,
      suggestedActions: [],
    },
    { status: 501 },
  );
}
