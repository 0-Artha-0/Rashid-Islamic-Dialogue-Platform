import disagreementFixture from "../../../../../data/mock/disagreement-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { CompareViewsView } from "@/components/chat/CompareViewsView";

const response = structuredResponseSchema.parse(disagreementFixture);

export default function DemoCompareViewsPage() {
  return <CompareViewsView response={response} />;
}
