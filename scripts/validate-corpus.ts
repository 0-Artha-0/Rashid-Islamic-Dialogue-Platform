import fs from "node:fs";
import readline from "node:readline";
import { baseSourceRecordSchema, chunkRecordSchema } from "../src/lib/schemas/corpus";

type RegistryEntry = {
  sourceId: string;
  sourceType: string;
  language?: string;
  recordCount?: number;
};

const registryPath = "data/source-registry.json";
const normalizedPath = "data/normalized/dorar-hadith.jsonl";
const processedPath = "data/processed/dorar-hadith-chunks.jsonl";

async function readJsonl(path: string) {
  const rows: any[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
  let line = 0;
  const parseErrors: Array<{line:number; error:string}> = [];
  for await (const raw of rl) {
    if (!raw.trim()) continue;
    line++;
    try {
      rows.push({ value: JSON.parse(raw), line });
    } catch (error) {
      parseErrors.push({ line, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { rows, parseErrors };
}

if (!fs.existsSync(normalizedPath) || !fs.existsSync(processedPath)) {
  throw new Error("Build outputs are missing. Run build-corpus first.");
}
if (!fs.existsSync(registryPath)) throw new Error("Source registry is missing.");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as RegistryEntry[];
const registryById = new Map(registry.map(entry => [entry.sourceId, entry]));
const normalizedRead = await readJsonl(normalizedPath);
const chunkRead = await readJsonl(processedPath);

const failures: Array<{scope:string; line?:number; error:string}> = [];
for (const error of normalizedRead.parseErrors) failures.push({ scope: "normalized", ...error });
for (const error of chunkRead.parseErrors) failures.push({ scope: "chunks", ...error });

const normalizedById = new Map<string, any>();
const normalizedIds = new Set<string>();

for (const { value, line } of normalizedRead.rows) {
  try {
    const record = baseSourceRecordSchema.parse(value);
    if (normalizedIds.has(record.recordId)) throw new Error(`duplicate recordId: ${record.recordId}`);
    normalizedIds.add(record.recordId);
    normalizedById.set(record.recordId, record);

    const source = registryById.get(record.sourceId);
    if (!source) throw new Error(`sourceId not registered: ${record.sourceId}`);
    if (source.sourceType !== record.sourceType) throw new Error(`sourceType mismatch for ${record.recordId}`);
    if (source.language && source.language !== record.language) throw new Error(`language mismatch for ${record.recordId}`);
    if (!record.text.trim()) throw new Error(`empty religious text: ${record.recordId}`);
    if (!record.locator.trim()) throw new Error(`missing provenance locator: ${record.recordId}`);

    if (record.sourceId === "dorar-hadith-local") {
      if (!record.metadata?.originalKey) throw new Error(`missing Dorar originalKey: ${record.recordId}`);
      if (!record.metadata?.grading) throw new Error(`missing Dorar grading: ${record.recordId}`);
      if (!record.metadata?.provenance?.rawLine) throw new Error(`missing Dorar raw-line provenance: ${record.recordId}`);
    }
  } catch (error) {
    failures.push({ scope: "normalized", line, error: error instanceof Error ? error.message : String(error) });
  }
}

const chunkIds = new Set<string>();
for (const { value, line } of chunkRead.rows) {
  try {
    const chunk = chunkRecordSchema.parse(value);
    if (chunkIds.has(chunk.chunkId)) throw new Error(`duplicate chunkId: ${chunk.chunkId}`);
    chunkIds.add(chunk.chunkId);

    const source = registryById.get(chunk.sourceId);
    if (!source) throw new Error(`chunk sourceId not registered: ${chunk.sourceId}`);
    if (source.sourceType !== chunk.sourceType) throw new Error(`chunk sourceType mismatch: ${chunk.chunkId}`);
    if (source.language && source.language !== chunk.language) throw new Error(`chunk language mismatch: ${chunk.chunkId}`);

    const record = normalizedById.get(chunk.recordId);
    if (!record) throw new Error(`chunk references missing recordId: ${chunk.chunkId} -> ${chunk.recordId}`);
    if (record.sourceId !== chunk.sourceId || record.sourceType !== chunk.sourceType || record.language !== chunk.language) {
      throw new Error(`chunk-to-record provenance mismatch: ${chunk.chunkId}`);
    }
    if (!chunk.text.trim()) throw new Error(`empty chunk text: ${chunk.chunkId}`);
  } catch (error) {
    failures.push({ scope: "chunks", line, error: error instanceof Error ? error.message : String(error) });
  }
}

const result = {
  normalizedRecords: normalizedRead.rows.length,
  chunkRecords: chunkRead.rows.length,
  registryEntries: registry.length,
  validationFailures: failures,
  pass: failures.length === 0
};

console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exitCode = 1;
