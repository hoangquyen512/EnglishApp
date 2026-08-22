export function exampleSentence(word: string, fromApi: string | null | undefined): string {
  const trimmed = fromApi?.trim();
  if (trimmed) {
    return trimmed;
  }
  const w = word.trim() || "word";
  return `This ${w} is a good example.`;
}
