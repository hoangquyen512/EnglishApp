CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_words_learned INTEGER DEFAULT 0,
  total_phrases_learned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  progress_by_topic TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
