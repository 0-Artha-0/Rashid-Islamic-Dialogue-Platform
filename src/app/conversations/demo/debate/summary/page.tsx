import disagreementFixture from "../../../../../../data/mock/disagreement-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { DebateSummaryView } from "@/components/chat/DebateSummaryView";

const response = structuredResponseSchema.parse(disagreementFixture);

export default function DemoDebateSummaryPage() {
  return <DebateSummaryView response={response} />;
}
