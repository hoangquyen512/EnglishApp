/** Root-relative public asset path, including the Vite `base` (GitHub Pages subpath). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const relative = path.replace(/^\//, "");
  return base.endsWith("/") ? `${base}${relative}` : `${base}/${relative}`;
}
