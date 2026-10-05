
import assert from "node:assert/strict";
import { buildDisagreementState, DisagreementStateError } from "../src/lib/ai/disagreement";
import type { AtomicClaim, ClaimVerification } from "../src/lib/schemas/claims";
import type { EvidencePack } from "../src/lib/schemas/evidence";
import type { RouterOutput } from "../src/lib/schemas/router";

const routerOutput: RouterOutput = {
  queryLanguage: "en", contentLevel: "C", route: "DISAGREEMENT",
  ambiguous: false, personalRuling: false,
  needs: ["evidence", "comparison", "scholarly_views"], conceptIds: ["demo"],
  clarificationQuestion: null,
};

const evidencePack: EvidencePack = {
  question: "Which view applies in this controlled example?",
  evidence: [
    { id: "EA", chunkId: "CHA", recordId: "RA", sourceId: "SA", sourceType: "terminology", sourceName: "Approved source A", text: "Evidence A supports View A.", locator: "fixture:A", relation: "SUPPORTS", viewId: "view-a" },
    { id: "EB", chunkId: "CHB", recordId: "RB", sourceId: "SB", sourceType: "fiqh", sourceName: "Approved source B", text: "Evidence B supports View B.", locator: "fixture:B", relation: "SUPPORTS", viewId: "view-b" },
    { id: "ES", chunkId: "CHS", recordId: "RS", sourceId: "SS", sourceType: "fiqh", sourceName: "Shared approved source", text: "Both supplied sources support the shared point.", locator: "fixture:shared", relation: "SUPPORTS", viewId: "view-a" },
    { id: "ES2", chunkId: "CHS2", recordId: "RS2", sourceId: "SS2", sourceType: "fiqh", sourceName: "Shared approved source 2", text: "The same shared point is supported from the second view.", locator: "fixture:shared-2", relation: "SUPPORTS", viewId: "view-b" },
  ],
};

const claims: AtomicClaim[] = [
  { id: "claim-a", text: "View A holds the first position in this fixture.", evidenceIds: ["EA"] },
  { id: "claim-b", text: "View B holds the second position in this fixture.", evidenceIds: ["EB"] },
  { id: "claim-shared", text: "Both views support the shared point.", evidenceIds: ["ES", "ES2"] },
  { id: "claim-unsupported", text: "This unsupported claim must not become a view.", evidenceIds: ["EA"] },
];

const verifications: ClaimVerification[] = [
  { claimId: "claim-a", status: "SUPPORTED", reason: "Evidence A supports the claim.", evidenceIds: ["EA"] },
  { claimId: "claim-b", status: "SUPPORTED", reason: "Evidence B supports the claim.", evidenceIds: ["EB"] },
  { claimId: "claim-shared", status: "SUPPORTED", reason: "Both supplied evidence items support the shared point.", evidenceIds: ["ES", "ES2"] },
  { claimId: "claim-unsupported", status: "UNSUPPORTED", reason: "The supplied evidence does not establish this claim.", evidenceIds: [] },
];

const state = buildDisagreementState({ routerOutput, evidencePack, claims, verifications, preferredResponseLanguage: "en" });
assert.deepEqual(state.agreementPoints, ["Both views support the shared point."]);
assert.equal(state.views.length, 2);
assert.equal(state.confidentConclusion, null);
assert.match(state.unresolvedNote ?? "", /does not establish consensus/i);
assert.ok(state.views.every((view) => !view.summary.includes("unsupported")));

const wordingOnlyEvidence: EvidencePack = {
  ...evidencePack,
  evidence: [
    { ...evidencePack.evidence[0], id: "WORD-A", text: "The same point, phrased differently.", viewId: null },
    { ...evidencePack.evidence[1], id: "WORD-B", text: "The same point with different wording.", viewId: null },
  ],
};
assert.throws(
  () => buildDisagreementState({
    routerOutput,
    evidencePack: wordingOnlyEvidence,
    claims: [{ id: "wording", text: "The supplied sources express the same point.", evidenceIds: ["WORD-A", "WORD-B"] }],
    verifications: [{ claimId: "wording", status: "SUPPORTED", reason: "Different wording only.", evidenceIds: ["WORD-A", "WORD-B"] }],
  }),
  (error) => error instanceof DisagreementStateError,
);

assert.throws(
  () => buildDisagreementState({
    routerOutput, evidencePack, claims,
    verifications: [
      ...verifications.slice(0, -1),
      { claimId: "claim-unsupported", status: "UNSUPPORTED", reason: "Test", evidenceIds: ["FAKE-EVIDENCE"] },
    ],
  }),
  (error) => error instanceof DisagreementStateError,
);

const partialState = buildDisagreementState({
  routerOutput,
  evidencePack,
  claims: [
    { id: "partial-a", text: "A qualified point.", evidenceIds: ["EA"] },
    { id: "partial-b", text: "B qualified point.", evidenceIds: ["EB"] },
  ],
  verifications: [
    { claimId: "partial-a", status: "PARTIAL", reason: "Partial support.", evidenceIds: ["EA"] },
    { claimId: "partial-b", status: "PARTIAL", reason: "Partial support.", evidenceIds: ["EB"] },
  ],
  preferredResponseLanguage: "ar",
});
assert.match(partialState.views[0].summary, /الدليل جزئي/);
assert.match(partialState.views[0].label, /الرأي/);


const conflictedState = buildDisagreementState({
  routerOutput,
  evidencePack,
  claims: [
    { id: "conflicted-a", text: "The first point is contested.", evidenceIds: ["EA"] },
    { id: "conflicted-b", text: "The second point is contested.", evidenceIds: ["EB"] },
  ],
  verifications: [
    { claimId: "conflicted-a", status: "CONFLICTED", reason: "Supplied evidence conflicts.", evidenceIds: ["EA"] },
    { claimId: "conflicted-b", status: "SUPPORTED", reason: "The supplied evidence supports the second view.", evidenceIds: ["EB"] },
  ],
  preferredResponseLanguage: "en",
});
assert.match(conflictedState.views[0].summary, /evidence is conflicted/);\nassert.deepEqual(conflictedState.agreementPoints, []);\nassert.match(conflictedState.disputedPoint, /contested/);

console.log("✓ disagreement special-state tests passed");
