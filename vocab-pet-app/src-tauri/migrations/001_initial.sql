-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  category TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Learning progress (simple spaced repetition)
CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary(id),
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  last_reviewed_at TEXT,
  next_review_at TEXT,
  status TEXT DEFAULT 'new'
);

-- Pet state
CREATE TABLE IF NOT EXISTS pet_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_name TEXT DEFAULT 'Pet',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  mood TEXT DEFAULT 'happy',
  streak_days INTEGER DEFAULT 0,
  last_fed_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Study session history
CREATE TABLE IF NOT EXISTS study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary(id),
  is_correct INTEGER NOT NULL,
  answered_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seed vocabulary (10 basic English words)
INSERT INTO vocabulary (word, meaning, example, category) VALUES
  ('apple', 'a round fruit with red or green skin', 'I eat an apple every day.', 'food'),
  ('book', 'a set of printed pages bound together', 'She is reading a book.', 'objects'),
  ('water', 'a clear liquid essential for life', 'Drink more water every day.', 'nature'),
  ('happy', 'feeling pleasure or contentment', 'I feel happy when I learn new words.', 'emotions'),
  ('run', 'to move quickly on foot', 'They run in the park every morning.', 'actions'),
  ('house', 'a building where people live', 'Our house has a small garden.', 'places'),
  ('friend', 'a person you know and like', 'My friend helps me study English.', 'people'),
  ('learn', 'to gain knowledge or skill', 'We learn something new every day.', 'actions'),
  ('morning', 'the early part of the day', 'Good morning! Time to study.', 'time'),
  ('beautiful', 'pleasing to the senses or mind', 'What a beautiful day!', 'adjectives');

-- Seed learning progress for each vocabulary item
INSERT INTO learning_progress (vocabulary_id, status)
SELECT id, 'new' FROM vocabulary;

-- Seed initial pet
INSERT INTO pet_state (pet_name, level, xp, mood, streak_days, last_fed_at)
VALUES ('Pet', 1, 0, 'happy', 0, datetime('now'));
