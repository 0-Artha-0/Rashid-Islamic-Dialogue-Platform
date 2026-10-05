
# Special Response States

Track N provides the structured-state boundary for RASHID's special conversational routes:

- DISAGREEMENT -> DisagreementState
- REFERRAL -> ReferralState

It does not implement the normal answer path, Dialogue Planner, Writer, or Final Verifier.

## Architectural role

The existing pipeline remains:

Question -> E Router -> F Retrieval -> EvidencePack -> H Claims/Gate -> I DialogueState

Track N consumes those outputs when the Router selects a special route.

N does not retrieve evidence, create another Router, or rerun Claim-Evidence verification.

For disagreement:

RouterOutput + EvidencePack + AtomicClaim[] + ClaimVerification[] + optional DialogueState -> buildDisagreementState()

For referral:

RouterOutput + optional response-language/profile context -> buildReferralState()

## DisagreementState

The builder reuses the frozen DisagreementState schema.

A viewpoint is created only when supplied evidence explicitly carries a viewId. At least two distinct evidence-backed view IDs are required. This prevents the module from manufacturing a disagreement from different wording alone.

The builder:
- excludes UNSUPPORTED claims from viewpoints;
- preserves PARTIAL claims as qualified text;
- allows CONFLICTED claims to identify an unresolved disputed point;
- allows SUPPORTED claims to establish supported agreement points when evidence spans multiple supplied views;
- traces every emitted viewpoint to supplied evidence IDs;
- never assigns a scholar, school, source authority, consensus, or citation not already represented by supplied data.

If two distinct evidence-backed viewpoints cannot be established, the builder raises a typed DisagreementStateError instead of fabricating a state.

No LLM is required for the current implementation. The deterministic builder is preferred because the state can be derived from frozen claim/evidence verification outputs without asking a model to invent organization.

## ReferralState

buildReferralState() treats RouterOutput as authoritative and never reclassifies the question.

- personalRuling=true maps deterministically to personal_fatwa.
- A non-personal REFERRAL without a more specific frozen enum maps to out_of_scope.
- Only existing ReferralState enum values are used.
- Caller-supplied safe general information may be attached, but N never creates a personalized ruling from it.
- No scholar or contact details are invented.
- Specialist type defaults to a generic qualified authority, not a named person.

Referral messages prefer preferredResponseLanguage. Arabic and English are built in. Other languages can supply a caller-owned localized message without creating a second architecture. uiLanguage is only a fallback when no preferred response language is supplied; queryLanguage remains classification metadata and is not used as a response-language override.

## Verification and safety invariants

Before building disagreement state, N validates:
- exactly one verification per claim;
- every claim/evidence reference exists;
- non-UNSUPPORTED verifications have at least one real evidence ID;
- UNSUPPORTED claims never become views;
- no unknown IDs are emitted;
- final state passes the frozen Zod schema;
- every emitted view has at least one supplied evidence ID.

Referral validates RouterOutput and ReferralState and fails closed when the route is not REFERRAL.

N never repairs missing religious facts. Malformed or unsupported special state is rejected rather than silently rewritten.

## Multilingual behavior

queryLanguage, preferredResponseLanguage, and uiLanguage remain separate.
- preferredResponseLanguage controls special-state wording when available;
- uiLanguage is only a fallback for referral messaging;
- queryLanguage remains Router classification metadata;
- Arabic and English are built in;
- other languages can provide localized strings through the caller-owned localizedMessages map;
- source quotations are never translated by N and presented as originals.

## Integration boundary

J/K/L/M can later embed these state objects into StructuredResponse.

N does not force Chat API integration and does not copy J implementation. The frontend owns rendering. No frontend files are modified by Track N.

Track I buildDiscussionMap() and buildEvidenceGraph() remain the source of truth for those graphs; N does not rebuild either.

## Tests

Track N tests cover:
- two evidence-backed viewpoints;
- shared supported agreement;
- PARTIAL remains qualified;
- UNSUPPORTED claims are excluded;
- wording-only evidence does not create disagreement;
- invalid evidence references are rejected;
- Arabic and English special-state output;
- personal referral;
- non-personal referral mapping;
- no personalized ruling;
- caller-supplied localization;
- frozen schema validation.

Run:
npm run test:disagreement
npm run test:referral
npm run test:router
npm run test:evidence-gate
npm run validate:mocks
npm run build
