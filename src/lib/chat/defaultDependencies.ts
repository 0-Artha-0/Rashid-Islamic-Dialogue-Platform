import { getSession } from "@/lib/db/sessions";
import { getConversation } from "@/lib/db/conversations";
import { saveConversationTurn } from "@/lib/db/turns";
import { getDialogueState, saveDialogueState } from "@/lib/db/dialogueStates";
import { routeQuestion } from "@/lib/ai/router";
import { retrieveEvidence } from "@/lib/rag/retrieve";
import { buildEvidencePack } from "@/lib/rag/evidencePack";
import { updateDialogueState } from "@/lib/dialogue/updateState";
import { buildDiscussionMap } from "@/lib/dialogue/buildDiscussionMap";
import { buildEvidenceGraph } from "@/lib/dialogue/buildEvidenceGraph";
import type { ChatPipelineDependencies } from "./types";

export const defaultChatDependencies: ChatPipelineDependencies = {
  getSession,
  getConversation,
  saveConversationTurn,
  getDialogueState,
  saveDialogueState,
  routeQuestion,
  retrieveEvidence,
  buildEvidencePack,
  updateDialogueState,
  buildDiscussionMap,
  buildEvidenceGraph,
};