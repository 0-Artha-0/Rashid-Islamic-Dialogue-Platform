import { chatRequestSchema } from "@/lib/schemas/api";
import { structuredResponseSchema } from "@/lib/schemas/response";
import chatRequestFixture from "../../../../data/mock/chat-request.json";
import normalAnswerFixture from "../../../../data/mock/normal-answer.json";
import { MainDialogueView } from "@/components/chat/MainDialogueView";

const demoRequest = chatRequestSchema.parse(chatRequestFixture);
const demoResponse = structuredResponseSchema.parse(normalAnswerFixture);

export default function DemoConversationPage() {
  return (
    <MainDialogueView
      response={demoResponse}
      question={demoRequest.message}
    />
  );
}
