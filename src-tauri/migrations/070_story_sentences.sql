CREATE TABLE story_sentences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_unit_id INTEGER NOT NULL REFERENCES story_content_units(id) ON DELETE CASCADE,
  order_no INTEGER NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  source_text TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  cefr_level TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
