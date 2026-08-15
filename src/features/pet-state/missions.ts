import { DAILY_MISSION_COUNT, MISSION_POOL, pickRandomTopic } from "../../constants/missions";
import { todayDate } from "../../lib/dates";
import type { ContentType, DailyMission, MissionType } from "../../types";
import { insertMission, listMissionsForDate, updateMissionProgress } from "../../db/missions";
import { getTopicIdByCode } from "../../db/learning-program";
import { getActiveTopicCodes } from "../learning-program";
import { isTauri } from "../../lib/tauri";

export interface MissionEvent {
  isNew: boolean;
  hadWrong: boolean;
  isCorrect: boolean;
  contentType: ContentType;
  topic: string | null;
}

export function missionCountsToward(
  missionType: MissionType,
  event: MissionEvent,
  missionTopic: string | null,
): boolean {
  if (missionType === "learn_new") {
    return event.isNew;
  }
  if (missionType === "review_wrong") {
    return event.hadWrong;
  }
  return event.isCorrect && missionTopic !== null && event.topic === missionTopic;
}

export async function ensureDailyMissions(now = new Date()): Promise<DailyMission[]> {
  const date = todayDate(now);
  const existing = await listMissionsForDate(date);
  if (existing.length > 0) {
    return existing;
  }

  const active = await getActiveTopicCodes();
  for (const template of MISSION_POOL.slice(0, DAILY_MISSION_COUNT)) {
    const topic = template.withRandomTopic ? pickRandomTopic(active) : null;
    const topicId = topic && isTauri() ? await getTopicIdByCode(topic) : null;
    await insertMission({
      missionDate: date,
      missionType: template.missionType,
      targetCount: template.targetCount,
      topic,
      topicId,
      xpReward: template.xpReward,
    });
  }
  return listMissionsForDate(date);
}

export async function applyMissionProgress(event: MissionEvent): Promise<DailyMission[]> {
  const missions = await ensureDailyMissions();
  const completed: DailyMission[] = [];
  for (const mission of missions) {
    if (mission.isCompleted) {
      continue;
    }
    if (!missionCountsToward(mission.missionType, event, mission.topic)) {
      continue;
    }
    const currentCount = mission.currentCount + 1;
    const isCompleted = currentCount >= mission.targetCount;
    await updateMissionProgress(mission.id, currentCount, isCompleted);
    if (isCompleted) {
      completed.push({ ...mission, currentCount, isCompleted: true });
    }
  }
  return completed;
}
