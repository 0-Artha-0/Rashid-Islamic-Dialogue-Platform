// Database client wiring will be added after the access method is selected.
export function getDatabaseClient(): never {
  throw new Error("Database client is not configured yet.");
}
