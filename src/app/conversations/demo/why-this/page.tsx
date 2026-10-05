import normalAnswerFixture from "../../../../../data/mock/normal-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { WhyDidYouSayThisView } from "@/components/chat/WhyDidYouSayThisView";

const response = structuredResponseSchema.parse(normalAnswerFixture);

export default function DemoWhyDidYouSayThisPage() {
  return <WhyDidYouSayThisView response={response} />;
}
