import { ART_PREFIX } from "./ids";

const ART_SLOTS = 8;

export function illustrationSrc(phraseId: string): string {
  const dash = phraseId.lastIndexOf("-");
  const rawPrefix = dash === -1 ? "greet" : phraseId.slice(0, dash);
  const prefix = ART_PREFIX[rawPrefix] ?? "greet";
  const n = Number(phraseId.slice(dash + 1));
  const slot = Number.isFinite(n) && n > 0 ? ((n - 1) % ART_SLOTS) + 1 : 1;
  return `/illustrations/${prefix}-${slot}.jpg`;
}
