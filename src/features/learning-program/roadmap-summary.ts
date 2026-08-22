import type { CefrLevelPreference, ContentTypePreference } from "./catalog";

export interface RoadmapSnapshot {
  level: CefrLevelPreference;
  priorityLabel: string;
  topicCountLabel: string;
  reminderLabel: string;
}

/** Live summary for the learning-program roadmap card. */
export function buildRoadmapSnapshot(input: {
  level: CefrLevelPreference;
  contentType: ContentTypePreference;
  topicCount: number;
  intervalMinutes: number;
  contentLabels: Record<ContentTypePreference, string>;
  topicCountTemplate: string;
  reminderTemplate: string;
}): RoadmapSnapshot {
  return {
    level: input.level,
    priorityLabel: input.contentLabels[input.contentType],
    topicCountLabel: input.topicCountTemplate.replace("{n}", String(input.topicCount)),
    reminderLabel: input.reminderTemplate.replace("{n}", String(input.intervalMinutes)),
  };
}
