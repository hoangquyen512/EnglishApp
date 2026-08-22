export function studyModeFromStored(value: string): "vocabulary" | "phrase" {
  if (value === "phrase" || value === "conversation") {
    return "phrase";
  }
  return "vocabulary";
}
