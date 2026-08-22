export function normalizeLookupWord(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}
