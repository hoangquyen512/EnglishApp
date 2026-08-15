import type { MissionType } from "../types";
import type { TopicCode } from "../features/learning-program/catalog";
import { DEFAULT_ACTIVE_TOPIC_CODES } from "../features/learning-program/catalog";

export interface MissionTemplate {
  missionType: MissionType;
  targetCount: number;
  xpReward: number;
  withRandomTopic: boolean;
}

export const MISSION_POOL: MissionTemplate[] = [
  {
    missionType: "learn_new",
    targetCount: 10,
    xpReward: 15,
    withRandomTopic: false,
  },
  {
    missionType: "review_wrong",
    targetCount: 5,
    xpReward: 10,
    withRandomTopic: false,
  },
  {
    missionType: "topic_practice",
    targetCount: 3,
    xpReward: 12,
    withRandomTopic: true,
  },
];

export const DAILY_MISSION_COUNT = 3;

export function pickRandomTopic(
  active: TopicCode[] = DEFAULT_ACTIVE_TOPIC_CODES,
  random = Math.random,
): TopicCode | null {
  if (active.length === 0) {
    return null;
  }
  const index = Math.floor(random() * active.length);
  return active[index] ?? null;
}
