import type { DailyMission, MissionType, PhraseTopic } from "../types";
import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";

interface MissionRow {
  id: number;
  mission_date: string;
  mission_type: MissionType;
  target_count: number;
  current_count: number;
  topic: PhraseTopic | null;
  xp_reward: number;
  is_completed: number;
}

function mapMission(row: MissionRow): DailyMission {
  return {
    id: row.id,
    missionDate: row.mission_date,
    missionType: row.mission_type,
    targetCount: row.target_count,
    currentCount: row.current_count,
    topic: row.topic,
    xpReward: row.xp_reward,
    isCompleted: row.is_completed === 1,
  };
}

export async function listMissionsForDate(missionDate: string): Promise<DailyMission[]> {
  const userId = requireUserId();
  const rows = await select<MissionRow>(
    `SELECT id, mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed
     FROM daily_missions WHERE mission_date = $1 AND user_id = $2 ORDER BY id ASC`,
    [missionDate, userId],
  );
  return rows.map(mapMission);
}

export async function insertMission(input: {
  missionDate: string;
  missionType: MissionType;
  targetCount: number;
  topic: PhraseTopic | null;
  xpReward: number;
}): Promise<void> {
  const userId = requireUserId();
  await execute(
    `INSERT INTO daily_missions
      (mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed, user_id)
     VALUES ($1, $2, $3, 0, $4, $5, 0, $6)`,
    [input.missionDate, input.missionType, input.targetCount, input.topic, input.xpReward, userId],
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
    `SELECT id, mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed
     FROM daily_missions WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return row ? mapMission(row) : null;
}
