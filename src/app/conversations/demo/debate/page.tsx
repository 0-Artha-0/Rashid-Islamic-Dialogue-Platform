import disagreementFixture from "../../../../../data/mock/disagreement-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { DebateModeView } from "@/components/chat/DebateModeView";

const response = structuredResponseSchema.parse(disagreementFixture);

export default function DemoDebateModePage() {
  return <DebateModeView response={response} />;
}
