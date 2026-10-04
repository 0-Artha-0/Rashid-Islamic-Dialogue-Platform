import type { AtomicClaim } from "@/lib/schemas/claims";
import type { EvidencePack } from "@/lib/schemas/evidence";

export async function buildAtomicClaims(_pack: EvidencePack): Promise<AtomicClaim[]> {
  throw new Error("buildAtomicClaims is not implemented yet.");
}
