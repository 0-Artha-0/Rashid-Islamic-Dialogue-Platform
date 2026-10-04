# راشد | RASHID

RASHID is an Arabic-first, evidence-based Islamic dialogue platform for guided learning, structured discussion, source inspection, scholarly disagreement handling, and safe referral.

## Current status

This repository contains the project scaffold agreed for the hackathon MVP. The religious knowledge corpus and production AI behavior are intentionally added in later modules and must follow the approved challenge sources.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zod
- Render
- GitHub

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local` and add real values locally only.

## Main project structure

```text
src/
  app/
  components/
  lib/
    ai/
    rag/
    graphs/
    schemas/
  prompts/
  types/
data/
  raw/
  normalized/
  processed/
  embeddings/
  mock/
  tests/
scripts/
docs/
public/
  brand/
```

## Safety rule

Religious claims in the final product must be grounded only in the approved challenge corpus. RASHID is not a fatwa engine and must support abstention/referral for personal rulings or insufficient evidence.

## Deployment

Preferred hackathon flow: connect this repository to Render as a **Web Service**. Do not rely on a Blueprint unless its configuration has been reviewed.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```
