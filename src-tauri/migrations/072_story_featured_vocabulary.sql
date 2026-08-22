CREATE TABLE story_featured_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id INTEGER NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
  sentence_id INTEGER REFERENCES story_sentences(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  lemma TEXT NOT NULL,
  ipa TEXT,
  part_of_speech TEXT,
  meaning_vi TEXT NOT NULL,
  order_no INTEGER NOT NULL,
  is_featured INTEGER NOT NULL DEFAULT 1,
  audio_url TEXT
);
