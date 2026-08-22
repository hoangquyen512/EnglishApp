CREATE TABLE story_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  website TEXT,
  api_endpoint TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
