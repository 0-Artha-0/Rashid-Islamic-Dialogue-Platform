# Track C — Local Curated Corpus

## Scope

This track owns the local curated corpus only. It complements live retrieval from approved APIs/MCP and approved-domain search; it is not a complete archive of the approved references.

## Current component

- **Dorar.net hadith subset:** 2,000 supplied JSONL records.
- Raw data must remain unchanged under `data/raw/dorar/`.
- Each hadith is kept as one semantic chunk.
- Dorar's supplied grading/attribution fields are preserved as metadata.
- No new authenticity judgment, paraphrase, or machine translation is added.
- Stable IDs are derived deterministically from the supplied original key.
- Provenance keeps the original JSONL line number and key.

## Planned MVP components

These are intentionally empty until an approved source payload/access is available:

- approved Islamic terminology
- introductory Islam/Da'wah material
- approved misconceptions / FAQs
- a small demo-topic guarantee set

Do not fabricate local records for these categories.

## Commands

`npx tsx scripts/inspect-dorar.ts`

`npx tsx scripts/build-corpus.ts`

`npx tsx scripts/validate-corpus.ts`

## Safety

The local corpus is evidence data, not model-generated religious knowledge. Retrieval code must preserve source metadata and traceability. Final religious claims must still pass the project's evidence/claim gate.
