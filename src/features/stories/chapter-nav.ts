export function adjacentChapterId(
  chapters: { id: number; orderNo: number }[],
  currentId: number,
  direction: "prev" | "next",
): number | null {
  const ordered = [...chapters].sort((a, b) => a.orderNo - b.orderNo);
  const index = ordered.findIndex((chapter) => chapter.id === currentId);
  if (index === -1) return null;

  const adjacentIndex = direction === "prev" ? index - 1 : index + 1;
  const adjacent = ordered[adjacentIndex];
  return adjacent?.id ?? null;
}
