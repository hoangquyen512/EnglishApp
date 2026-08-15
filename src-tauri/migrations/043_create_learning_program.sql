CREATE TABLE learning_program (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  program_name TEXT DEFAULT 'Chương trình học của tôi',
  level_preference TEXT DEFAULT 'A2',
  content_type_preference TEXT DEFAULT 'both',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
