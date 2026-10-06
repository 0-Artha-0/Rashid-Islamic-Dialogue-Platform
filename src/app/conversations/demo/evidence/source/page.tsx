import { notFound } from "next/navigation";
import { SourceDetailView } from "@/components/chat/SourceDetailView";
import normalAnswerFixture from "../../../../../../data/mock/normal-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";

const response = structuredResponseSchema.parse(normalAnswerFixture);

type SourceDetailPageProps = {
  searchParams: Promise<{ citationId?: string }>;
};

export default async function DemoSourceDetailPage({ searchParams }: SourceDetailPageProps) {
  const { citationId } = await searchParams;
  const citation = citationId
    ? response.citations.find((item) => item.id === citationId)
    : response.citations[0];

  if (!citation) notFound();

  const claims = response.claims.filter((claim) => claim.evidenceIds.includes(citation.id));

  return <SourceDetailView citation={citation} claims={claims} />;
}
