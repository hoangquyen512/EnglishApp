export function readBrowserJson<T>(key: string): T | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeBrowserJson(key: string, value: unknown): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeBrowserJson(key: string): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(key);
}
