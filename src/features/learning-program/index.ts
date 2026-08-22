import { conversationTopics } from "../../data/conversation/topics";
import { SEED_PHRASES } from "../../data/seed-phrases";
import { TOEIC_CARDS } from "../../data/toeic-cards";
import {
  countContentForTopicCodes,
  getLearningProgramForUser,
  insertLearningProgram,
  listActiveTopicCodes,
  listConversationBanksForActiveTopics,
  seedDefaultProgramTopics,
  updateLearningProgram,
  type LearningProgramRow,
} from "../../db/learning-program";
import { peekCurrentUserId, requireUserId } from "../../db/current-user";
import { readBrowserJson, writeBrowserJson } from "../../lib/browser-persist";
import { isTauri } from "../../lib/tauri";
import type { ConversationTopicId } from "../../types";
import {
  DEFAULT_ACTIVE_TOPIC_CODES,
  type CefrLevelPreference,
  type ContentTypePreference,
  type TopicCode,
} from "./catalog";
import { conversationBanksForTopics, mapLegacyPhraseTopic, TOPIC_CONVERSATION_BANKS } from "./mapping";
import { canSaveTopicSelection, MIN_PROGRAM_CONTENT, shouldWarnLowContent } from "./validate";
import { assignVocabTopicCode } from "./vocab-heuristic";

export interface LearningProgramView {
  id: number | null;
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  topicCodes: TopicCode[];
  contentCount: number;
  lowContentWarning: boolean;
}

interface BrowserProgram {
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  topicCodes: TopicCode[];
}

const browserMemory = new Map<number, BrowserProgram>();

function browserKey(userId: number): string {
  return `yume-learning-program:${userId}`;
}

function defaultBrowserProgram(): BrowserProgram {
  return {
    programName: "Chương trình học của tôi",
    levelPreference: "A2",
    contentTypePreference: "both",
    topicCodes: [...DEFAULT_ACTIVE_TOPIC_CODES],
  };
}

function loadBrowserProgram(userId: number): BrowserProgram {
  const fromDisk = readBrowserJson<BrowserProgram>(browserKey(userId));
  if (fromDisk) {
    browserMemory.set(userId, fromDisk);
    return fromDisk;
  }
  return browserMemory.get(userId) ?? defaultBrowserProgram();
}

function saveBrowserProgram(userId: number, program: BrowserProgram): void {
  browserMemory.set(userId, program);
  writeBrowserJson(browserKey(userId), program);
}

function countBrowserContent(codes: TopicCode[]): number {
  const vocab = TOEIC_CARDS.filter((card) => {
    const topic = assignVocabTopicCode(card.word);
    return topic !== null && codes.includes(topic);
  }).length;
  const phrases = SEED_PHRASES.filter((item) => {
    const mapped = mapLegacyPhraseTopic(item.topic);
    return mapped !== null && codes.includes(mapped);
  }).length;
  let conversation = 0;
  for (const bankId of conversationBanksForTopics(codes)) {
    const topic = conversationTopics.find((item) => item.id === bankId);
    conversation += topic?.phrases.length ?? 0;
  }
  return vocab + phrases + conversation;
}

function toView(program: {
  id: number | null;
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  topicCodes: TopicCode[];
  contentCount: number;
}): LearningProgramView {
  return {
    ...program,
    lowContentWarning: shouldWarnLowContent(program.contentCount, MIN_PROGRAM_CONTENT),
  };
}

function mapRow(row: LearningProgramRow, contentCount: number) {
  return {
    id: row.id,
    programName: row.programName,
    levelPreference: row.levelPreference,
    contentTypePreference: row.contentTypePreference,
    topicCodes: row.topicCodes,
    contentCount,
  };
}

export async function ensureLearningProgram(): Promise<LearningProgramView> {
  if (!isTauri()) {
    const userId = peekCurrentUserId() ?? 0;
    const program = loadBrowserProgram(userId);
    return toView({
      id: null,
      programName: program.programName,
      levelPreference: program.levelPreference,
      contentTypePreference: program.contentTypePreference,
      topicCodes: program.topicCodes,
      contentCount: countBrowserContent(program.topicCodes),
    });
  }

  const userId = requireUserId();
  let row = await getLearningProgramForUser(userId);
  if (!row) {
    const id = await insertLearningProgram(userId);
    await seedDefaultProgramTopics(id);
    row = await getLearningProgramForUser(userId);
  }
  if (!row) {
    throw new Error("Learning program missing after ensure");
  }
  if (row.topicCodes.length === 0) {
    await seedDefaultProgramTopics(row.id);
    row = (await getLearningProgramForUser(userId))!;
  }
  const contentCount = await countContentForTopicCodes(row.topicCodes);
  return toView(mapRow(row, contentCount));
}

