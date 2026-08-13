CREATE TABLE daily_missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_date TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  current_count INTEGER DEFAULT 0,
  topic TEXT,
  xp_reward INTEGER DEFAULT 10,
  is_completed INTEGER DEFAULT 0
);
