export function formatLookupPhonetic(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && trimmed.endsWith("/") && trimmed.length > 2) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

export function extractIpa(text: string): string | null {
  const match = text.match(/\/[^\s/][^/\n]{0,48}\//);
  return match ? formatLookupPhonetic(match[0]) : null;
}
