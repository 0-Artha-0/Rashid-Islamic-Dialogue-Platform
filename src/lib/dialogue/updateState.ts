import fs from "node:fs";
import path from "node:path";
import { getLlmClient } from "@/lib/ai/client";
import {
  dialogueStateSchema,
  type DialogueState,
} from "@/lib/schemas/dialogue";

export type UpdateDialogueStateInput = {
  previousDialogueState?: DialogueState;
  userQuestion: string;
  verifiedResponseSummary: string;
  evidenceIdsUsed?: string[];
};

const dialogueStateJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "mainTopic",
    "points",
    "activePointId",
    "resolvedPointIds",
    "openPointIds",
    "disputedPointIds",
    "evidenceUsed",
  ],
  properties: {
    mainTopic: { anyOf: [{ type: "string" }, { type: "null" }] },
    points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label", "kind", "status", "parentId"],
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          kind: {
            type: "string",
            enum: ["question", "concept", "claim", "misconception", "viewpoint", "summary"],
          },
          status: {
            type: "string",
            enum: ["active", "resolved", "open", "disputed"],
          },
          parentId: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
      },
    },
    activePointId: { anyOf: [{ type: "string" }, { type: "null" }] },
    resolvedPointIds: { type: "array", items: { type: "string" } },
    openPointIds: { type: "array", items: { type: "string" } },
    disputedPointIds: { type: "array", items: { type: "string" } },
    evidenceUsed: { type: "array", items: { type: "string" } },
  },
} satisfies Record<string, unknown>;

function prompt(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "src", "prompts", "dialogue-state.md"),
    "utf8",
  );
}

function validateInvariants(
  state: DialogueState,
  allowedEvidenceIds: string[],
): DialogueState {
  const pointById = new Map(state.points.map((point) => [point.id, point]));
  const ids = state.points.map((point) => point.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("DialogueState contains duplicate point IDs.");
  }

  if (state.activePointId) {
    const active = pointById.get(state.activePointId);
    if (!active || active.status !== "active") {
      throw new Error("activePointId must reference an active point.");
    }
  }

  for (const point of state.points) {
    if (point.parentId && !pointById.has(point.parentId)) {
      throw new Error(`Dialogue point ${point.id} references an unknown parent.`);
    }
  }

  const expected = {
    resolved: new Set(state.points.filter((p) => p.status === "resolved").map((p) => p.id)),
    open: new Set(state.points.filter((p) => p.status === "open").map((p) => p.id)),
    disputed: new Set(state.points.filter((p) => p.status === "disputed").map((p) => p.id)),
  };

  const sameSet = (a: string[], b: Set<string>) =>
    a.length === b.size && a.every((value) => b.has(value));

  if (!sameSet(state.resolvedPointIds, expected.resolved)) {
    throw new Error("resolvedPointIds do not match resolved points.");
  }
  if (!sameSet(state.openPointIds, expected.open)) {
    throw new Error("openPointIds do not match open points.");
  }
  if (!sameSet(state.disputedPointIds, expected.disputed)) {
    throw new Error("disputedPointIds do not match disputed points.");
  }

  const allowed = new Set(allowedEvidenceIds);
  if (state.evidenceUsed.some((id) => !allowed.has(id))) {
    throw new Error("DialogueState invented an evidence ID.");
  }

  return state;
}

export async function updateDialogueState(
  input: UpdateDialogueStateInput,
): Promise<DialogueState> {
  const previous = input.previousDialogueState
    ? dialogueStateSchema.parse(input.previousDialogueState)
    : dialogueStateSchema.parse({});

  const evidenceIdsUsed = [...new Set(input.evidenceIdsUsed ?? [])];
  const raw = await getLlmClient().generate(
    [
      "Update the dialogue state using this turn:",
      JSON.stringify({
        previousDialogueState: previous,
        userQuestion: input.userQuestion,
        verifiedResponseSummary: input.verifiedResponseSummary,
        evidenceIdsUsed,
      }, null, 2),
    ].join("\n"),
    {
      systemInstruction: prompt(),
      responseMimeType: "application/json",
      responseJsonSchema: dialogueStateJsonSchema,
      temperature: 0,
    },
  );

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("LLM returned invalid JSON for DialogueState.");
  }

  return validateInvariants(dialogueStateSchema.parse(json), evidenceIdsUsed);
}
