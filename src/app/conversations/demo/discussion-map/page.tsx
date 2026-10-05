import normalAnswerFixture from "../../../../../data/mock/normal-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { DiscussionMapView } from "@/components/chat/DiscussionMapView";

const response = structuredResponseSchema.parse(normalAnswerFixture);

export default function DemoDiscussionMapPage() {
  return <DiscussionMapView discussionMap={response.discussionMap} />;
}
