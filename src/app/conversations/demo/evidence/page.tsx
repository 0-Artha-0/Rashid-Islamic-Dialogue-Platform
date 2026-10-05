import { EvidenceView } from "@/components/chat/EvidenceView";
import normalAnswerFixture from "../../../../../data/mock/normal-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";

const response = structuredResponseSchema.parse(normalAnswerFixture);

export default function DemoEvidencePage() {
  return <EvidenceView citations={response.citations} claims={response.claims} />;
}
