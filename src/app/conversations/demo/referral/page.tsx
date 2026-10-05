import { notFound } from "next/navigation";
import referralFixture from "../../../../../data/mock/referral-answer.json";
import { structuredResponseSchema } from "@/lib/schemas/response";
import { SpecialistReferralView } from "@/components/chat/SpecialistReferralView";

const response = structuredResponseSchema.parse(referralFixture);

export default function DemoReferralPage() {
  if (response.status !== "referral" || !response.referral) notFound();
  return <SpecialistReferralView response={response} referral={response.referral} />;
}
