export const RECENT_LOOKUP_STORAGE_KEY = "yume.quick-lookup.recent";
export const RECENT_LOOKUP_MAX = 12;

export type RecentLookupStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase();
}

function sanitizeList(list: string[], max = RECENT_LOOKUP_MAX): string[] {
  const cleaned: string[] = [];
  for (const item of list) {
    const next = normalizeQuery(item);
    if (!next || cleaned.includes(next)) {
      continue;
    }
    cleaned.push(next);
    if (cleaned.length >= max) {
      break;
    }
  }
  return cleaned;
}

export function pushRecentQuery(
  list: string[],
  query: string,
  max = RECENT_LOOKUP_MAX,
): string[] {
  const next = normalizeQuery(query);
  if (!next) {
    return list;
  }
  return [next, ...list.filter((item) => item !== next)].slice(0, max);
}

export function removeRecentQuery(list: string[], query: string): string[] {
  const target = normalizeQuery(query);
  return list.filter((item) => item !== target);
}

export function clearRecentQueries(): string[] {
  return [];
}

export function readRecentLookups(storage?: RecentLookupStorage | null): string[] {
  const store = storage ?? defaultStorage();
  if (!store) {
    return [];
  }
  try {
    const raw = store.getItem(RECENT_LOOKUP_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return sanitizeList(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

export function writeRecentLookups(
  list: string[],
  storage?: RecentLookupStorage | null,
): void {
  const store = storage ?? defaultStorage();
  if (!store) {
    return;
  }
  store.setItem(RECENT_LOOKUP_STORAGE_KEY, JSON.stringify(sanitizeList(list)));
}

function defaultStorage(): RecentLookupStorage | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage;
}
