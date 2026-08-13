import type { MissionType, PhraseTopic } from "../types";
import { TOPICS } from "./ui";

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

export function pickRandomTopic(random = Math.random): PhraseTopic {
  const index = Math.floor(random() * TOPICS.length);
  return TOPICS[index] ?? "travel";
}
