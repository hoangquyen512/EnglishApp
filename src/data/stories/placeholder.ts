/** Detect legacy seed stubs that are not readable story prose. */
export function isPlaceholderStoryText(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return (
    normalized.includes("placeholder content") ||
    normalized.includes("nội dung mẫu") ||
    normalized.includes("continues the story of sora") ||
    normalized.includes("tiếp tục câu chuyện của sora")
  );
}

export function chapterHasPlaceholderContent(
  units: ReadonlyArray<{ enSentences: readonly string[] }>,
): boolean {
  if (units.length === 0) return true;
  const first = units[0]?.enSentences[0] ?? "";
  if (isPlaceholderStoryText(first)) return true;
  // Single-sentence chapter stubs from the first MVP seed.
  if (units.length === 1 && units[0]!.enSentences.length === 1) {
    const sentence = units[0]!.enSentences[0] ?? "";
    return sentence.split(/\s+/).length < 12;
  }
  return false;
}
