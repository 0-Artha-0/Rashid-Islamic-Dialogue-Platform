import fs from "node:fs";
import readline from "node:readline";
import { baseSourceRecordSchema, chunkRecordSchema } from "../src/lib/schemas/corpus";

async function validate(path: string, schema: typeof baseSourceRecordSchema | typeof chunkRecordSchema) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path, { encoding: "utf8" }),
    crlfDelay: Infinity
  });
  let count = 0;
  const ids = new Set<string>();
  const errors: Array<{line:number; error:string}> = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    count++;
    try {
      const row = JSON.parse(line);
      const parsed = schema.parse(row);
      const id = "recordId" in parsed ? parsed.recordId : parsed.chunkId;
      if (ids.has(id)) throw new Error(`duplicate id: ${id}`);
      ids.add(id);
    } catch (error) {
      errors.push({ line: count, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { count, errors };
}

const normalizedPath = "data/normalized/dorar-hadith.jsonl";
const processedPath = "data/processed/dorar-hadith-chunks.jsonl";
if (!fs.existsSync(normalizedPath) || !fs.existsSync(processedPath)) {
  throw new Error("Build outputs are missing. Run build-corpus first.");
}

const normalized = await validate(normalizedPath, baseSourceRecordSchema);
const chunks = await validate(processedPath, chunkRecordSchema);
const result = {
  normalizedRecords: normalized.count,
  normalizedValidationFailures: normalized.errors,
  chunkRecords: chunks.count,
  chunkValidationFailures: chunks.errors,
  pass: normalized.errors.length === 0 && chunks.errors.length === 0
};

console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exitCode = 1;
