import { NextResponse } from "next/server";
import { createEmptyDialogueState } from "@/lib/graphs/dialogueState";

export async function POST() {
  return NextResponse.json(
    {
      message: "RASHID chat pipeline is not implemented yet.",
      route: "UNIMPLEMENTED",
      citations: [],
      claims: [],
      dialogueState: createEmptyDialogueState(),
      showReferral: false,
      showDisagreement: false,
    },
    { status: 501 },
  );
}
