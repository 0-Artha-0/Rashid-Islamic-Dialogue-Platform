import type { AtomicClaim, ClaimVerification } from "@/lib/schemas/claims";
import type { EvidenceItem } from "@/lib/schemas/evidence";

export async function verifyClaims(
  _claims: AtomicClaim[],
  _evidence: EvidenceItem[],
): Promise<ClaimVerification[]> {
  throw new Error("verifyClaims is not implemented yet.");
}
