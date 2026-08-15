import {
  CONTENT_VERSION,
  PHASE1_PHRASES,
  PHASE1_TOPIC_CODES,
  PHASE1_VOCABULARY,
} from "../data/lexicon/phase1";
import { execute, selectOne } from "./client";
import { getTopicIdByCode } from "./learning-program";
import type { TopicCode } from "../features/learning-program/catalog";

const INSERT_CHUNK = 50;

let importInFlight: Promise<void> | null = null;

async function getImportVersion(dataset: string, topicCode: string): Promise<string | null> {
  const row = await selectOne<{ content_version: string }>(
    `SELECT content_version FROM content_import_state
     WHERE dataset = $1 AND topic_code = $2`,
    [dataset, topicCode],
  );
  return row?.content_version ?? null;
}

async function setImportVersion(dataset: string, topicCode: string, version: string): Promise<void> {
  await execute(
    `INSERT INTO content_import_state (dataset, topic_code, content_version, imported_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT(dataset, topic_code) DO UPDATE SET
       content_version = excluded.content_version,
       imported_at = CURRENT_TIMESTAMP`,
    [dataset, topicCode, version],
  );
}

async function importVocabularyForTopic(code: TopicCode): Promise<void> {
  const topicId = await getTopicIdByCode(code);
  if (topicId == null) return;
  const rows = PHASE1_VOCABULARY[code] ?? [];
  await execute("BEGIN");
  try {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
      const chunk = rows.slice(i, i + INSERT_CHUNK);
      const placeholders = chunk
        .map((_, index) => {
          const base = index * 8;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, 'topic', $${base + 8})`;
        })
        .join(", ");
      const params = chunk.flatMap((row) => [
        row.word,
        row.meaning,
        row.example,
        row.exampleVi,
        row.phonetic,
        row.partOfSpeech,
        row.imageKey,
        topicId,
      ]);
      await execute(
        `INSERT INTO vocabulary (word, meaning, example, example_vi, phonetic, part_of_speech, image_key, category, topic_id)
         VALUES ${placeholders}
         ON CONFLICT(word) DO UPDATE SET
           meaning = excluded.meaning,
           example = excluded.example,
           example_vi = excluded.example_vi,
           phonetic = excluded.phonetic,
           part_of_speech = excluded.part_of_speech,
           image_key = excluded.image_key,
           topic_id = excluded.topic_id`,
        params,
      );
    }
    await setImportVersion("vocabulary", code, CONTENT_VERSION);
    await execute("COMMIT");
  } catch (error) {
    try {
      await execute("ROLLBACK");
    } catch {
      // ignore rollback failure after a failed batch
    }
    throw error;
  }
}

async function importPhrasesForTopic(code: TopicCode): Promise<void> {
  const topicId = await getTopicIdByCode(code);
  if (topicId == null) return;
  const rows = PHASE1_PHRASES[code] ?? [];
  await execute("BEGIN");
  try {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
      const chunk = rows.slice(i, i + INSERT_CHUNK);
      const placeholders = chunk
        .map((_, index) => {
          const base = index * 5;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
        })
        .join(", ");
      const params = chunk.flatMap((row) => [row.en, row.vi, code, topicId, row.level]);
      await execute(
        `INSERT INTO phrases (phrase_en, meaning_vi, topic, topic_id, level)
         VALUES ${placeholders}
         ON CONFLICT(phrase_en, topic_id) DO UPDATE SET
           meaning_vi = excluded.meaning_vi,
           topic = excluded.topic,
           level = excluded.level`,
        params,
      );
    }
    await setImportVersion("phrases", code, CONTENT_VERSION);
    await execute("COMMIT");
  } catch (error) {
    try {
      await execute("ROLLBACK");
    } catch {
      // ignore rollback failure after a failed batch
    }
    throw error;
  }
}

async function runPhase1LexiconImport(): Promise<void> {
  for (const code of PHASE1_TOPIC_CODES) {
    const vocabVersion = await getImportVersion("vocabulary", code);
    if (vocabVersion !== CONTENT_VERSION) {
      await importVocabularyForTopic(code);
    }
    const phraseVersion = await getImportVersion("phrases", code);
    if (phraseVersion !== CONTENT_VERSION) {
      await importPhrasesForTopic(code);
    }
  }
}

/** Idempotent import of phase-1 lexicon. Safe to call multiple times; shares one in-flight job. */
export async function ensurePhase1LexiconImported(): Promise<void> {
  if (!importInFlight) {
    importInFlight = runPhase1LexiconImport().finally(() => {
      importInFlight = null;
    });
  }
  await importInFlight;
}
