import type { DailyMission, MissionType } from "../types";
import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";
import { mapLegacyPhraseTopic } from "../features/learning-program/mapping";
import { isTopicCode } from "../features/learning-program/catalog";

interface MissionRow {
  id: number;
  mission_date: string;
  mission_type: MissionType;
  target_count: number;
  current_count: number;
  topic: string | null;
  topic_id: number | null;
  topic_code: string | null;
  xp_reward: number;
  is_completed: number;
}

function resolveTopic(row: MissionRow): string | null {
  if (row.topic_code && isTopicCode(row.topic_code)) {
    return row.topic_code;
  }
  if (row.topic) {
    return mapLegacyPhraseTopic(row.topic) ?? row.topic;
  }
  return null;
}

function mapMission(row: MissionRow): DailyMission {
  return {
    id: row.id,
    missionDate: row.mission_date,
    missionType: row.mission_type,
    targetCount: row.target_count,
    currentCount: row.current_count,
    topic: resolveTopic(row),
    topicId: row.topic_id,
    xpReward: row.xp_reward,
    isCompleted: row.is_completed === 1,
  };
}

const MISSION_COLUMNS = `m.id, m.mission_date, m.mission_type, m.target_count, m.current_count,
  m.topic, m.topic_id, t.code AS topic_code, m.xp_reward, m.is_completed`;

export async function listMissionsForDate(missionDate: string): Promise<DailyMission[]> {
  const userId = requireUserId();
  const rows = await select<MissionRow>(
    `SELECT ${MISSION_COLUMNS}
     FROM daily_missions m
     LEFT JOIN topics t ON t.id = m.topic_id
     WHERE m.mission_date = $1 AND m.user_id = $2
     ORDER BY m.id ASC`,
    [missionDate, userId],
  );
  return rows.map(mapMission);
}

export async function insertMission(input: {
  missionDate: string;
  missionType: MissionType;
  targetCount: number;
  topic: string | null;
  topicId: number | null;
  xpReward: number;
}): Promise<void> {
  const userId = requireUserId();
  await execute(
    `INSERT INTO daily_missions
      (mission_date, mission_type, target_count, current_count, topic, topic_id, xp_reward, is_completed, user_id)
     VALUES ($1, $2, $3, 0, $4, $5, $6, 0, $7)`,
    [
      input.missionDate,
      input.missionType,
      input.targetCount,
      input.topic,
      input.topicId,
      input.xpReward,
      userId,
    ],
  );
}

export async function updateMissionProgress(
  id: number,
  currentCount: number,
  isCompleted: boolean,
): Promise<void> {
  const userId = requireUserId();
  await execute(
    "UPDATE daily_missions SET current_count = $1, is_completed = $2 WHERE id = $3 AND user_id = $4",
    [currentCount, isCompleted ? 1 : 0, id, userId],
  );
}

export async function getMissionById(id: number): Promise<DailyMission | null> {
  const userId = requireUserId();
  const row = await selectOne<MissionRow>(
    `SELECT ${MISSION_COLUMNS}
     FROM daily_missions m
     LEFT JOIN topics t ON t.id = m.topic_id
     WHERE m.id = $1 AND m.user_id = $2`,
    [id, userId],
  );
  return row ? mapMission(row) : null;
}
