CREATE TABLE user_story_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES story_chapters(id) ON DELETE SET NULL,
  sentence_id INTEGER REFERENCES story_sentences(id) ON DELETE SET NULL,
  content_unit_id INTEGER REFERENCES story_content_units(id) ON DELETE SET NULL,
  progress_percentage REAL NOT NULL DEFAULT 0,
  last_read_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, story_id)
);
