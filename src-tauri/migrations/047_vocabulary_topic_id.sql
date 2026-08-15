ALTER TABLE vocabulary ADD COLUMN topic_id INTEGER REFERENCES topics(id);
