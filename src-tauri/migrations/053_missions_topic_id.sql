ALTER TABLE daily_missions ADD COLUMN topic_id INTEGER REFERENCES topics(id);
