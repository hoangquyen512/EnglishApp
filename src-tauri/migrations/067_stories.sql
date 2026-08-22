CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  description_en TEXT,
  description_vi TEXT,
  author_id INTEGER,
  source_id INTEGER REFERENCES story_sources(id),
  cover_url TEXT,
  cefr_level TEXT NOT NULL,
  genre TEXT,
  estimated_read_minutes INTEGER,
  publication_year INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
