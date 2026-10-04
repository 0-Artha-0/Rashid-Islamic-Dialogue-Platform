import type { AtomicClaim } from "@/lib/schemas/claims";
import type { EvidenceItem } from "@/lib/schemas/evidence";

export type ClaimVerification = {
  claimId: string;
  status: "SUPPORTED" | "PARTIAL" | "CONFLICTED" | "UNSUPPORTED";
  reason: string;
  evidenceIds: string[];
};

export async function verifyClaims(
  _claims: AtomicClaim[],
  _evidence: EvidenceItem[],
): Promise<ClaimVerification[]> {
  throw new Error("verifyClaims is not implemented yet.");
}
