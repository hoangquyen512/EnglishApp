const ALLOWED = new Set(["PUBLIC_DOMAIN", "CC_BY", "CC_BY_SA", "LICENSED"]);

export function canPublishStory(input: {
  status: string;
  rightsStatus: string;
  sourceType: string;
}): boolean {
  if (input.status !== "published") return false;
  if (input.sourceType === "INTERNAL_DEMO") return true;
  return ALLOWED.has(input.rightsStatus);
}