export async function loadLearningProgram(): Promise<LearningProgramView> {
  return ensureLearningProgram();
}

export async function saveLearningProgram(input: {
  programName: string;
  levelPreference: CefrLevelPreference;
  contentTypePreference: ContentTypePreference;
  topicCodes: TopicCode[];
}): Promise<LearningProgramView> {
  if (!canSaveTopicSelection(input.topicCodes)) {
    throw new Error("Cần ít nhất một chủ đề");
  }

  if (!isTauri()) {
    const userId = peekCurrentUserId() ?? 0;
    const program: BrowserProgram = {
      programName: input.programName.trim() || "Chương trình học của tôi",
      levelPreference: input.levelPreference,
      contentTypePreference: input.contentTypePreference,
      topicCodes: input.topicCodes,
    };
    saveBrowserProgram(userId, program);
    return toView({
      id: null,
      ...program,
      contentCount: countBrowserContent(program.topicCodes),
    });
  }

  const current = await ensureLearningProgram();
  if (current.id == null) {
    throw new Error("Learning program id missing");
  }
  await updateLearningProgram({
    programId: current.id,
    programName: input.programName.trim() || "Chương trình học của tôi",
    levelPreference: input.levelPreference,
    contentTypePreference: input.contentTypePreference,
    topicCodes: input.topicCodes,
  });
  return loadLearningProgram();
}

export async function getActiveTopicCodes(): Promise<TopicCode[]> {
  if (!isTauri()) {
    const userId = peekCurrentUserId() ?? 0;
    return loadBrowserProgram(userId).topicCodes;
  }
  await ensureLearningProgram();
  return listActiveTopicCodes();
}

export async function getActiveLevelPreference(): Promise<CefrLevelPreference> {
  const program = await ensureLearningProgram();
  return program.levelPreference;
}

export async function getActiveConversationBanks(): Promise<
  Array<{ bankId: ConversationTopicId; topicCode: TopicCode }>
> {
  if (!isTauri()) {
    const codes = await getActiveTopicCodes();
    const rows: Array<{ bankId: ConversationTopicId; topicCode: TopicCode }> = [];
    const seen = new Set<ConversationTopicId>();
    for (const code of codes) {
      for (const bankId of TOPIC_CONVERSATION_BANKS[code] ?? []) {
        if (!seen.has(bankId)) {
          seen.add(bankId);
          rows.push({ bankId, topicCode: code });
        }
      }
    }
    return rows;
  }
  await ensureLearningProgram();
  return listConversationBanksForActiveTopics();
}

export async function previewContentCount(topicCodes: TopicCode[]): Promise<number> {
  if (!isTauri()) {
    return countBrowserContent(topicCodes);
  }
  return countContentForTopicCodes(topicCodes);
}

export {
  DEFAULT_ACTIVE_TOPIC_CODES,
  TOPIC_BY_CODE,
  TOPIC_CATALOG,
  TOPIC_CATEGORY_LABELS,
  topicsByCategory,
  isTopicCode,
} from "./catalog";
export type { TopicCode, TopicCategory, TopicDefinition, CefrLevelPreference, ContentTypePreference } from "./catalog";
export { conversationBanksForTopics, mapLegacyPhraseTopic, TOPIC_CONVERSATION_BANKS } from "./mapping";
export { phraseLevelAllowed } from "./level";
export {
  canSaveTopicSelection,
  defaultContentTypeFromPreference,
  MIN_PROGRAM_CONTENT,
  pickRandomTopicCode,
  shouldWarnLowContent,
  toggleTopicSelection,
} from "./validate";
export { assignVocabTopicCode, vocabWordsForTopic } from "./vocab-heuristic";
export { buildRoadmapSnapshot } from "./roadmap-summary";
export type { RoadmapSnapshot } from "./roadmap-summary";
