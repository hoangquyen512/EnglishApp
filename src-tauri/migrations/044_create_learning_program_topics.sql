CREATE TABLE learning_program_topics (
  program_id INTEGER NOT NULL REFERENCES learning_program(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  PRIMARY KEY (program_id, topic_id)
);
