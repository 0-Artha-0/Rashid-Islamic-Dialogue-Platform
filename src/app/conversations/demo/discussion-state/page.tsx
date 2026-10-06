import { DiscussionStateView } from "@/components/chat/DiscussionStateView";
import normalAnswerFixture from "../../../../../data/mock/normal-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";

const response = structuredResponseSchema.parse(normalAnswerFixture);

export default function DemoDiscussionStatePage() {
  return (
    <DiscussionStateView
      dialogueState={response.dialogueState}
      discussionMap={response.discussionMap}
      disagreement={response.disagreement}
    />
  );
}
