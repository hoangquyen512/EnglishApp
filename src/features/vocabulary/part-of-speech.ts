/** Maps short POS tags (n., v., …) to Vietnamese labels for flashcards. */
const POS_LABELS: Record<string, string> = {
  "n.": "Danh từ",
  "v.": "Động từ",
  "adj.": "Tính từ",
  "adv.": "Trạng từ",
  n: "Danh từ",
  v: "Động từ",
  adj: "Tính từ",
  adv: "Trạng từ",
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
};

export function partOfSpeechLabel(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const key = raw.trim().toLowerCase();
  return POS_LABELS[key] ?? raw.trim();
}
