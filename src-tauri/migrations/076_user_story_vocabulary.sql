CREATE TABLE user_story_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  lemma TEXT NOT NULL,
  ipa TEXT,
  meaning_vi TEXT NOT NULL,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
  sentence_id INTEGER REFERENCES story_sentences(id) ON DELETE SET NULL,
  original_sentence TEXT,
  context_translation TEXT,
  mastery_level INTEGER NOT NULL DEFAULT 0,
  saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
