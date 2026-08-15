CREATE TABLE topic_conversation_banks (
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  bank_id TEXT NOT NULL,
  PRIMARY KEY (topic_id, bank_id)
);
