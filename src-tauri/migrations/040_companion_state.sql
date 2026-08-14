CREATE TABLE companion_state (
  user_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'beginner',
  mood TEXT NOT NULL DEFAULT 'unknown',
  mood_note TEXT,
  memory_summary TEXT NOT NULL DEFAULT '',
  last_checkin_on TEXT,
  pending_level_direction TEXT,
  updated_at TEXT NOT NULL
);
