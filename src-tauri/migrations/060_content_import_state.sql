CREATE TABLE content_import_state (
  dataset TEXT NOT NULL,
  topic_code TEXT NOT NULL,
  content_version TEXT NOT NULL,
  imported_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dataset, topic_code)
);
