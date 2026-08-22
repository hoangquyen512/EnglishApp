export type LookupSubmit = { type: "clear" } | { type: "lookup"; query: string };

export function submitLookupQuery(raw: string): LookupSubmit {
  const query = raw.trim();
  if (!query) return { type: "clear" };
  return { type: "lookup", query };
}
