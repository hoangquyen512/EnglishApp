CREATE TABLE dictionary_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  phonetic_ipa TEXT,
  part_of_speech TEXT,
  meaning_vi TEXT,
  definition_en TEXT,
  example_en TEXT,
  source TEXT,
  cached_at TEXT DEFAULT CURRENT_TIMESTAMP
);
