import type { DailyMission, MissionType, PhraseTopic } from "../types";
import { execute, select, selectOne } from "./client";

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
  const rows = await select<MissionRow>(
    `SELECT id, mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed
     FROM daily_missions WHERE mission_date = $1 ORDER BY id ASC`,
    [missionDate],
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
  await execute(
    `INSERT INTO daily_missions
      (mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed)
     VALUES ($1, $2, $3, 0, $4, $5, 0)`,
    [input.missionDate, input.missionType, input.targetCount, input.topic, input.xpReward],
  );
}

export async function updateMissionProgress(
  id: number,
  currentCount: number,
  isCompleted: boolean,
): Promise<void> {
  await execute(
    "UPDATE daily_missions SET current_count = $1, is_completed = $2 WHERE id = $3",
    [currentCount, isCompleted ? 1 : 0, id],
  );
}

export async function getMissionById(id: number): Promise<DailyMission | null> {
  const row = await selectOne<MissionRow>(
    `SELECT id, mission_date, mission_type, target_count, current_count, topic, xp_reward, is_completed
     FROM daily_missions WHERE id = $1`,
    [id],
  );
  return row ? mapMission(row) : null;
}
