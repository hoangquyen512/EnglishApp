import type {
  CefrLevelPreference,
  ContentTypePreference,
  TopicCode,
} from "../features/learning-program/catalog";
import { DEFAULT_ACTIVE_TOPIC_CODES, isTopicCode } from "../features/learning-program/catalog";
import { TOPIC_CONVERSATION_BANKS } from "../features/learning-program/mapping";
import type { ConversationTopicId } from "../types";
import { execute, select, selectOne } from "./client";
import { requireUserId } from "./current-user";

export interface LearningProgramRow {
  id: number;
  userId: number;
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  updatedAt: string;
  topicCodes: TopicCode[];
}

interface ProgramSqlRow {
  id: number;
  user_id: number;
  program_name: string;
  level_preference: string;
  content_type_preference: string;
  updated_at: string;
}

function asLevel(value: string): CefrLevelPreference {
  if (value === "A1" || value === "A2" || value === "B1" || value === "B2") {
    return value;
  }
  return "A2";
}

function asContentType(value: string): ContentTypePreference {
  if (value === "vocabulary" || value === "phrase" || value === "both") {
    return value;
  }
  return "both";
}

async function loadTopicCodes(programId: number): Promise<TopicCode[]> {
  const rows = await select<{ code: string }>(
    `SELECT t.code AS code
     FROM learning_program_topics lpt
     JOIN topics t ON t.id = lpt.topic_id
     WHERE lpt.program_id = $1
     ORDER BY t.id ASC`,
    [programId],
  );
  return rows.map((row) => row.code).filter(isTopicCode);
}

export async function getLearningProgramForUser(userId: number): Promise<LearningProgramRow | null> {
  const row = await selectOne<ProgramSqlRow>(
    `SELECT id, user_id, program_name, level_preference, content_type_preference, updated_at
     FROM learning_program WHERE user_id = $1`,
    [userId],
  );
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    programName: row.program_name,
    levelPreference: asLevel(row.level_preference),
    contentTypePreference: asContentType(row.content_type_preference),
    updatedAt: row.updated_at,
    topicCodes: await loadTopicCodes(row.id),
  };
}

export async function insertLearningProgram(userId: number): Promise<number> {
  await execute(
    `INSERT INTO learning_program (user_id, program_name, level_preference, content_type_preference)
     VALUES ($1, 'Chương trình học của tôi', 'A2', 'both')`,
    [userId],
  );
  const row = await selectOne<{ id: number }>(
    "SELECT id FROM learning_program WHERE user_id = $1",
    [userId],
  );
  if (!row) {
    throw new Error("Failed to create learning program");
  }
  return row.id;
}

export async function replaceProgramTopics(programId: number, topicCodes: TopicCode[]): Promise<void> {
  await execute("DELETE FROM learning_program_topics WHERE program_id = $1", [programId]);
  for (const code of topicCodes) {
    await execute(
      `INSERT INTO learning_program_topics (program_id, topic_id)
       SELECT $1, id FROM topics WHERE code = $2`,
      [programId, code],
    );
  }
}

export async function updateLearningProgram(input: {
  programId: number;
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  topicCodes: TopicCode[];
}): Promise<void> {
  await execute(
    `UPDATE learning_program
     SET program_name = $1,
         level_preference = $2,
         content_type_preference = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [input.programName, input.levelPreference, input.contentTypePreference, input.programId],
  );
  await replaceProgramTopics(input.programId, input.topicCodes);
}

export async function seedDefaultProgramTopics(programId: number): Promise<void> {
  await replaceProgramTopics(programId, DEFAULT_ACTIVE_TOPIC_CODES);
}

export async function listTopicIdsByCodes(codes: TopicCode[]): Promise<number[]> {
  if (codes.length === 0) {
    return [];
  }
  const rows = await select<{ id: number; code: string }>(
    "SELECT id, code FROM topics ORDER BY id ASC",
  );
  const wanted = new Set(codes);
  return rows.filter((row) => wanted.has(row.code as TopicCode)).map((row) => row.id);
}

export async function listActiveTopicCodes(): Promise<TopicCode[]> {
  const userId = requireUserId();
  const program = await getLearningProgramForUser(userId);
  return program?.topicCodes ?? [...DEFAULT_ACTIVE_TOPIC_CODES];
}

export async function countContentForTopicCodes(codes: TopicCode[]): Promise<number> {
  if (codes.length === 0) {
    return 0;
  }
  const ids = await listTopicIdsByCodes(codes);
  if (ids.length === 0) {
    return 0;
  }
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
  const vocab = await selectOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM vocabulary WHERE topic_id IN (${placeholders})`,
    ids,
  );
  const phrases = await selectOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM phrases WHERE topic_id IN (${placeholders})`,
    ids,
  );
  let conversation = 0;
  for (const code of codes) {
    conversation += (TOPIC_CONVERSATION_BANKS[code] ?? []).length * 1000;
  }
  return (vocab?.count ?? 0) + (phrases?.count ?? 0) + conversation;
}

export async function listConversationBanksForActiveTopics(): Promise<
  Array<{ bankId: ConversationTopicId; topicCode: TopicCode }>
> {
  const codes = await listActiveTopicCodes();
  const rows: Array<{ bankId: ConversationTopicId; topicCode: TopicCode }> = [];
  const seen = new Set<string>();
  for (const code of codes) {
    for (const bankId of TOPIC_CONVERSATION_BANKS[code] ?? []) {
      const key = `${bankId}:${code}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ bankId, topicCode: code });
      }
    }
  }
  return rows;
}

export async function getTopicIdByCode(code: TopicCode): Promise<number | null> {
  const row = await selectOne<{ id: number }>("SELECT id FROM topics WHERE code = $1", [code]);
  return row?.id ?? null;
}

export async function getTopicCodeById(id: number): Promise<TopicCode | null> {
  const row = await selectOne<{ code: string }>("SELECT code FROM topics WHERE id = $1", [id]);
  return row && isTopicCode(row.code) ? row.code : null;
}
